const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Caminhos para os arquivos JSON
const vagasFile = path.join(__dirname, '../data/vagas.json');
const cursosFile = path.join(__dirname, '../data/cursos.json');
const solicitacoesFile = path.join(__dirname, '../data/solicitacoes.json');

// ---------------- ROTAS VAGAS ---------------- //
app.get('/api/vagas', (req, res) => {
  const vagas = JSON.parse(fs.readFileSync(vagasFile));
  res.json(vagas);
});

app.get('/api/vagas/:id', (req, res) => {
  const vagas = JSON.parse(fs.readFileSync(vagasFile));
  const vaga = vagas.find(v => v.id == req.params.id);
  res.json(vaga || {});
});

app.post('/api/vagas', (req, res) => {
  const vagas = JSON.parse(fs.readFileSync(vagasFile));
  const novaVaga = { id: Date.now(), ...req.body };
  vagas.push(novaVaga);
  fs.writeFileSync(vagasFile, JSON.stringify(vagas, null, 2));
  res.status(201).json(novaVaga);
});

app.put('/api/vagas/:id', (req, res) => {
  let vagas = JSON.parse(fs.readFileSync(vagasFile));
  const index = vagas.findIndex(v => v.id == req.params.id);
  if (index !== -1) {
    vagas[index] = { ...vagas[index], ...req.body };
    fs.writeFileSync(vagasFile, JSON.stringify(vagas, null, 2));
    res.json(vagas[index]);
  } else {
    res.status(404).json({ error: "Vaga não encontrada" });
  }
});

app.delete('/api/vagas/:id', (req, res) => {
  let vagas = JSON.parse(fs.readFileSync(vagasFile));
  vagas = vagas.filter(v => v.id != req.params.id);
  fs.writeFileSync(vagasFile, JSON.stringify(vagas, null, 2));
  res.status(204).end();
});

// ------------- ROTAS SOLICITAÇÕES PERSONALIZADAS ------------- //
app.get('/api/vagasPersonalizadas', (req, res) => {
  const dados = JSON.parse(fs.readFileSync(solicitacoesFile));
  res.json(dados);
});

app.post('/api/vagasPersonalizadas', (req, res) => {
  const dados = JSON.parse(fs.readFileSync(solicitacoesFile));
  dados.push(req.body);
  fs.writeFileSync(solicitacoesFile, JSON.stringify(dados, null, 2));
  res.status(201).json(req.body);
});

app.delete('/api/vagasPersonalizadas/:index', (req, res) => {
  const dados = JSON.parse(fs.readFileSync(solicitacoesFile));
  dados.splice(req.params.index, 1);
  fs.writeFileSync(solicitacoesFile, JSON.stringify(dados, null, 2));
  res.status(204).end();
});

// ---------------- INICIAR SERVIDOR ---------------- //
app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
