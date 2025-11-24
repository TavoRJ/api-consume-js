// backend/db.js
const sql = require('mssql');
require('dotenv').config();

const useInstance = !!process.env.DB_INSTANCE;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE,
  port: useInstance ? undefined : parseInt(process.env.DB_PORT || '1433'),
  options: {
    trustServerCertificate: true,
    ...(useInstance ? { instanceName: process.env.DB_INSTANCE } : {})
  }
};

console.log('DB config:', { server: config.server, port: config.port, instanceName: process.env.DB_INSTANCE || null });

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('DB Connection Error:', err.message || err);
    process.exit(1);
  });

module.exports = { sql, poolPromise };
