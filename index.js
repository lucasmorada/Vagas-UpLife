const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Caminho para o vagas.json dentro da pasta data
const VAGAS_PATH = path.join(__dirname, 'data', 'vagas.json');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler vagas de forma segura
function lerVagas() {
  try {
    if (!fs.existsSync(VAGAS_PATH)) {
      fs.writeFileSync(VAGAS_PATH, '[]'); // cria arquivo vazio se não existir
    }
    const data = fs.readFileSync(VAGAS_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Erro ao ler vagas.json:', err);
    return [];
  }
}

// Função para salvar vagas
function salvarVagas(vagas) {
  try {
    fs.writeFileSync(VAGAS_PATH, JSON.stringify(vagas, null, 2));
  } catch (err) {
    console.error('Erro ao salvar vagas.json:', err);
  }
}

// ================= ROTAS =================

// GET todas as vagas
app.get('/api/vagas', (req, res) => {
  try {
    const vagas = lerVagas();
    res.json(vagas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar vagas' });
  }
});

// GET vaga por ID
app.get('/api/vagas/:id', (req, res) => {
  try {
    const vagas = lerVagas();
    const vaga = vagas.find(v => v.id === parseInt(req.params.id));
    if (vaga) res.json(vaga);
    else res.status(404).json({ erro: 'Vaga não encontrada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar vaga' });
  }
});

// POST criar vaga
app.post('/api/vagas', (req, res) => {
  try {
    const vagas = lerVagas();
    const { titulo, descricao, area, link, curso, tecnicoCompetencia } = req.body;

    const novaVaga = {
      id: vagas.length > 0 ? vagas[vagas.length - 1].id + 1 : 1,
      titulo,
      descricao,
      area,
      link,
      curso,
      tecnicoCompetencia: tecnicoCompetencia || false
    };

    vagas.push(novaVaga);
    salvarVagas(vagas);

    res.status(201).json({ mensagem: 'Vaga criada com sucesso', vaga: novaVaga });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar vaga' });
  }
});

// PUT atualizar vaga
app.put('/api/vagas/:id', (req, res) => {
  try {
    const vagas = lerVagas();
    const index = vagas.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ erro: 'Vaga não encontrada' });

    const { titulo, descricao, area, link, curso, tecnicoCompetencia } = req.body;
    vagas[index] = { ...vagas[index], titulo, descricao, area, link, curso, tecnicoCompetencia };
    salvarVagas(vagas);

    res.json({ mensagem: 'Vaga atualizada com sucesso', vaga: vagas[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar vaga' });
  }
});

// DELETE excluir vaga
app.delete('/api/vagas/:id', (req, res) => {
  try {
    const vagas = lerVagas();
    const index = vagas.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ erro: 'Vaga não encontrada' });

    vagas.splice(index, 1);
    salvarVagas(vagas);

    res.json({ mensagem: 'Vaga excluída com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir vaga' });
  }
});

// ================ ROTA CURINGA PARA FRONTEND ================
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // rotas da API seguem normalmente
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
