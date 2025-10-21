import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Funções auxiliares
function readData() {
  try {
    const data = readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], earnings: [], tops: [] };
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===== ROTAS DE AUTENTICAÇÃO =====

app.post('/api/auth/register', (req, res) => {
  const { email, nome, senha } = req.body;
  
  if (!email || !nome || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  const data = readData();
  
  // Verificar se email já existe
  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }
  
  // Criar novo usuário
  const newUser = {
    email,
    nome,
    senha, // Em produção, use hash!
    role: 'user'
  };
  
  data.users.push(newUser);
  writeData(data);
  
  res.json({ success: true, user: { email, nome, role: 'user' } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  const data = readData();
  const user = data.users.find(u => (u.email === email || u.nome === email) && u.senha === senha);
  
  if (!user) {
    return res.status(401).json({ error: 'Email/nome ou senha inválidos' });
  }
  
  res.json({ success: true, user: { email: user.email, nome: user.nome, role: user.role } });
});

// ===== ROTAS DE EARNINGS =====

app.get('/api/earnings', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  const data = readData();
  const userEarnings = data.earnings.filter(e => e.email === email);
  
  res.json(userEarnings);
});

app.post('/api/earnings', (req, res) => {
  const { email, valor, moeda, duracao, metodoPagamento, topId } = req.body;
  
  if (!email || !valor || !moeda || !duracao || !metodoPagamento) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  
  const data = readData();
  
  const newEarning = {
    id: generateId('earning'),
    email,
    data: new Date().toISOString(),
    valorEUR: moeda === 'EUR' ? parseFloat(valor) : 0,
    valorGBP: moeda === 'GBP' ? parseFloat(valor) : 0,
    valorUSD: moeda === 'USD' ? parseFloat(valor) : 0,
    duracao: parseInt(duracao),
    metodoPagamento,
    topId: topId || null
  };
  
  data.earnings.push(newEarning);
  writeData(data);
  
  res.json({ success: true, earning: newEarning });
});

app.delete('/api/earnings/:id', (req, res) => {
  const { id } = req.params;
  const { email } = req.query;
  
  const data = readData();
  const index = data.earnings.findIndex(e => e.id === id && e.email === email);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Anotação não encontrada' });
  }
  
  data.earnings.splice(index, 1);
  writeData(data);
  
  res.json({ success: true });
});

// ===== ROTAS DE TOPS =====

app.get('/api/tops/current', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  const data = readData();
  const activeTop = data.tops.find(t => t.email === email && t.status === 'ativo');
  
  if (!activeTop) {
    return res.json(null);
  }
  
  // Calcular dia atual e tempo restante
  const startDate = new Date(activeTop.dataInicio);
  const now = new Date();
  const diffMs = now - startDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(diffDays + 1, 7);
  
  // Calcular totais
  const topEarnings = data.earnings.filter(e => e.topId === activeTop.id);
  const totalEUR = topEarnings.reduce((sum, e) => sum + e.valorEUR, 0);
  const totalGBP = topEarnings.reduce((sum, e) => sum + e.valorGBP, 0);
  const totalUSD = topEarnings.reduce((sum, e) => sum + e.valorUSD, 0);
  
  res.json({
    ...activeTop,
    currentDay,
    totalEUR,
    totalGBP,
    totalUSD,
    earnings: topEarnings
  });
});

app.post('/api/tops/start', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  const data = readData();
  
  // Verificar se já tem top ativo
  const hasActiveTop = data.tops.find(t => t.email === email && t.status === 'ativo');
  if (hasActiveTop) {
    return res.status(400).json({ error: 'Já existe um top ativo' });
  }
  
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);
  
  const newTop = {
    id: generateId('top'),
    email,
    dataInicio: now.toISOString(),
    dataFim: endDate.toISOString(),
    status: 'ativo'
  };
  
  data.tops.push(newTop);
  writeData(data);
  
  res.json({ success: true, top: newTop });
});

app.post('/api/tops/stop', (req, res) => {
  const { email, topId } = req.body;
  
  if (!email || !topId) {
    return res.status(400).json({ error: 'Email e topId são obrigatórios' });
  }
  
  const data = readData();
  const top = data.tops.find(t => t.id === topId && t.email === email);
  
  if (!top) {
    return res.status(404).json({ error: 'Top não encontrado' });
  }
  
  top.status = 'parado';
  writeData(data);
  
  res.json({ success: true });
});

app.get('/api/tops/history', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  const data = readData();
  const userTops = data.tops.filter(t => t.email === email);
  
  // Calcular totais para cada top
  const topsWithTotals = userTops.map(top => {
    const topEarnings = data.earnings.filter(e => e.topId === top.id);
    const totalEUR = topEarnings.reduce((sum, e) => sum + e.valorEUR, 0);
    const totalGBP = topEarnings.reduce((sum, e) => sum + e.valorGBP, 0);
    const totalUSD = topEarnings.reduce((sum, e) => sum + e.valorUSD, 0);
    
    return {
      ...top,
      totalEUR,
      totalGBP,
      totalUSD
    };
  });
  
  res.json(topsWithTotals);
});

// ===== ROTAS ADMIN =====

app.get('/api/admin/users', (req, res) => {
  const { email } = req.query;
  
  const data = readData();
  const user = data.users.find(u => u.email === email);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  // Retornar todos os usuários sem a senha
  const users = data.users.map(u => ({ email: u.email, nome: u.nome, role: u.role }));
  res.json(users);
});

app.get('/api/admin/earnings/:userEmail', (req, res) => {
  const { userEmail } = req.params;
  const { adminEmail } = req.query;
  
  const data = readData();
  const admin = data.users.find(u => u.email === adminEmail);
  
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const userEarnings = data.earnings.filter(e => e.email === userEmail);
  res.json(userEarnings);
});

app.put('/api/admin/earnings/:id', (req, res) => {
  const { id } = req.params;
  const { adminEmail, valor, moeda, duracao, metodoPagamento } = req.body;
  
  const data = readData();
  const admin = data.users.find(u => u.email === adminEmail);
  
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const earning = data.earnings.find(e => e.id === id);
  
  if (!earning) {
    return res.status(404).json({ error: 'Anotação não encontrada' });
  }
  
  // Atualizar campos
  earning.valorEUR = moeda === 'EUR' ? parseFloat(valor) : 0;
  earning.valorGBP = moeda === 'GBP' ? parseFloat(valor) : 0;
  earning.valorUSD = moeda === 'USD' ? parseFloat(valor) : 0;
  earning.duracao = parseInt(duracao);
  earning.metodoPagamento = metodoPagamento;
  
  writeData(data);
  
  res.json({ success: true, earning });
});

app.delete('/api/admin/earnings/:id', (req, res) => {
  const { id } = req.params;
  const { adminEmail } = req.query;
  
  const data = readData();
  const admin = data.users.find(u => u.email === adminEmail);
  
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const index = data.earnings.findIndex(e => e.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Anotação não encontrada' });
  }
  
  data.earnings.splice(index, 1);
  writeData(data);
  
  res.json({ success: true });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

