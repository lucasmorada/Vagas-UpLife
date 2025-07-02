const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para aceitar JSON no body
app.use(express.json());
app.use(cors());

// Servir os arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, 'vagas-uplife', 'public')));

// Rota raiz para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'vagas-uplife', 'public', 'index.html'));
});

// --- Exemplo de rotas para as vagas, usando arquivos JSON na pasta data ---

const vagasFile = path.join(__dirname, 'data', 'vagas.json');
const vagasPersonalizadasFile = path.join(__dirname, 'data', 'vagasPersonalizadas.json');

// Ler JSON
function lerArquivo(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const dados = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(dados || '[]');
}

// Escrever JSON
function escreverArquivo(filePath, dados) {
  fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf8');
}

// Rotas para Vagas
app.get('/api/vagas', (req, res) => {
  const vagas = lerArquivo(vagasFile);
  res.json(vagas);
});

app.post('/api/vagas', (req, res) => {
  const vagas = lerArquivo(vagasFile);
  const novaVaga = req.body;

  // Gera um id simples (timestamp)
  novaVaga.id = Date.now();
  vagas.push(novaVaga);
  escreverArquivo(vagasFile, vagas);
  res.status(201).json(novaVaga);
});

app.put('/api/vagas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const vagas = lerArquivo(vagasFile);
  const vagaIndex = vagas.findIndex(v => v.id === id);

  if (vagaIndex < 0) return res.status(404).json({ error: 'Vaga não encontrada' });

  vagas[vagaIndex] = { ...vagas[vagaIndex], ...req.body, id };
  escreverArquivo(vagasFile, vagas);
  res.json(vagas[vagaIndex]);
});

app.delete('/api/vagas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let vagas = lerArquivo(vagasFile);
  vagas = vagas.filter(v => v.id !== id);
  escreverArquivo(vagasFile, vagas);
  res.status(204).send();
});

// Rotas para Vagas Personalizadas
app.get('/api/vagas-personalizadas', (req, res) => {
  const vagas = lerArquivo(vagasPersonalizadasFile);
  res.json(vagas);
});
 
app.post('/api/vagas-personalizadas', (req, res) => {
  const vagas = lerArquivo(vagasPersonalizadasFile);
  const novaVaga = req.body;
  novaVaga.id = Date.now();
  vagas.push(novaVaga);
  escreverArquivo(vagasPersonalizadasFile, vagas);
  res.status(201).json(novaVaga);
});

app.delete('/api/vagas-personalizadas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let vagas = lerArquivo(vagasPersonalizadasFile);
  vagas = vagas.filter(v => v.id !== id);
  escreverArquivo(vagasPersonalizadasFile, vagas);
  res.status(204).send();
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
