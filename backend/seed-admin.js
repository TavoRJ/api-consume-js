// backend/seed-admin.js
// crea un usuario admin por defecto si no existe
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('./db'); // usa tu db.js existente
require('dotenv').config();

(async () => {
  try {
    const pool = await poolPromise;
    const username = 'admin';
    const password = 'admin1234';
    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('username', sql.NVarChar(100), username)
      .input('passwordHash', sql.NVarChar(500), hash)
      .input('role', sql.NVarChar(50), 'admin')
      .query(`IF NOT EXISTS (SELECT 1 FROM Users WHERE Username=@username)
              INSERT INTO Users (Username, PasswordHash, Role) VALUES (@username,@passwordHash,@role)`);

    console.log('Admin creado. Usuario:', username, 'Password:', password);
    process.exit(0);
  } catch (e) {
    console.error('Error en seed-admin:', e);
    process.exit(1);
  }
})();
