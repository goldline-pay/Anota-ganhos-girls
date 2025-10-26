# 💰 Anota Ganhos Girls

Sistema completo de tracking de ganhos para profissionais, com autenticação JWT, banco de dados MySQL, estatísticas semanais, períodos de "top" e painel administrativo.

## 🚀 Funcionalidades

- ✅ **Autenticação completa** com JWT e bcrypt
- ✅ **Registro de ganhos** em múltiplas moedas (GBP, EUR, USD)
- ✅ **Estatísticas semanais** automáticas
- ✅ **Sistema de "Top"** com períodos de 7 dias
- ✅ **Painel administrativo** para gerenciar usuários e anotações
- ✅ **Conta admin padrão** criada automaticamente
- ✅ **API RESTful** completa e segura
- ✅ **Banco de dados MySQL** com schema otimizado
- ✅ **Pronto para deploy** no Render e Railway

## 🔐 Credenciais Admin Padrão

```
Email: admin@anotaganhos.com
Senha: Admin123!
```

**⚠️ IMPORTANTE: Altere a senha após o primeiro login em produção!**

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## 🛠️ Instalação Local

### 1. Clone o repositório

```bash
git clone https://github.com/goldline-pay/Anota-ganhos-girls.git
cd Anota-ganhos-girls
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Crie o banco de dados MySQL:

```bash
mysql -u root -p < schema.sql
```

Ou manualmente:

```sql
CREATE DATABASE anota_ganhos_girls CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_super_segura_aqui
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=anota_ganhos_girls
```

### 5. Inicie o servidor

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🌐 Deploy no Render

### Passo 1: Criar o banco de dados MySQL

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** → **"MySQL"**
3. Configure:
   - **Name**: `anota-ganhos-db`
   - **Database**: `anota_ganhos_girls`
   - **User**: `root`
   - **Region**: escolha a mais próxima
4. Clique em **"Create Database"**
5. **IMPORTANTE**: Anote as credenciais:
   - Internal Database URL
   - Host
   - Port
   - Database
   - Username
   - Password

### Passo 2: Criar o Web Service

1. No Render Dashboard, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub: `goldline-pay/Anota-ganhos-girls`
3. Configure:
   - **Name**: `anota-ganhos-girls`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou escolha outro)

### Passo 3: Configurar variáveis de ambiente

Adicione as seguintes variáveis de ambiente no Render:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<gere_uma_chave_segura_aleatoria_aqui>
DB_HOST=<host_do_mysql_interno_do_render>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<senha_do_mysql_do_render>
DB_NAME=anota_ganhos_girls
```

**Como obter as credenciais do MySQL:**
- Vá até o serviço MySQL que você criou
- Clique em **"Connect"**
- Copie o **Internal Database URL** ou as credenciais individuais
- Use o **Internal Host** (não o External!)

**Para gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (pode levar 2-5 minutos)
3. Verifique os logs para confirmar que o servidor iniciou
4. Acesse a URL fornecida pelo Render (ex: `https://anota-ganhos-girls.onrender.com`)

### Passo 5: Verificar funcionamento

1. Acesse a URL do seu app
2. Faça login com as credenciais admin: `admin@anotaganhos.com` / `Admin123!`
3. Teste criar uma anotação
4. **Altere a senha do admin imediatamente!**

## 🚂 Deploy no Railway

### Passo 1: Criar novo projeto

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório `goldline-pay/Anota-ganhos-girls`
5. Clique em **"Deploy Now"**

### Passo 2: Adicionar banco de dados MySQL

1. No projeto, clique em **"+ New"**
2. Selecione **"Database"** → **"Add MySQL"**
3. O Railway criará automaticamente o banco de dados
4. Aguarde a criação (aparecerá um container MySQL)

### Passo 3: Configurar variáveis de ambiente

1. Clique no serviço da aplicação (não no MySQL)
2. Vá em **"Variables"** (aba superior)
3. Clique em **"+ New Variable"**
4. Adicione as seguintes variáveis:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<gere_uma_chave_segura_aleatoria>
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

**Nota importante sobre Railway:**
- As variáveis `${{MySQL.VARIAVEL}}` são **referências automáticas** do Railway
- Digite exatamente como mostrado acima (com `${{` e `}}`)
- O Railway substituirá automaticamente pelos valores corretos do MySQL

**Para gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Passo 4: Gerar domínio público

1. Clique no serviço da aplicação
2. Vá em **"Settings"** (aba superior)
3. Role até **"Networking"**
4. Clique em **"Generate Domain"**
5. Copie a URL gerada (ex: `https://anota-ganhos-girls-production.up.railway.app`)

### Passo 5: Redeploy (se necessário)

1. Se o deploy falhou antes de adicionar as variáveis:
2. Clique nos 3 pontinhos do serviço
3. Clique em **"Redeploy"**
4. Aguarde o novo deploy

### Passo 6: Verificar funcionamento

1. Acesse a URL gerada
2. Faça login com: `admin@anotaganhos.com` / `Admin123!`
3. Teste criar uma anotação
4. **Altere a senha do admin!**

## 📡 API Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
  ```json
  {
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "password": "senha123"
  }
  ```

- `POST /api/auth/login` - Fazer login
  ```json
  {
    "email": "user@example.com",
    "password": "senha123"
  }
  ```

- `GET /api/auth/me` - Obter usuário atual (requer token)
  - Header: `Authorization: Bearer <token>`

### Anotações de Ganhos

- `GET /api/earnings` - Listar anotações do usuário (requer token)
- `POST /api/earnings` - Criar nova anotação (requer token)
  ```json
  {
    "amount": 150.50,
    "currency": "EUR",
    "durationMinutes": 60,
    "description": "Sessão de trabalho",
    "date": "2024-10-26",
    "paymentMethod": "Cash"
  }
  ```

- `PUT /api/earnings/:id` - Editar anotação (requer token)
- `DELETE /api/earnings/:id` - Deletar anotação (requer token)

### Estatísticas

- `GET /api/stats/weekly` - Obter estatísticas semanais (requer token)

### Top Periods

- `POST /api/top/start` - Iniciar novo período de top (requer token)
- `POST /api/top/set-day` - Definir dia atual do top (requer token)
  ```json
  {
    "day": 3
  }
  ```
- `POST /api/top/stop` - Parar top ativo (requer token)
- `GET /api/top/current` - Obter top ativo (requer token)
- `GET /api/top/history` - Histórico de tops (requer token)

### Admin (requer role admin)

- `GET /api/admin/users` - Listar todos os usuários
- `GET /api/admin/earnings/:userId` - Listar anotações de um usuário
- `PUT /api/admin/earnings/:id` - Editar anotação de qualquer usuário
- `DELETE /api/admin/earnings/:id` - Deletar anotação de qualquer usuário

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ Autenticação JWT com expiração de 7 dias
- ✅ Proteção contra SQL Injection (prepared statements)
- ✅ CORS configurado
- ✅ Validação de dados em todas as rotas
- ✅ Middleware de autenticação e autorização
- ✅ Foreign keys com ON DELETE CASCADE
- ✅ Índices otimizados no banco

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
```sql
id VARCHAR(64) PRIMARY KEY
email VARCHAR(320) UNIQUE NOT NULL
passwordHash VARCHAR(255)
name TEXT
role ENUM('user', 'admin') DEFAULT 'user'
createdAt TIMESTAMP
lastSignedIn TIMESTAMP
```

### Tabela `earnings`
```sql
id VARCHAR(64) PRIMARY KEY
userId VARCHAR(64) FOREIGN KEY
gbpAmount INT (em centavos)
eurAmount INT (em centavos)
usdAmount INT (em centavos)
durationMinutes INT
description TEXT
date DATE
paymentMethod VARCHAR(50)
createdAt TIMESTAMP
updatedAt TIMESTAMP
```

### Tabela `weeklyStats`
```sql
id VARCHAR(64) PRIMARY KEY
userId VARCHAR(64) FOREIGN KEY
weekStartDate DATE
totalGbpAmount INT
totalEurAmount INT
totalUsdAmount INT
totalDurationMinutes INT
totalEarnings INT
updatedAt TIMESTAMP
UNIQUE(userId, weekStartDate)
```

### Tabela `topPeriods`
```sql
id VARCHAR(64) PRIMARY KEY
userId VARCHAR(64) FOREIGN KEY
startDate DATETIME
endDate DATETIME
currentDay INT (1-7)
totalGbpAmount INT
totalEurAmount INT
totalUsdAmount INT
status ENUM('active', 'stopped', 'completed')
createdAt TIMESTAMP
updatedAt TIMESTAMP
```

## 🐛 Troubleshooting

### Erro de conexão com MySQL no Render/Railway

**Problema:** `Error: connect ECONNREFUSED` ou `ER_ACCESS_DENIED_ERROR`

**Solução:**
1. Verifique se o banco MySQL está rodando (veja o status no dashboard)
2. Confirme que está usando o **Internal Host** (não External)
3. Verifique se todas as variáveis de ambiente estão corretas
4. No Railway, use as referências `${{MySQL.VARIAVEL}}`
5. Aguarde alguns minutos após criar o MySQL (pode demorar para inicializar)
6. Tente fazer redeploy da aplicação

### Erro "Token inválido"

**Problema:** API retorna 403 Forbidden

**Solução:**
1. Verifique se o `JWT_SECRET` está configurado nas variáveis de ambiente
2. Certifique-se de enviar o token no header: `Authorization: Bearer <token>`
3. O token expira em 7 dias - faça login novamente
4. Limpe o cache do navegador

### Servidor não inicia

**Problema:** Deploy falha ou servidor não responde

**Solução:**
1. Verifique os logs no dashboard (Render ou Railway)
2. Confirme que todas as variáveis de ambiente estão definidas
3. Verifique se o `PORT` está definido (Railway usa variável automática)
4. Execute `npm install` localmente para verificar dependências
5. Verifique se o `package.json` tem `"type": "module"`

### Admin não consegue fazer login

**Problema:** "Email ou senha inválidos"

**Solução:**
1. O usuário admin é criado automaticamente na primeira inicialização
2. Aguarde o servidor inicializar completamente (veja os logs)
3. Procure a mensagem "✅ Usuário admin criado" nos logs
4. Use exatamente: `admin@anotaganhos.com` / `Admin123!`
5. Se não funcionar, conecte ao MySQL e verifique a tabela `users`

### Banco de dados vazio após deploy

**Problema:** Tabelas não foram criadas

**Solução:**
1. O servidor cria as tabelas automaticamente ao iniciar
2. Verifique os logs para a mensagem "✅ Banco de dados inicializado"
3. Se não aparecer, pode haver erro de conexão com MySQL
4. Você pode executar manualmente o `schema.sql` no MySQL:
   - Render: use o console do MySQL no dashboard
   - Railway: use o cliente MySQL ou Railway CLI

## 📊 Monitoramento

### Logs no Render
1. Vá até o serviço
2. Clique em **"Logs"** (aba superior)
3. Veja logs em tempo real

### Logs no Railway
1. Vá até o serviço
2. Clique em **"Deployments"**
3. Clique no deployment ativo
4. Veja logs em tempo real

### Mensagens importantes nos logs
- `✅ Banco de dados inicializado com sucesso!` - DB OK
- `✅ Usuário admin criado` - Admin criado
- `🚀 Servidor rodando em http://localhost:3000` - Servidor OK
- `❌ Erro ao inicializar banco de dados` - Problema no MySQL

## 🔄 Atualizações

### Atualizar código no Render
1. Faça push para o GitHub
2. O Render fará deploy automático
3. Ou clique em **"Manual Deploy"** → **"Deploy latest commit"**

### Atualizar código no Railway
1. Faça push para o GitHub
2. O Railway fará deploy automático
3. Ou clique em **"Redeploy"** no menu do serviço

## 📝 Notas Importantes

1. **Valores monetários**: Armazenados em centavos (multiply por 100 ao salvar, divide por 100 ao exibir)
2. **Datas**: Use formato ISO 8601 (`YYYY-MM-DD`)
3. **JWT**: Tokens expiram em 7 dias
4. **Senhas**: Mínimo recomendado de 8 caracteres
5. **Admin**: Apenas um admin por padrão, crie mais via banco se necessário
6. **CORS**: Configurado para aceitar todas as origens (ajuste em produção se necessário)

## 🎯 Próximos Passos Recomendados

1. ✅ Deploy no Render ou Railway
2. ✅ Testar todas as funcionalidades
3. ✅ Alterar senha do admin
4. ⏳ Configurar domínio personalizado
5. ⏳ Configurar backup automático do MySQL
6. ⏳ Adicionar monitoramento (Sentry, LogRocket, etc.)
7. ⏳ Implementar rate limiting
8. ⏳ Adicionar testes automatizados

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a seção **Troubleshooting** acima
2. Consulte os logs do servidor
3. Abra uma issue no GitHub
4. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para Anota Ganhos Girls**

**Versão:** 2.0.0  
**Última atualização:** Outubro 2024

