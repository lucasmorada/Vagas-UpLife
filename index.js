const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Caminho para o arquivo de vagas
const vagasPath = path.join(__dirname, '../data/vagas.json');

// Middleware para ler JSON
app.use(express.json());

// Liberar acesso ao frontend
app.use(express.static(path.join(__dirname, '../public')));

// Rota GET para retornar todas as vagas
app.get('/api/vagas', (req, res) => {
  fs.readFile(vagasPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler vagas:', err);
      return res.status(500).json({ error: 'Erro ao ler vagas' });
    }
    res.json(JSON.parse(data));
  });
});

// Rota POST para adicionar uma nova vaga
app.post('/api/vagas', (req, res) => {
  const novaVaga = req.body;

  fs.readFile(vagasPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler vagas' });

    const vagas = JSON.parse(data);
    vagas.push(novaVaga);

    fs.writeFile(vagasPath, JSON.stringify(vagas, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar vaga' });
      res.status(201).json({ message: 'Vaga adicionada com sucesso' });
    });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
