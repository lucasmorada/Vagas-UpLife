const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000; // Render precisa disso

// Conexão com PostgreSQL (Render fornece DATABASE_URL no ambiente)
const pool = new Pool({
  connectionString: process.env.DATABASEURL,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

//
// ROTAS DE VAGAS
//

// GET todas as vagas
app.get('/api/vagas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vagas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar vagas' });
  }
});

// GET vaga por ID
app.get('/api/vagas/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vagas WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ erro: 'Vaga não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar vaga' });
  }
});

// POST criar vaga
app.post('/api/vagas', async (req, res) => {
  const { titulo, descricao, area, cursos, tecnico_competencia } = req.body;
  try {
    await pool.query(
      'INSERT INTO vagas (titulo, descricao, area, cursos, tecnico_competencia) VALUES ($1, $2, $3, $4, $5)',
      [titulo, descricao, area, cursos, tecnico_competencia || false]
    );
    res.status(201).json({ mensagem: 'Vaga criada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar vaga' });
  }
});

// PUT atualizar vaga
app.put('/api/vagas/:id', async (req, res) => {
  const { titulo, descricao, area, cursos, tecnico_competencia } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vagas SET titulo=$1, descricao=$2, area=$3, cursos=$4, tecnico_competencia=$5 WHERE id=$6',
      [titulo, descricao, area, cursos, tecnico_competencia, req.params.id]
    );
    if (result.rowCount > 0) {
      res.json({ mensagem: 'Vaga atualizada com sucesso' });
    } else {
      res.status(404).json({ erro: 'Vaga não encontrada' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar vaga' });
  }
});

// DELETE excluir vaga
app.delete('/api/vagas/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vagas WHERE id=$1', [req.params.id]);
    if (result.rowCount > 0) {
      res.json({ mensagem: 'Vaga excluída com sucesso' });
    } else {
      res.status(404).json({ erro: 'Vaga não encontrada' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir vaga' });
  }
});

//
// ROTAS DE SOLICITAÇÕES
//

// GET todas as solicitações
app.get('/api/solicitacoes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM solicitacoes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar solicitações' });
  }
});

// POST criar solicitação
app.post('/api/solicitacoes', async (req, res) => {
  const { nome, email, mensagem } = req.body;
  try {
    await pool.query(
      'INSERT INTO solicitacoes (nome, email, mensagem) VALUES ($1, $2, $3)',
      [nome, email, mensagem]
    );
    res.status(201).json({ mensagem: 'Solicitação criada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar solicitação' });
  }
});

//
// ROTA CURINGA PARA FRONTEND
//
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // passa para 404 API
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
