const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000; // Render precisa disso

// Middleware
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com Postgres (Render → Environment Variables → DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // necessário no Render
});


// ==================== ROTAS DE VAGAS ====================

// Listar todas as vagas
app.get('/api/vagas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vagas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Buscar uma vaga por ID
app.get('/api/vagas/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vagas WHERE id=$1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ erro: 'Vaga não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Criar nova vaga
app.post('/api/vagas', async (req, res) => {
  try {
    const { titulo, descricao, salario, area, cursos, tecnico_competencia } = req.body;
    const result = await pool.query(
      'INSERT INTO vagas (titulo, descricao, salario, area, cursos, tecnico_competencia) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, descricao, salario, area, cursos, tecnico_competencia]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Atualizar vaga por ID
app.put('/api/vagas/:id', async (req, res) => {
  try {
    const { titulo, descricao, salario, area, cursos, tecnico_competencia } = req.body;
    const result = await pool.query(
      'UPDATE vagas SET titulo=$1, descricao=$2, salario=$3, area=$4, cursos=$5, tecnico_competencia=$6 WHERE id=$7 RETURNING *',
      [titulo, descricao, salario, area, cursos, tecnico_competencia, req.params.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ erro: 'Vaga não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Deletar vaga
app.delete('/api/vagas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vagas WHERE id=$1', [req.params.id]);
    res.json({ mensagem: 'Vaga excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// ==================== ROTAS DE SOLICITAÇÕES ====================
// (ainda usando JSON? ou quer que já crie tabela no Postgres?)

app.get('/api/solicitacoes', (req, res) => {
  res.json({ mensagem: 'Em breve no Postgres 😎' });
});

app.post('/api/solicitacoes', (req, res) => {
  res.json({ mensagem: 'Em breve no Postgres 😎' });
});


// ==================== ROTA CURINGA ====================
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // passa para 404 API
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ==================== INICIA SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
