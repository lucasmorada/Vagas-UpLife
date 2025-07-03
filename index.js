const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Pasta onde estão os arquivos HTML e JS do frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Permitir JSON no corpo das requisições
app.use(express.json());
app.use(cors());

const vagasPath = path.join(__dirname, '..', 'data', 'vagas.json');

// Função para ler vagas do arquivo
function lerVagas() {
  if (!fs.existsSync(vagasPath)) return [];
  const data = fs.readFileSync(vagasPath);
  return JSON.parse(data);
}

// Função para salvar vagas
function salvarVagas(vagas) {
  fs.writeFileSync(vagasPath, JSON.stringify(vagas, null, 2));
}

// ➤ GET /api/vagas - Listar todas as vagas
app.get('/api/vagas', (req, res) => {
  const vagas = lerVagas();
  res.json(vagas);
});

// ➤ GET /api/vagas/:id - Buscar uma vaga específica
app.get('/api/vagas/:id', (req, res) => {
  const vagas = lerVagas();
  const vaga = vagas.find(v => v.id == req.params.id);
  if (vaga) res.json(vaga);
  else res.status(404).json({ erro: 'Vaga não encontrada' });
});

// ➤ POST /api/vagas - Criar nova vaga
app.post('/api/vagas', (req, res) => {
  const vagas = lerVagas();
  const novaVaga = req.body;
  novaVaga.id = Date.now();
  vagas.push(novaVaga);
  salvarVagas(vagas);
  res.status(201).json({ mensagem: 'Vaga criada com sucesso' });
});

// ➤ PUT /api/vagas/:id - Atualizar vaga
app.put('/api/vagas/:id', (req, res) => {
  const vagas = lerVagas();
  const index = vagas.findIndex(v => v.id == req.params.id);
  if (index !== -1) {
    vagas[index] = { ...req.body, id: parseInt(req.params.id) };
    salvarVagas(vagas);
    res.json({ mensagem: 'Vaga atualizada com sucesso' });
  } else {
    res.status(404).json({ erro: 'Vaga não encontrada' });
  }
});

// ➤ DELETE /api/vagas/:id - Excluir vaga
app.delete('/api/vagas/:id', (req, res) => {
  let vagas = lerVagas();
  const id = parseInt(req.params.id);
  vagas = vagas.filter(v => v.id !== id);
  salvarVagas(vagas);
  res.json({ mensagem: 'Vaga excluída com sucesso' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
