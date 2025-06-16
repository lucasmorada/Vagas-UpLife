const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const VAGAS_PATH = path.join(__dirname, 'vagas.json');

app.use(cors());
app.use(bodyParser.json());

// Ajuste para servir arquivos estáticos da raiz (onde estão index.html, admin.html etc)
app.use(express.static(__dirname));

// Funções para ler e salvar vagas
function carregarVagas() {
  if (!fs.existsSync(VAGAS_PATH)) fs.writeFileSync(VAGAS_PATH, '[]');
  return JSON.parse(fs.readFileSync(VAGAS_PATH, 'utf8'));
}

function salvarVagas(vagas) {
  fs.writeFileSync(VAGAS_PATH, JSON.stringify(vagas, null, 2), 'utf8');
}

// Rotas da API
app.get('/api/vagas', (req, res) => {
  res.json(carregarVagas());
});

app.post('/api/vagas', (req, res) => {
  const vagas = carregarVagas();
  const novaVaga = { ...req.body, id: Date.now() };
  vagas.push(novaVaga);
  salvarVagas(vagas);
  res.json({ sucesso: true, vaga: novaVaga });
});

app.put('/api/vagas/:id', (req, res) => {
  let vagas = carregarVagas();
  const id = parseInt(req.params.id);
  vagas = vagas.map(v => (v.id === id ? { ...req.body, id } : v));
  salvarVagas(vagas);
  res.json({ sucesso: true });
});

app.delete('/api/vagas/:id', (req, res) => {
  let vagas = carregarVagas();
  const id = parseInt(req.params.id);
  vagas = vagas.filter(v => v.id !== id);
  salvarVagas(vagas);
  res.json({ sucesso: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
