const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexão OK:', res.rows[0]);
  } catch (err) {
    console.error('Erro de conexão com o PostgreSQL:', err);
  } finally {
    await pool.end();
  }
})();
