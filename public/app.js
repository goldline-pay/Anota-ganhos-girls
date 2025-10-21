// ===== ESTADO GLOBAL =====
const API_URL = '/api';

let state = {
  user: null,
  currentPage: 'login',
  earnings: [],
  currentTop: null,
  topHistory: [],
  adminUsers: [],
  selectedUserEmail: null,
  selectedUserEarnings: []
};

// ===== FUNÇÕES DE API =====

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }
  
  return data;
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

async function register(email, nome, senha) {
  const btn = document.querySelector('#register-form button[type="submit"]');
  const originalText = btn.innerHTML;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Criando conta...';
    
    const result = await apiCall('/auth/register', 'POST', { email, nome, senha });
    
    state.user = result.user;
    localStorage.setItem('user', JSON.stringify(result.user));
    
    btn.innerHTML = '✅ Conta criada!';
    await loadData();
    state.currentPage = 'dashboard';
    render();
  } catch (error) {
    btn.disabled = false;
    btn.innerHTML = originalText;
    alert('❌ ' + error.message);
  }
}

async function login(email, senha) {
  const btn = document.querySelector('#login-form button[type="submit"]');
  const originalText = btn.innerHTML;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Entrando...';
    
    const result = await apiCall('/auth/login', 'POST', { email, senha });
    
    state.user = result.user;
    localStorage.setItem('user', JSON.stringify(result.user));
    
    btn.innerHTML = '✅ Sucesso!';
    await loadData();
    state.currentPage = 'dashboard';
    render();
  } catch (error) {
    btn.disabled = false;
    btn.innerHTML = originalText;
    alert('❌ ' + error.message);
  }
}

function logout() {
  localStorage.removeItem('user');
  state = {
    user: null,
    currentPage: 'login',
    earnings: [],
    currentTop: null,
    topHistory: [],
    adminUsers: [],
    selectedUserEmail: null,
    selectedUserEarnings: []
  };
  render();
}

// ===== FUNÇÕES DE DADOS =====

async function loadData() {
  if (!state.user) return;
  
  try {
    // Carregar earnings
    state.earnings = await apiCall(`/earnings?email=${state.user.email}`);
    
    // Carregar top atual
    state.currentTop = await apiCall(`/tops/current?email=${state.user.email}`);
    
    // Se for admin, carregar usuários
    if (state.user.role === 'admin') {
      state.adminUsers = await apiCall(`/admin/users?email=${state.user.email}`);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

async function loadTopHistory() {
  try {
    state.topHistory = await apiCall(`/tops/history?email=${state.user.email}`);
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  }
}

// ===== FUNÇÕES DE EARNINGS =====

async function addEarning(valor, moeda, duracao, metodoPagamento) {
  try {
    const topId = state.currentTop ? state.currentTop.id : null;
    
    await apiCall('/earnings', 'POST', {
      email: state.user.email,
      valor,
      moeda,
      duracao,
      metodoPagamento,
      topId
    });
    
    await loadData();
    render();
    alert('✅ Anotação criada com sucesso!');
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

async function deleteEarning(id) {
  if (!confirm('Tem certeza que deseja deletar esta anotação?')) return;
  
  try {
    await apiCall(`/earnings/${id}?email=${state.user.email}`, 'DELETE');
    await loadData();
    render();
    alert('✅ Anotação deletada!');
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

// ===== FUNÇÕES DE TOPS =====

async function startTop() {
  if (!confirm('Iniciar Top de 7 Dias?')) return;
  
  try {
    await apiCall('/tops/start', 'POST', { email: state.user.email });
    await loadData();
    render();
    alert('✅ Top iniciado!');
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

async function stopTop() {
  if (!confirm('Parar o Top atual?')) return;
  
  try {
    await apiCall('/tops/stop', 'POST', {
      email: state.user.email,
      topId: state.currentTop.id
    });
    await loadData();
    render();
    alert('✅ Top parado!');
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

// ===== FUNÇÕES ADMIN =====

async function loadUserEarnings(userEmail) {
  try {
    state.selectedUserEmail = userEmail;
    state.selectedUserEarnings = await apiCall(
      `/admin/earnings/${userEmail}?adminEmail=${state.user.email}`
    );
    state.currentPage = 'admin-earnings';
    render();
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

async function editAdminEarning(id) {
  const earning = state.selectedUserEarnings.find(e => e.id === id);
  if (!earning) {
    alert('Anotação não encontrada');
    return;
  }
  
  // Determinar moeda e valor atual
  let moeda = 'EUR', valor = 0;
  if (earning.valorEUR > 0) { moeda = 'EUR'; valor = earning.valorEUR; }
  else if (earning.valorGBP > 0) { moeda = 'GBP'; valor = earning.valorGBP; }
  else if (earning.valorUSD > 0) { moeda = 'USD'; valor = earning.valorUSD; }
  
  // Pedir novos valores
  const novoValor = prompt(`Novo valor (${moeda}):`, valor.toFixed(2));
  if (novoValor === null) return;
  
  const novaDuracao = prompt('Nova duração (minutos):', earning.duracao);
  if (novaDuracao === null) return;
  
  const novoMetodo = prompt(
    'Método de pagamento:\\n\\nCash\\nRevolut\\nPayPal\\nWise\\nAIB\\nCrypto',
    earning.metodoPagamento
  );
  if (novoMetodo === null) return;
  
  try {
    await apiCall(`/admin/earnings/${id}`, 'PUT', {
      adminEmail: state.user.email,
      valor: parseFloat(novoValor),
      moeda,
      duracao: parseInt(novaDuracao),
      metodoPagamento: novoMetodo.trim()
    });
    
    // Recarregar earnings do usuário
    state.selectedUserEarnings = await apiCall(
      `/admin/earnings/${state.selectedUserEmail}?adminEmail=${state.user.email}`
    );
    
    render();
    alert('✅ Anotação atualizada!');
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

async function deleteAdminEarning(id) {
  if (!confirm('Tem certeza que deseja deletar?')) return;
  
  try {
    await apiCall(`/admin/earnings/${id}?adminEmail=${state.user.email}`, 'DELETE');
    
    // Recarregar earnings do usuário
    state.selectedUserEarnings = await apiCall(
      `/admin/earnings/${state.selectedUserEmail}?adminEmail=${state.user.email}`
    );
    
    render();
    alert('✅ Anotação deletada!');
  } catch (error) {
    alert('❌ ' + error.message);
  }
}

// ===== COMPONENTES UI =====

function Header() {
  if (!state.user) return '';
  
  return `
    <div class="header">
      <div class="container">
        <div class="header-content">
          <h1>💜 Anota Ganhos Girls</h1>
          <div class="user-info">
            <span>${state.user.nome}</span>
            ${state.user.role === 'admin' ? '<span style="background: rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 12px; font-size: 12px;">👑 Admin</span>' : ''}
            <button onclick="logout()" class="btn btn-small" style="background: white; color: var(--primary);">Sair</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function Navigation() {
  if (!state.user) return '';
  
  return `
    <div class="nav">
      <div class="nav-container">
        <button 
          class="nav-btn ${state.currentPage === 'dashboard' ? 'active' : ''}"
          onclick="state.currentPage='dashboard'; render();">
          📊 Dashboard
        </button>
        ${state.currentTop ? `
          <button 
            class="nav-btn ${state.currentPage === 'relatorio' ? 'active' : ''}"
            onclick="state.currentPage='relatorio'; render();">
            📈 Relatório
          </button>
        ` : ''}
        <button 
          class="nav-btn ${state.currentPage === 'historico' ? 'active' : ''}"
          onclick="loadTopHistory(); state.currentPage='historico'; render();">
          📜 Histórico
        </button>
        ${state.user.role === 'admin' ? `
          <button 
            class="nav-btn ${state.currentPage === 'admin' ? 'active' : ''}"
            onclick="state.currentPage='admin'; render();">
            👑 Admin
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Continua na próxima parte...



// ===== PÁGINAS =====

function LoginPage() {
  return `
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">💜 Anota Ganhos Girls</h1>
        
        <div id="login-form">
          <h3 class="mb-2">Entrar</h3>
          <form onsubmit="event.preventDefault(); const email = document.getElementById('login-email').value; const senha = document.getElementById('login-password').value; login(email, senha);">
            <div class="form-group">
              <label class="form-label">Email ou Nome</label>
              <input type="text" id="login-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input type="password" id="login-password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary mb-2">Entrar</button>
          </form>
          <button onclick="document.getElementById('login-form').classList.add('hidden'); document.getElementById('register-form').classList.remove('hidden');" class="btn btn-secondary">
            Criar Conta
          </button>
        </div>
        
        <div id="register-form" class="hidden">
          <h3 class="mb-2">Criar Conta</h3>
          <form onsubmit="event.preventDefault(); const email = document.getElementById('register-email').value; const nome = document.getElementById('register-name').value; const senha = document.getElementById('register-password').value; register(email, nome, senha);">
            <div class="form-group">
              <label class="form-label">Nome</label>
              <input type="text" id="register-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="register-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input type="password" id="register-password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary mb-2">Criar Conta</button>
          </form>
          <button onclick="document.getElementById('register-form').classList.add('hidden'); document.getElementById('login-form').classList.remove('hidden');" class="btn btn-secondary">
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  `;
}

function DashboardPage() {
  // Calcular totais
  const totalEUR = state.earnings.reduce((sum, e) => sum + e.valorEUR, 0);
  const totalGBP = state.earnings.reduce((sum, e) => sum + e.valorGBP, 0);
  const totalUSD = state.earnings.reduce((sum, e) => sum + e.valorUSD, 0);
  const totalHoras = state.earnings.reduce((sum, e) => sum + e.duracao, 0) / 60;
  
  return `
    ${Header()}
    ${Navigation()}
    <div class="container">
      ${state.currentTop ? `
        <div class="card" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white;">
          <div class="flex-between">
            <div>
              <h3 style="margin: 0;">🏆 Top de 7 Dias Ativo</h3>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Dia ${state.currentTop.currentDay} de 7</p>
            </div>
            <button onclick="stopTop()" class="btn btn-danger btn-small">⏹️ Parar</button>
          </div>
        </div>
      ` : `
        <div class="card">
          <button onclick="startTop()" class="btn btn-success">🚀 Iniciar Top de 7 Dias</button>
        </div>
      `}
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">💶 Total EUR</div>
          <div class="stat-value">€${totalEUR.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">💷 Total GBP</div>
          <div class="stat-value">£${totalGBP.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">💵 Total USD</div>
          <div class="stat-value">$${totalUSD.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">⏱️ Total Horas</div>
          <div class="stat-value">${totalHoras.toFixed(1)}h</div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="card-title">➕ Nova Anotação</h3>
        <form onsubmit="event.preventDefault(); const valor = document.getElementById('valor').value; const moeda = document.getElementById('moeda').value; const duracao = document.getElementById('duracao').value; const metodo = document.getElementById('metodo').value; addEarning(valor, moeda, duracao, metodo); this.reset();">
          <div class="form-group">
            <label class="form-label">Valor</label>
            <input type="number" id="valor" class="form-input" step="0.01" required>
          </div>
          <div class="form-group">
            <label class="form-label">Moeda</label>
            <select id="moeda" class="form-select" required>
              <option value="EUR">💶 Euro (EUR)</option>
              <option value="GBP">💷 Libra (GBP)</option>
              <option value="USD">💵 Dólar (USD)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Duração (minutos)</label>
            <input type="number" id="duracao" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Método de Pagamento</label>
            <select id="metodo" class="form-select" required>
              <option value="Cash">💵 Cash</option>
              <option value="Revolut">💳 Revolut</option>
              <option value="PayPal">💳 PayPal</option>
              <option value="Wise">💳 Wise</option>
              <option value="AIB">🏦 AIB</option>
              <option value="Crypto">₿ Crypto</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Adicionar</button>
        </form>
      </div>
      
      <div class="card">
        <h3 class="card-title">📝 Anotações Recentes</h3>
        ${state.earnings.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">Nenhuma anotação ainda</div>
            <p>Adicione sua primeira anotação acima!</p>
          </div>
        ` : `
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Duração</th>
                  <th>Método</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${state.earnings.slice().reverse().slice(0, 10).map(e => {
                  const valor = e.valorEUR > 0 ? `€${e.valorEUR.toFixed(2)}` :
                                e.valorGBP > 0 ? `£${e.valorGBP.toFixed(2)}` :
                                `$${e.valorUSD.toFixed(2)}`;
                  const data = new Date(e.data).toLocaleDateString('pt-BR');
                  
                  return `
                    <tr>
                      <td>${data}</td>
                      <td><strong>${valor}</strong></td>
                      <td>${e.duracao}min</td>
                      <td>${e.metodoPagamento}</td>
                      <td>
                        <button onclick="deleteEarning('${e.id}')" class="btn btn-danger btn-small">🗑️</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function RelatorioPage() {
  if (!state.currentTop) {
    return `
      ${Header()}
      ${Navigation()}
      <div class="container">
        <div class="empty-state">
          <div class="empty-icon">📈</div>
          <div class="empty-text">Nenhum top ativo</div>
          <p>Inicie um Top de 7 Dias para ver o relatório</p>
        </div>
      </div>
    `;
  }
  
  // Agrupar earnings por dia
  const earningsByDay = {};
  for (let day = 1; day <= 7; day++) {
    earningsByDay[day] = state.currentTop.earnings.filter(e => {
      const earningDate = new Date(e.data);
      const topStart = new Date(state.currentTop.dataInicio);
      const diffDays = Math.floor((earningDate - topStart) / (1000 * 60 * 60 * 24));
      return diffDays + 1 === day;
    });
  }
  
  return `
    ${Header()}
    ${Navigation()}
    <div class="container">
      <div class="card">
        <div class="flex-between mb-3">
          <div>
            <h2 style="margin: 0;">📈 Relatório - Top de 7 Dias</h2>
            <p style="color: var(--text-light); margin-top: 8px;">Dia ${state.currentTop.currentDay} de 7</p>
          </div>
          <button onclick="stopTop()" class="btn btn-danger btn-small">⏹️ Parar Top</button>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">💶 Total EUR</div>
            <div class="stat-value">€${state.currentTop.totalEUR.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">💷 Total GBP</div>
            <div class="stat-value">£${state.currentTop.totalGBP.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">💵 Total USD</div>
            <div class="stat-value">$${state.currentTop.totalUSD.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      ${[1,2,3,4,5,6,7].map(day => {
        const dayEarnings = earningsByDay[day] || [];
        const dayTotalEUR = dayEarnings.reduce((sum, e) => sum + e.valorEUR, 0);
        const dayTotalGBP = dayEarnings.reduce((sum, e) => sum + e.valorGBP, 0);
        const dayTotalUSD = dayEarnings.reduce((sum, e) => sum + e.valorUSD, 0);
        const hasEarnings = dayEarnings.length > 0;
        const metodos = [...new Set(dayEarnings.map(e => e.metodoPagamento))];
        
        return `
          <div class="card">
            <h3 class="card-title">Dia ${day} ${day === state.currentTop.currentDay ? '(Hoje)' : ''}</h3>
            ${hasEarnings ? `
              <div class="mb-2">
                ${dayTotalEUR > 0 ? `<div>💶 €${dayTotalEUR.toFixed(2)}</div>` : ''}
                ${dayTotalGBP > 0 ? `<div>💷 £${dayTotalGBP.toFixed(2)}</div>` : ''}
                ${dayTotalUSD > 0 ? `<div>💵 $${dayTotalUSD.toFixed(2)}</div>` : ''}
              </div>
              <div style="font-size: 14px; color: var(--text-light);">
                <strong>Métodos:</strong> ${metodos.join(', ')}
              </div>
            ` : `
              <p style="color: var(--text-light);">Nenhuma anotação ainda</p>
            `}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function HistoricoPage() {
  return `
    ${Header()}
    ${Navigation()}
    <div class="container">
      <h2 class="mb-3">📜 Histórico de Tops</h2>
      
      ${state.topHistory.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <div class="empty-text">Nenhum top encontrado</div>
          <p>Inicie seu primeiro Top de 7 Dias!</p>
        </div>
      ` : state.topHistory.map(top => {
        const statusColors = {
          ativo: 'var(--success)',
          parado: 'var(--danger)',
          concluido: 'var(--primary)'
        };
        const statusLabels = {
          ativo: 'ATIVO',
          parado: 'PARADO',
          concluido: 'CONCLUÍDO'
        };
        
        return `
          <div class="card" style="border-left: 4px solid ${statusColors[top.status]};">
            <div class="flex-between mb-2">
              <div>
                <h3 style="margin: 0;">🏆 Top de 7 Dias</h3>
                <p style="color: var(--text-light); margin: 4px 0 0 0; font-size: 14px;">
                  ${new Date(top.dataInicio).toLocaleDateString('pt-BR')} - 
                  ${new Date(top.dataFim).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span style="background: ${statusColors[top.status]}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${statusLabels[top.status]}
              </span>
            </div>
            
            <div class="flex gap-2" style="flex-wrap: wrap;">
              ${top.totalEUR > 0 ? `<div style="background: var(--surface); padding: 8px 12px; border-radius: 8px;"><strong>💶 €${top.totalEUR.toFixed(2)}</strong></div>` : ''}
              ${top.totalGBP > 0 ? `<div style="background: var(--surface); padding: 8px 12px; border-radius: 8px;"><strong>💷 £${top.totalGBP.toFixed(2)}</strong></div>` : ''}
              ${top.totalUSD > 0 ? `<div style="background: var(--surface); padding: 8px 12px; border-radius: 8px;"><strong>💵 $${top.totalUSD.toFixed(2)}</strong></div>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function AdminPage() {
  return `
    ${Header()}
    ${Navigation()}
    <div class="container">
      <h2 class="mb-3">👑 Administração</h2>
      
      <div class="card">
        <h3 class="card-title">Usuários</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Role</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${state.adminUsers.map(user => `
                <tr>
                  <td><strong>${user.nome}</strong></td>
                  <td>${user.email}</td>
                  <td>${user.role === 'admin' ? '👑 Admin' : 'User'}</td>
                  <td>
                    <button onclick="loadUserEarnings('${user.email}')" class="btn btn-primary btn-small">
                      👁️ Ver Anotações
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function AdminEarningsPage() {
  const user = state.adminUsers.find(u => u.email === state.selectedUserEmail);
  
  return `
    ${Header()}
    ${Navigation()}
    <div class="container">
      <button onclick="state.currentPage='admin'; render();" class="btn btn-secondary btn-small mb-2">
        ← Voltar
      </button>
      
      <h2 class="mb-3">Anotações de ${user ? user.nome : state.selectedUserEmail}</h2>
      
      <div class="card">
        ${state.selectedUserEarnings.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">Nenhuma anotação</div>
          </div>
        ` : `
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Duração</th>
                  <th>Método</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${state.selectedUserEarnings.slice().reverse().map(e => {
                  const valor = e.valorEUR > 0 ? `€${e.valorEUR.toFixed(2)}` :
                                e.valorGBP > 0 ? `£${e.valorGBP.toFixed(2)}` :
                                `$${e.valorUSD.toFixed(2)}`;
                  const data = new Date(e.data).toLocaleDateString('pt-BR');
                  
                  return `
                    <tr>
                      <td>${data}</td>
                      <td><strong>${valor}</strong></td>
                      <td>${e.duracao}min</td>
                      <td>${e.metodoPagamento}</td>
                      <td>
                        <button onclick="editAdminEarning('${e.id}')" class="btn btn-primary btn-small">✏️ Editar</button>
                        <button onclick="deleteAdminEarning('${e.id}')" class="btn btn-danger btn-small">🗑️</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

// ===== RENDER =====

function render() {
  const app = document.getElementById('app');
  
  if (!state.user) {
    app.innerHTML = LoginPage();
  } else if (state.currentPage === 'dashboard') {
    app.innerHTML = DashboardPage();
  } else if (state.currentPage === 'relatorio') {
    app.innerHTML = RelatorioPage();
  } else if (state.currentPage === 'historico') {
    app.innerHTML = HistoricoPage();
  } else if (state.currentPage === 'admin') {
    app.innerHTML = AdminPage();
  } else if (state.currentPage === 'admin-earnings') {
    app.innerHTML = AdminEarningsPage();
  }
}

// ===== INICIALIZAÇÃO =====

window.addEventListener('load', async () => {
  const savedUser = localStorage.getItem('user');
  
  if (savedUser) {
    try {
      state.user = JSON.parse(savedUser);
      await loadData();
      state.currentPage = 'dashboard';
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      localStorage.removeItem('user');
    }
  }
  
  render();
});

