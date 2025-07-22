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
  try {
    const data = fs.readFileSync(vagasPath, 'utf8').trim();
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler vagas.json:', err);
    return [];
  }
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
  try {
    console.log("REQUISIÇÃO RECEBIDA: ", req.body); // <-- debug
    const vagas = lerVagas(); // pode dar erro aqui
    const novaVaga = req.body;
    novaVaga.id = Date.now();
    vagas.push(novaVaga);
    salvarVagas(vagas); // ou aqui
    res.status(201).json({ mensagem: 'Vaga criada com sucesso' });
  } catch (erro) {
    console.error("ERRO AO SALVAR VAGA:", erro); // <-- Mostra erro no terminal
    res.status(500).json({ erro: "Erro interno ao salvar vaga." });
  }
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
