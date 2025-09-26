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

// ====================== FUNÇÃO DE INICIALIZAÇÃO ======================
async function initDB() {
  try {
    // Testa conexão
    const test = await pool.query("SELECT NOW()");
    console.log("✅ Conectado ao DB em:", test.rows[0].now);

    // Cria tabela vagas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vagas (
        id BIGSERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        empresa TEXT,
        localizacao TEXT,
        salario NUMERIC,
        local TEXT,
        tecnico BOOLEAN,
        area TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cria tabela solicitacoes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solicitacoes (
        id BIGSERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        mensagem TEXT,
        vaga_id BIGINT REFERENCES vagas(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tabelas verificadas/criadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao inicializar tabelas ou conectar ao DB:", err);
    process.exit(1); // encerra app se não conseguir conectar
  }
}

// ====================== MIDDLEWARES ======================
app.use(express.json());
app.use(cors());
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
    const { titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link } = req.body;

    const result = await pool.query(
      `INSERT INTO vagas (titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link)
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

// Buscar vaga por ID
app.get("/api/vagas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM vagas WHERE id=$1", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Vaga não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar vaga por ID:", err);
    res.status(500).json({ error: "Erro ao buscar vaga" });
  }
});


// Editar vaga
app.put("/api/vagas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link } = req.body;

    const result = await pool.query(
      `UPDATE vagas SET titulo=$1, descricao=$2, empresa=$3, localizacao=$4, salario=$5, local=$6, tecnico=$7, area=$8, link=$9
       WHERE id=$10 RETURNING *`,
      [titulo, descricao, empresa, localizacao, salario, local, tecnico, area, link, id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Vaga não encontrada" });

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

// ====================== ROTAS DE SOLICITAÇÕES ======================
app.get("/api/solicitacoes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM solicitacoes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar solicitações:", err);
    res.status(500).json({ error: "Erro ao buscar solicitações" });
  }
});

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
(async () => {
  await initDB(); // garante tabelas antes de iniciar
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
})();
