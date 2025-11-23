// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { poolPromise, sql } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// servir frontend estático (carpeta ../frontend)
const staticPath = path.join(__dirname, '..', 'frontend');
console.log('Sirviendo frontend desde:', staticPath);
app.use(express.static(staticPath));

// routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/productos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Productos');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});

// POST para crear producto (opcional)
app.post('/api/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || precio == null) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('precio', sql.Decimal(10,2), precio)
      .query('INSERT INTO Productos (Nombre, Precio) VALUES (@nombre, @precio); SELECT SCOPE_IDENTITY() AS id;');
    const id = result.recordset?.[0]?.id ?? null;
    res.status(201).json({ id, nombre, precio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar' });
  }
});

// otro endpoint para eleiminar
// eliminar producto por id
app.delete('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id inválido' });
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Productos WHERE Id = @id; SELECT @@ROWCOUNT AS deleted;');
    const deleted = result.recordset?.[0]?.deleted || 0;
    if (deleted === 0) return res.status(404).json({ error: 'No existe producto' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error al eliminar:', err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// otro endpoint de editar
app.put('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio } = req.body;
  if (!id || !nombre || precio == null) return res.status(400).json({ error: 'Datos inválidos' });
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('precio', sql.Decimal(10,2), precio)
      .query('UPDATE Productos SET Nombre=@nombre, Precio=@precio WHERE Id=@id; SELECT @@ROWCOUNT AS updated;');
    const updated = result.recordset?.[0]?.updated || 0;
    if (updated === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ updated: true });
  } catch (err) {
    console.error('Error al editar:', err);
    res.status(500).json({ error: 'Error al editar' });
  }
});



// fallback para la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
