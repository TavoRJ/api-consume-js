// backend/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('./db'); // usar poolPromise
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';
const SALT_ROUNDS = 10;

function createToken(user) {
  return jwt.sign(
    { id: user.Id, username: user.Username, role: user.Role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const pool = await poolPromise;
    const exists = await pool.request()
      .input('username', sql.NVarChar(100), username)
      .query('SELECT Id FROM Users WHERE Username = @username');

    if (exists.recordset.length) return res.status(409).json({ error: 'Usuario ya existe' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.request()
      .input('username', sql.NVarChar(100), username)
      .input('passwordHash', sql.NVarChar(256), hash)
      .input('role', sql.NVarChar(50), role || 'usuario')
      .query('INSERT INTO Users (Username, PasswordHash, Role) VALUES (@username, @passwordHash, @role)');

    res.json({ ok: true });
  } catch (err) {
    console.error('register err', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar(100), username)
      .query('SELECT Id, Username, PasswordHash, Role FROM Users WHERE Username = @username');

    const user = result.recordset?.[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = createToken(user);
    res.json({ token, user: { id: user.Id, username: user.Username, role: user.Role } });
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});

// cambiar contraseña
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Faltan datos' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });

  try {
    // El middleware authenticateToken debe ejecutarse antes que este handler.
    // Pero como aquí es parte del mismo router, lo podemos aplicar en la ruta cuando la uses.
    // Recuperamos user id del token: req.user debe existir si aplicas authenticateToken.
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT PasswordHash FROM Users WHERE Id = @id');

    const userRow = result.recordset?.[0];
    if (!userRow) return res.status(404).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(currentPassword, userRow.PasswordHash);
    if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.request()
      .input('id', sql.Int, userId)
      .input('hash', sql.NVarChar(500), newHash)
      .query('UPDATE Users SET PasswordHash = @hash WHERE Id = @id');

    res.json({ ok: true, message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});


// Middleware: autenticar token
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'No autorizado' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = payload;
    next();
  });
}

// Middleware roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }
    next();
  };
}

module.exports = { authRouter: router, authenticateToken, authorizeRoles };
