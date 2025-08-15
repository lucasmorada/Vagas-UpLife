const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Render precisa disso

// Middleware
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Arquivos JSON dentro de /data
const vagasPath = path.join(__dirname, 'data', 'vagas.json');
const solicitacoesPath = path.join(__dirname, 'data', 'solicitacoes.json');

// Função para ler JSON
function lerArquivo(caminho) {
  if (!fs.existsSync(caminho)) return [];
  try {
    const data = fs.readFileSync(caminho, 'utf8').trim();
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error(`Erro ao ler ${caminho}:`, err);
    return [];
  }
}

// Função para salvar JSON
function salvarArquivo(caminho, conteudo) {
  fs.writeFileSync(caminho, JSON.stringify(conteudo, null, 2));
}

// Rotas de vagas
app.get('/api/vagas', (req, res) => {
  res.json(lerArquivo(vagasPath));
});

app.get('/api/vagas/:id', (req, res) => {
  const vagas = lerArquivo(vagasPath);
  const vaga = vagas.find(v => v.id == req.params.id);
  if (vaga) res.json(vaga);
  else res.status(404).json({ erro: 'Vaga não encontrada' });
});

app.post('/api/vagas', (req, res) => {
  const vagas = lerArquivo(vagasPath);
  const novaVaga = req.body;
  novaVaga.id = Date.now();
  vagas.push(novaVaga);
  salvarArquivo(vagasPath, vagas);
  res.status(201).json({ mensagem: 'Vaga criada com sucesso' });
});

app.put('/api/vagas/:id', (req, res) => {
  const vagas = lerArquivo(vagasPath);
  const index = vagas.findIndex(v => v.id == req.params.id);
  if (index !== -1) {
    vagas[index] = { ...req.body, id: parseInt(req.params.id) };
    salvarArquivo(vagasPath, vagas);
    res.json({ mensagem: 'Vaga atualizada com sucesso' });
  } else {
    res.status(404).json({ erro: 'Vaga não encontrada' });
  }
});

app.delete('/api/vagas/:id', (req, res) => {
  let vagas = lerArquivo(vagasPath);
  vagas = vagas.filter(v => v.id != req.params.id);
  salvarArquivo(vagasPath, vagas);
  res.json({ mensagem: 'Vaga excluída com sucesso' });
});

// Rotas para solicitações
app.get('/api/solicitacoes', (req, res) => {
  res.json(lerArquivo(solicitacoesPath));
});

app.post('/api/solicitacoes', (req, res) => {
  const solicitacoes = lerArquivo(solicitacoesPath);
  const nova = { id: Date.now(), ...req.body };
  solicitacoes.push(nova);
  salvarArquivo(solicitacoesPath, solicitacoes);
  res.status(201).json({ mensagem: 'Solicitação criada com sucesso' });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Para qualquer rota desconhecida, servir index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
