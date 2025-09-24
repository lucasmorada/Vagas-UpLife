const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====================== CONFIGURAÇÃO DO BANCO ======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====================== CRIAÇÃO DE TABELAS AUTOMÁTICA ======================
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vagas (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        empresa TEXT,
        localizacao TEXT,
        salario TEXT,
        local TEXT,
        tecnico BOOLEAN,
        area TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS solicitacoes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        mensagem TEXT,
        vaga_id INT REFERENCES vagas(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tabelas verificadas/criadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao inicializar tabelas:", err);
  }
}

// ====================== MIDDLEWARES ======================
app.use(express.json());
app.use(cors());

// Servir frontend da pasta public
app.use(express.static(path.join(__dirname, "public")));

// ====================== ROTAS DE VAGAS ======================

// Listar vagas
app.get("/api/vagas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vagas ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar vagas:", err);
    res.status(500).json({ error: "Erro ao buscar vagas" });
  }
});

// Criar vaga
app.post("/api/vagas", async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      empresa,
      localizacao,
      salario,
      local,
      tecnico,
      area,
      link,
    } = req.body;

     console.log("POST /api/vagas body:", req.body);

    const result = await pool.query(
      `INSERT INTO vagas 
        (titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING *`,
      [titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar vaga:", err);
    res.status(500).json({ error: "Erro ao criar vaga" });
  }
});

// Editar vaga
app.put("/api/vagas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      empresa,
      localizacao,
      salario,
      local,
      tecnico,
      area,
      link,
    } = req.body;

    const result = await pool.query(
      `UPDATE vagas 
       SET titulo=$1, descricao=$2, empresa=$3, localizacao=$4, salario=$5, local=$6, tecnico=$7, area=$8, link=$9
       WHERE id=$10 RETURNING *`,
      [titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar vaga:", err);
    res.status(500).json({ error: "Erro ao atualizar vaga" });
  }
});

// Excluir vaga
app.delete("/api/vagas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM vagas WHERE id=$1", [id]);
    res.json({ message: "Vaga excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir vaga:", err);
    res.status(500).json({ error: "Erro ao excluir vaga" });
  }
});

// Buscar vaga por ID
app.get("/api/vagas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM vagas WHERE id=$1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vaga não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar vaga:", err);
    res.status(500).json({ error: "Erro ao buscar vaga" });
  }
});

// ====================== ROTAS DE SOLICITAÇÕES ======================

// Listar solicitações
app.get("/api/solicitacoes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM solicitacoes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar solicitações:", err);
    res.status(500).json({ error: "Erro ao buscar solicitações" });
  }
});

// Criar solicitação
app.post("/api/solicitacoes", async (req, res) => {
  try {
    const { nome, email, telefone, mensagem, vaga_id } = req.body;

    const result = await pool.query(
      `INSERT INTO solicitacoes (nome, email, telefone, mensagem, vaga_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nome, email, telefone, mensagem, vaga_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar solicitação:", err);
    res.status(500).json({ error: "Erro ao criar solicitação" });
  }
});

// ====================== INICIAR SERVIDOR ======================
app.listen(PORT, async () => {
  await initDB(); // garante tabelas na inicialização
  console.log(`Servidor rodando na porta ${PORT}`);
});
