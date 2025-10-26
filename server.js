import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Desabilitar cache
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static('public', { maxAge: 0 }));

// Rota raiz
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(__dirname + '/public/index.html');
});

// Pool de conexão MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'anota_ganhos_girls',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware de autenticação admin
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    // Verificar se é admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    
    req.user = user;
    next();
  });
};

// ============ AUTENTICAÇÃO ============

// POST /api/auth/register - Registrar novo usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
    }

    const conn = await pool.getConnection();

    // Verificar se email já existe
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const passwordHash = await bcryptjs.hash(password, 10);

    // Criar usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await conn.query(
      'INSERT INTO users (id, email, name, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, name, passwordHash, 'user']
    );

    conn.release();

    // Gerar token JWT
    const token = jwt.sign({ id: userId, email, name, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      id: userId,
      email,
      name,
      role: 'user',
      token
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /api/auth/login - Fazer login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const conn = await pool.getConnection();

    // Buscar usuário por email ou nome
    const [users] = await conn.query('SELECT * FROM users WHERE email = ? OR name = ?', [email, email]);
    if (users.length === 0) {
      conn.release();
      return res.status(401).json({ error: 'Email/nome ou senha inválidos' });
    }

    const user = users[0];

    // Verificar senha
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      conn.release();
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Atualizar lastSignedIn
    await conn.query('UPDATE users SET lastSignedIn = NOW() WHERE id = ?', [user.id]);
    conn.release();

    // Gerar token JWT
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// GET /api/auth/me - Obter usuário atual
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// ============ ANOTAÇÕES DE GANHOS ============

// GET /api/earnings - Listar anotações
app.get('/api/earnings', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [earnings] = await conn.query(
      'SELECT * FROM earnings WHERE userId = ? ORDER BY date DESC',
      [req.user.id]
    );
    conn.release();
    res.json(earnings);
  } catch (error) {
    console.error('Erro ao listar anotações:', error);
    res.status(500).json({ error: 'Erro ao listar anotações' });
  }
});

// POST /api/earnings - Criar anotação
app.post('/api/earnings', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, durationMinutes, description, date, paymentMethod } = req.body;

    if (!durationMinutes || !amount || !currency || !paymentMethod) {
      return res.status(400).json({ error: 'Valor, moeda, durationMinutes e forma de pagamento são obrigatórios' });
    }

    const conn = await pool.getConnection();

    const earningId = `earning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amountCents = Math.round(amount * 100);
    const earningDate = date ? new Date(date) : new Date();

    // Determinar qual coluna usar baseado na moeda
    let gbpCents = 0, eurCents = 0, usdCents = 0;
    if (currency === 'GBP') gbpCents = amountCents;
    else if (currency === 'EUR') eurCents = amountCents;
    else if (currency === 'USD') usdCents = amountCents;

    await conn.query(
      'INSERT INTO earnings (id, userId, gbpAmount, eurAmount, usdAmount, durationMinutes, description, date, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [earningId, req.user.id, gbpCents, eurCents, usdCents, durationMinutes, description || null, earningDate, paymentMethod]
    );

    // Atualizar estatísticas semanais
    await updateWeeklyStats(conn, req.user.id, earningDate);

    conn.release();

    res.status(201).json({
      id: earningId,
      userId: req.user.id,
      gbpAmount: gbpCents,
      eurAmount: eurCents,
      usdAmount: usdCents,
      durationMinutes,
      description: description || null,
      date: earningDate,
      paymentMethod: paymentMethod
    });
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    res.status(500).json({ error: 'Erro ao criar anotação' });
  }
});

// PUT /api/earnings/:id - Editar anotação
app.put('/api/earnings/:id', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, durationMinutes, description, paymentMethod } = req.body;
    const conn = await pool.getConnection();

    // Verificar se anotação pertence ao usuário
    const [earnings] = await conn.query('SELECT * FROM earnings WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (earnings.length === 0) {
      conn.release();
      return res.status(403).json({ error: 'Anotação não encontrada' });
    }

    const amountCents = Math.round((amount || 0) * 100);
    let gbpCents = 0, eurCents = 0, usdCents = 0;
    if (currency === 'GBP') gbpCents = amountCents;
    else if (currency === 'EUR') eurCents = amountCents;
    else if (currency === 'USD') usdCents = amountCents;

    await conn.query(
      'UPDATE earnings SET gbpAmount = ?, eurAmount = ?, usdAmount = ?, durationMinutes = ?, description = ?, paymentMethod = ? WHERE id = ?',
      [gbpCents, eurCents, usdCents, durationMinutes, description || null, paymentMethod || null, req.params.id]
    );

    // Atualizar estatísticas semanais
    await updateWeeklyStats(conn, req.user.id, earnings[0].date);

    conn.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar anotação:', error);
    res.status(500).json({ error: 'Erro ao editar anotação' });
  }
});

// DELETE /api/earnings/:id - Deletar anotação
app.delete('/api/earnings/:id', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Verificar se anotação pertence ao usuário
    const [earnings] = await conn.query('SELECT * FROM earnings WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (earnings.length === 0) {
      conn.release();
      return res.status(403).json({ error: 'Anotação não encontrada' });
    }

    const earning = earnings[0];

    await conn.query('DELETE FROM earnings WHERE id = ?', [req.params.id]);

    // Atualizar estatísticas semanais
    await updateWeeklyStats(conn, req.user.id, earning.date);

    conn.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    res.status(500).json({ error: 'Erro ao deletar anotação' });
  }
});

// ============ ESTATÍSTICAS SEMANAIS ============

// GET /api/stats/weekly - Obter estatísticas semanais
app.get('/api/stats/weekly', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [stats] = await conn.query(
      'SELECT * FROM weeklyStats WHERE userId = ? ORDER BY weekStartDate DESC LIMIT 10',
      [req.user.id]
    );
    conn.release();

    const statsFormatted = stats.map(s => ({
      ...s,
      totalGbpAmount: s.totalGbpAmount / 100,
      totalEurAmount: s.totalEurAmount / 100,
      totalUsdAmount: s.totalUsdAmount / 100
    }));

    res.json(statsFormatted);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// ============ TOP PERIODS ============

// POST /api/top/start - Iniciar novo top
app.post('/api/top/start', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Verificar se já existe top ativo
    const [activeTops] = await conn.query(
      'SELECT * FROM topPeriods WHERE userId = ? AND status = "active"',
      [req.user.id]
    );

    if (activeTops.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Já existe um top ativo' });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    const topId = `top_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await conn.query(
      'INSERT INTO topPeriods (id, userId, startDate, endDate, currentDay, status) VALUES (?, ?, ?, ?, ?, ?)',
      [topId, req.user.id, now, endDate, 1, 'active']
    );

    conn.release();

    res.status(201).json({
      id: topId,
      startDate: now,
      endDate: endDate,
      currentDay: 1,
      status: 'active'
    });
  } catch (error) {
    console.error('Erro ao iniciar top:', error);
    res.status(500).json({ error: 'Erro ao iniciar top' });
  }
});

// POST /api/top/set-day - Definir dia atual do top
app.post('/api/top/set-day', authenticateToken, async (req, res) => {
  try {
    const { day } = req.body;

    if (!day || day < 1 || day > 7) {
      return res.status(400).json({ error: 'Dia deve estar entre 1 e 7' });
    }

    const conn = await pool.getConnection();

    // Buscar top ativo
    const [activeTops] = await conn.query(
      'SELECT * FROM topPeriods WHERE userId = ? AND status = "active" ORDER BY createdAt DESC LIMIT 1',
      [req.user.id]
    );

    if (activeTops.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'Nenhum top ativo encontrado' });
    }

    const dayNumber = parseInt(day);
    const topId = activeTops[0].id;

    // Atualizar o dia atual
    await conn.query(
      'UPDATE topPeriods SET currentDay = ? WHERE id = ?',
      [dayNumber, topId]
    );

    conn.release();

    res.json({ success: true, message: `Dia do top atualizado para o dia ${dayNumber}` });
  } catch (error) {
    console.error('Erro ao definir o dia do top:', error);
    res.status(500).json({ error: 'Erro ao definir o dia do top' });
  }
});

// POST /api/top/stop - Parar top ativo
app.post('/api/top/stop', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    await conn.query(
      'UPDATE topPeriods SET status = "stopped" WHERE userId = ? AND status = "active"',
      [req.user.id]
    );

    conn.release();

    res.json({ success: true, message: 'Top parado com sucesso' });
  } catch (error) {
    console.error('Erro ao parar top:', error);
    res.status(500).json({ error: 'Erro ao parar top' });
  }
});

// GET /api/top/history - Obter histórico de todos os tops
app.get('/api/top/history', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [tops] = await conn.query(
      'SELECT * FROM topPeriods WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );

    conn.release();

    const topsWithDetails = tops.map(top => ({
      id: top.id,
      startDate: top.startDate,
      endDate: top.endDate,
      currentDay: top.currentDay,
      totalGbpAmount: (top.totalGbpAmount || 0) / 100,
      totalEurAmount: (top.totalEurAmount || 0) / 100,
      totalUsdAmount: (top.totalUsdAmount || 0) / 100,
      status: top.status,
      createdAt: top.createdAt
    }));

    res.json(topsWithDetails);
  } catch (error) {
    console.error('Erro ao obter histórico de tops:', error);
    res.status(500).json({ error: 'Erro ao obter histórico de tops' });
  }
});

// GET /api/top/current - Obter top ativo atual
app.get('/api/top/current', authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [tops] = await conn.query(
      'SELECT * FROM topPeriods WHERE userId = ? AND status = "active" ORDER BY createdAt DESC LIMIT 1',
      [req.user.id]
    );

    conn.release();

    if (tops.length === 0) {
      return res.json(null);
    }

    const top = tops[0];
    const now = new Date();
    const currentDay = calculateCurrentDay(top.startDate, now);
    const timeRemaining = calculateTimeRemaining(top.startDate, currentDay, now);

    res.json({
      id: top.id,
      startDate: top.startDate,
      endDate: top.endDate,
      currentDay: currentDay,
      totalGbpAmount: top.totalGbpAmount / 100,
      totalEurAmount: top.totalEurAmount / 100,
      totalUsdAmount: top.totalUsdAmount / 100,
      status: top.status,
      timeRemaining: timeRemaining
    });
  } catch (error) {
    console.error('Erro ao obter top:', error);
    res.status(500).json({ error: 'Erro ao obter top' });
  }
});

// ============ ADMIN ROUTES ============

// GET /api/admin/users - Listar todos os usuários (apenas admin)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [users] = await conn.query('SELECT id, email, name, role, createdAt, lastSignedIn FROM users ORDER BY createdAt DESC');
    conn.release();
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// GET /api/admin/earnings/:userId - Listar anotações de um usuário (apenas admin)
app.get('/api/admin/earnings/:userId', authenticateAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [earnings] = await conn.query(
      'SELECT * FROM earnings WHERE userId = ? ORDER BY date DESC',
      [req.params.userId]
    );
    conn.release();
    res.json(earnings);
  } catch (error) {
    console.error('Erro ao listar anotações do usuário:', error);
    res.status(500).json({ error: 'Erro ao listar anotações do usuário' });
  }
});

// PUT /api/admin/earnings/:id - Editar anotação de qualquer usuário (apenas admin)
app.put('/api/admin/earnings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { amount, currency, durationMinutes, description, paymentMethod } = req.body;
    const conn = await pool.getConnection();

    const [earnings] = await conn.query('SELECT * FROM earnings WHERE id = ?', [req.params.id]);
    if (earnings.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Anotação não encontrada' });
    }

    const amountCents = Math.round((amount || 0) * 100);
    let gbpCents = 0, eurCents = 0, usdCents = 0;
    if (currency === 'GBP') gbpCents = amountCents;
    else if (currency === 'EUR') eurCents = amountCents;
    else if (currency === 'USD') usdCents = amountCents;

    await conn.query(
      'UPDATE earnings SET gbpAmount = ?, eurAmount = ?, usdAmount = ?, durationMinutes = ?, description = ?, paymentMethod = ? WHERE id = ?',
      [gbpCents, eurCents, usdCents, durationMinutes, description || null, paymentMethod || null, req.params.id]
    );

    const earning = earnings[0];
    await updateWeeklyStats(conn, earning.userId, earning.date);

    conn.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar anotação:', error);
    res.status(500).json({ error: 'Erro ao editar anotação' });
  }
});

// DELETE /api/admin/earnings/:id - Deletar anotação de qualquer usuário (apenas admin)
app.delete('/api/admin/earnings/:id', authenticateAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [earnings] = await conn.query('SELECT * FROM earnings WHERE id = ?', [req.params.id]);
    if (earnings.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Anotação não encontrada' });
    }

    const earning = earnings[0];

    await conn.query('DELETE FROM earnings WHERE id = ?', [req.params.id]);
    await updateWeeklyStats(conn, earning.userId, earning.date);

    conn.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    res.status(500).json({ error: 'Erro ao deletar anotação' });
  }
});

// ============ FUNÇÕES AUXILIARES ============

// Função para obter o início da semana (segunda-feira)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Função para atualizar estatísticas semanais
async function updateWeeklyStats(conn, userId, date) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Buscar todas as anotações da semana
  const [earnings] = await conn.query(
    'SELECT * FROM earnings WHERE userId = ? AND date >= ? AND date < ?',
    [userId, weekStart, weekEnd]
  );

  const totalGbpAmount = earnings.reduce((sum, e) => sum + (e.gbpAmount || 0), 0);
  const totalEurAmount = earnings.reduce((sum, e) => sum + (e.eurAmount || 0), 0);
  const totalUsdAmount = earnings.reduce((sum, e) => sum + (e.usdAmount || 0), 0);
  const totalDurationMinutes = earnings.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalEarningsCount = earnings.length;

  // Usar REPLACE para evitar conflitos
  const statId = `stat_${userId}_${weekStart.getTime()}`;
  await conn.query(
    'REPLACE INTO weeklyStats (id, userId, weekStartDate, totalGbpAmount, totalEurAmount, totalUsdAmount, totalDurationMinutes, totalEarnings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [statId, userId, weekStart, totalGbpAmount, totalEurAmount, totalUsdAmount, totalDurationMinutes, totalEarningsCount]
  );
}

// Função para calcular o dia atual do top
function calculateCurrentDay(startDate, currentDate) {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  
  let day = 1;
  let dayStart = new Date(start);
  
  while (dayStart < current) {
    dayStart.setHours(dayStart.getHours() + 24);
    if (dayStart <= current) {
      day++;
    }
  }
  
  return Math.min(day, 7);
}

function calculateTimeRemaining(startDate, currentDay, currentDate) {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  
  let dayEnd = new Date(start);
  for (let i = 1; i < currentDay; i++) {
    dayEnd.setHours(dayEnd.getHours() + 24);
  }
  dayEnd.setHours(15, 0, 0, 0);
  
  const remaining = dayEnd - current;
  return Math.max(0, remaining);
}

// ============ INICIALIZAR BANCO DE DADOS ============

async function initializeDatabase() {
  try {
    const conn = await pool.getConnection();

    // Criar tabela users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        passwordHash VARCHAR(255),
        name TEXT,
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela earnings
    await conn.query(`
      CREATE TABLE IF NOT EXISTS earnings (
        id VARCHAR(64) PRIMARY KEY,
        userId VARCHAR(64) NOT NULL,
        gbpAmount INT DEFAULT 0,
        eurAmount INT DEFAULT 0,
        usdAmount INT DEFAULT 0,
        durationMinutes INT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        paymentMethod VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Criar tabela weeklyStats
    await conn.query(`
      CREATE TABLE IF NOT EXISTS weeklyStats (
        id VARCHAR(64) PRIMARY KEY,
        userId VARCHAR(64) NOT NULL,
        weekStartDate DATE NOT NULL,
        totalGbpAmount INT DEFAULT 0,
        totalEurAmount INT DEFAULT 0,
        totalUsdAmount INT DEFAULT 0,
        totalDurationMinutes INT DEFAULT 0,
        totalEarnings INT DEFAULT 0,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY (userId, weekStartDate)
      )
    `);

    // Criar tabela topPeriods
    await conn.query(`
      CREATE TABLE IF NOT EXISTS topPeriods (
        id VARCHAR(64) PRIMARY KEY,
        userId VARCHAR(64) NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        currentDay INT DEFAULT 1,
        totalGbpAmount INT DEFAULT 0,
        totalEurAmount INT DEFAULT 0,
        totalUsdAmount INT DEFAULT 0,
        totalDurationMinutes INT DEFAULT 0,
        status ENUM('active', 'stopped', 'completed') DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Criar usuário admin padrão se não existir
    const [adminUsers] = await conn.query('SELECT id FROM users WHERE email = ?', ['admin@anotaganhos.com']);
    
    if (adminUsers.length === 0) {
      const adminPassword = await bcryptjs.hash('Admin123!', 10);
      const adminId = `admin_${Date.now()}`;
      
      await conn.query(
        'INSERT INTO users (id, email, name, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'admin@anotaganhos.com', 'Admin', adminPassword, 'admin']
      );
      
      console.log('✅ Usuário admin criado: admin@anotaganhos.com / Admin123!');
    }

    conn.release();
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// ============ INICIAR SERVIDOR ============

app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
});

