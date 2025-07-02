const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para JSON e arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Caminhos para os arquivos de dados
const vagasPath = path.join(__dirname, 'data', 'vagas.json');
const solicitacoesPath = path.join(__dirname, 'data', 'solicitacoes.json');

// Utilitário para ler arquivo JSON
function lerArquivoJSON(caminho) {
  if (!fs.existsSync(caminho)) return [];
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(conteudo || '[]');
}

// Utilitário para salvar JSON
function salvarArquivoJSON(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

//
// === ROTAS DAS VAGAS ===
//
app.get('/api/vagas', (req, res) => {
  const vagas = lerArquivoJSON(vagasPath);
  res.json(vagas);
});

app.get('/api/vagas/:id', (req, res) => {
  const vagas = lerArquivoJSON(vagasPath);
  const vaga = vagas.find(v => v.id == req.params.id);
  if (vaga) res.json(vaga);
  else res.status(404).json({ erro: 'Vaga não encontrada' });
});

app.post('/api/vagas', (req, res) => {
  const vagas = lerArquivoJSON(vagasPath);
  const novaVaga = req.body;
  novaVaga.id = Date.now();
  vagas.push(novaVaga);
  salvarArquivoJSON(vagasPath, vagas);
  res.status(201).json(novaVaga);
});

app.put('/api/vagas/:id', (req, res) => {
  let vagas = lerArquivoJSON(vagasPath);
  const index = vagas.findIndex(v => v.id == req.params.id);
  if (index > -1) {
    vagas[index] = { ...req.body, id: parseInt(req.params.id) };
    salvarArquivoJSON(vagasPath, vagas);
    res.json(vagas[index]);
  } else {
    res.status(404).json({ erro: 'Vaga não encontrada' });
  }
});

app.delete('/api/vagas/:id', (req, res) => {
  let vagas = lerArquivoJSON(vagasPath);
  vagas = vagas.filter(v => v.id != req.params.id);
  salvarArquivoJSON(vagasPath, vagas);
  res.json({ mensagem: 'Vaga excluída com sucesso' });
});

//
// === ROTAS DE SOLICITAÇÕES PERSONALIZADAS ===
//
app.get('/api/solicitacoes', (req, res) => {
  const dados = lerArquivoJSON(solicitacoesPath);
  res.json(dados);
});

app.post('/api/solicitacoes', (req, res) => {
  const dados = lerArquivoJSON(solicitacoesPath);
  const nova = req.body;
  nova.data = new Date().toLocaleString();
  dados.push(nova);
  salvarArquivoJSON(solicitacoesPath, dados);
  res.status(201).json(nova);
});

//
// === INICIAR SERVIDOR ===
//
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
