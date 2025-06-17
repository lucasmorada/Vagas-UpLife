const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_DB = path.join(__dirname, 'vagas.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler vagas do arquivo JSON
function lerVagas() {
  try {
    const data = fs.readFileSync(FILE_DB, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Função para salvar vagas no arquivo JSON
function salvarVagas(vagas) {
  fs.writeFileSync(FILE_DB, JSON.stringify(vagas, null, 2));
}

// GET /api/vagas - lista todas as vagas
app.get('/api/vagas', (req, res) => {
  const vagas = lerVagas();
  res.json(vagas);
});

// POST /api/vagas - cria nova vaga
app.post('/api/vagas', (req, res) => {
  const vagas = lerVagas();
  const novaVaga = req.body;

  // Atribui ID único incremental
  const maxId = vagas.reduce((max, v) => v.id > max ? v.id : max, 0);
  novaVaga.id = maxId + 1;

  vagas.push(novaVaga);
  salvarVagas(vagas);

  res.status(201).json(novaVaga);
});

// DELETE /api/vagas/:id - exclui vaga pelo id
app.delete('/api/vagas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let vagas = lerVagas();

  const vagaIndex = vagas.findIndex(v => v.id === id);
  if (vagaIndex === -1) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }

  vagas.splice(vagaIndex, 1);
  salvarVagas(vagas);

  res.json({ message: 'Vaga excluída com sucesso' });
});

// Rota padrão para servir o admin.html (assumindo que está em public/admin.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
