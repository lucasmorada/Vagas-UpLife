const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function test() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Conectou com sucesso! Data/hora do DB:", res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error("Erro de conexão com o PostgreSQL:", err);
  }
}

test();
