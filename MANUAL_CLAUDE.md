# Manual Completo - Anota Ganhos Girls
## Guia para Continuar o Desenvolvimento com Claude

---

## 📋 RESUMO DO PROJETO

**Anota Ganhos Girls** é um sistema completo de tracking de ganhos para profissionais do entretenimento adulto, com:

- ✅ Autenticação própria (email/senha) com JWT e bcrypt
- ✅ Sistema de nickname (login com email OU nickname)
- ✅ Registro de ganhos com múltiplas moedas (GBP, EUR, USD)
- ✅ Múltiplas formas de pagamento (Cash, Revolut, PayPal, Wise, AIB, Crypto)
- ✅ Sistema de "Top" de 7 dias (períodos de tracking)
- ✅ Histórico semanal com snapshots automáticos
- ✅ Página de detalhes por semana com totais por moeda
- ✅ Painel administrativo completo
- ✅ Design feminino com gradiente rosa/roxo
- ✅ Mobile-friendly

---

## 🗂️ ESTRUTURA DO PROJETO

```
anota-ganhos-girls/
├── client/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── pages/            # Páginas principais
│   │   │   ├── Login.tsx     # Login com email/nickname
│   │   │   ├── Register.tsx  # Registro de usuário
│   │   │   ├── Dashboard.tsx # Dashboard principal
│   │   │   ├── History.tsx   # Histórico semanal
│   │   │   ├── HistoryDetail.tsx # Detalhes da semana
│   │   │   └── Admin.tsx     # Painel admin
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/trpc.ts       # Cliente tRPC
│   │   └── App.tsx           # Rotas principais
│   └── public/               # Assets estáticos
│       └── bg-feminine.jpg   # Background rosa/roxo
├── server/                    # Backend Node.js + tRPC
│   ├── routers.ts            # Todos os endpoints tRPC
│   ├── db.ts                 # Funções de banco de dados
│   └── _core/                # Core do framework
├── drizzle/                   # Schema e migrações
│   └── schema.ts             # Definição das tabelas
├── package.json              # Dependências
└── .env                      # Variáveis de ambiente (criar)
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `users`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- nickname (VARCHAR, UNIQUE) -- Login alternativo
- passwordHash (TEXT) -- Bcrypt hash
- name (VARCHAR)
- role (ENUM: 'user', 'admin')
- createdAt (TIMESTAMP)
```

### Tabela: `earnings`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- userId (INT, FOREIGN KEY → users.id)
- amount (INT) -- Valor em centavos (ex: 15000 = £150.00)
- currency (ENUM: 'GBP', 'EUR', 'USD')
- duration (INT) -- Duração em minutos
- paymentMethod (ENUM: 'Cash', 'Revolut', 'PayPal', 'Wise', 'AIB', 'Crypto')
- date (DATE)
- createdAt (TIMESTAMP)
```

### Tabela: `tops`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- userId (INT, FOREIGN KEY → users.id)
- startDate (DATE)
- endDate (DATE)
- status (ENUM: 'active', 'completed', 'cancelled')
- createdAt (TIMESTAMP)
```

### Tabela: `weekly_snapshots`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- userId (INT, FOREIGN KEY → users.id)
- weekStart (DATE)
- weekEnd (DATE)
- totalGross (INT) -- Total em centavos
- daysWorked (INT)
- createdAt (TIMESTAMP)
```

---

## 🔐 CONTAS DE TESTE

### Conta Admin
- **Email:** admin@anotaganhos.com
- **Nickname:** admin
- **Senha:** senha.1997@

### Conta Usuário (com dados simulados)
- **Email:** pedro@example.com
- **Nickname:** pedro
- **Senha:** senha.1997@
- **Dados:** 21 ganhos em 7 dias (27/out a 02/nov/2025)

---

## 🚀 COMO CONTINUAR COM CLAUDE

### 1️⃣ PREPARAÇÃO INICIAL

Envie para o Claude:

```
Olá! Preciso continuar o desenvolvimento do projeto "Anota Ganhos Girls".

CONTEXTO:
- Sistema de tracking de ganhos para profissionais
- Stack: React + TypeScript + Node.js + tRPC + MySQL
- Autenticação JWT própria (sem OAuth)
- Sistema de nickname para login alternativo
- Histórico semanal com snapshots

ARQUIVOS ANEXADOS:
- anota-ganhos-girls-complete.zip (código completo)
- MANUAL_CLAUDE.md (este arquivo)

Por favor, leia os arquivos e confirme que entendeu a estrutura do projeto.
```

---

### 2️⃣ INFORMAÇÕES NECESSÁRIAS PARA DEPLOY

#### **A. GitHub Repository**

1. Crie um repositório no GitHub (público ou privado)
2. Inicialize o Git no projeto:
```bash
cd anota-ganhos-girls
git init
git add .
git commit -m "Initial commit - Anota Ganhos Girls"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/anota-ganhos-girls.git
git push -u origin main
```

**Informe ao Claude:**
```
Repositório GitHub criado:
URL: https://github.com/SEU_USUARIO/anota-ganhos-girls
Branch principal: main
```

---

#### **B. Banco de Dados MySQL**

Você precisa de um banco MySQL. Opções recomendadas:

**Opção 1: PlanetScale (Grátis)**
- Site: https://planetscale.com
- Criar conta → New Database → Copiar connection string

**Opção 2: Railway (Grátis com limites)**
- Site: https://railway.app
- New Project → Add MySQL → Copiar connection string

**Opção 3: Aiven (Grátis)**
- Site: https://aiven.io
- Create Service → MySQL → Copiar connection string

**Connection String Format:**
```
mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
```

**Informe ao Claude:**
```
Banco de dados criado:
Provider: [PlanetScale/Railway/Aiven]
Connection String: mysql://user:pass@host:port/db
```

---

#### **C. Domínio (Opcional)**

Se quiser um domínio personalizado:

**Opções de Registro:**
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- Registro.br (Brasil): https://registro.br

**Informe ao Claude:**
```
Domínio registrado: anotaganhos.com
Preciso configurar DNS para apontar para [plataforma de deploy]
```

---

### 3️⃣ VARIÁVEIS DE AMBIENTE (.env)

Crie um arquivo `.env` na raiz do projeto com:

```env
# Banco de Dados
DATABASE_URL="mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}"

# JWT Secret (gere uma chave aleatória forte)
JWT_SECRET="sua-chave-secreta-muito-forte-aqui-123456"

# Porta do servidor
PORT=3000

# Node Environment
NODE_ENV=production
```

**Para gerar JWT_SECRET forte:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4️⃣ PLATAFORMAS DE DEPLOY RECOMENDADAS

#### **Opção 1: Vercel (Recomendado para este projeto)**

**Vantagens:**
- Deploy automático via GitHub
- SSL grátis
- Fácil configuração

**Instruções para Claude:**
```
Quero fazer deploy no Vercel.

Informações:
- GitHub repo: https://github.com/SEU_USUARIO/anota-ganhos-girls
- DATABASE_URL: [sua connection string]
- JWT_SECRET: [sua chave gerada]
- Domínio customizado (opcional): anotaganhos.com

Por favor, me guie no processo de deploy.
```

---

#### **Opção 2: Railway**

**Vantagens:**
- Deploy de fullstack (frontend + backend)
- Banco de dados integrado
- $5 grátis/mês

**Instruções para Claude:**
```
Quero fazer deploy no Railway.

Informações:
- GitHub repo: https://github.com/SEU_USUARIO/anota-ganhos-girls
- Já tenho banco MySQL no Railway
- DATABASE_URL: [connection string]
- JWT_SECRET: [sua chave]

Por favor, me guie no processo de deploy.
```

---

#### **Opção 3: Render**

**Vantagens:**
- Plano grátis disponível
- Deploy via GitHub
- SSL automático

**Instruções para Claude:**
```
Quero fazer deploy no Render.

Informações:
- GitHub repo: https://github.com/SEU_USUARIO/anota-ganhos-girls
- DATABASE_URL: [connection string]
- JWT_SECRET: [sua chave]

Por favor, me guie no processo de deploy.
```

---

### 5️⃣ COMANDOS ÚTEIS

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Rodar em produção
pnpm start

# Aplicar migrações do banco
pnpm db:push

# Gerar tipos do Drizzle
pnpm db:generate
```

---

### 6️⃣ ESTRUTURA DE PEDIDOS PARA CLAUDE

#### **Para Novas Funcionalidades:**
```
Preciso adicionar [funcionalidade].

Contexto:
- [Descreva o que precisa]
- [Onde deve aparecer no sistema]
- [Regras de negócio]

Exemplo: Usuários podem ver apenas seus próprios dados, admin vê tudo.
```

#### **Para Correções de Bugs:**
```
Encontrei um bug: [descrição do problema]

Passos para reproduzir:
1. [Passo 1]
2. [Passo 2]
3. [Resultado esperado vs resultado atual]

Erro no console (se houver): [copie o erro]
```

#### **Para Mudanças de Design:**
```
Quero mudar o design de [componente/página].

Mudanças desejadas:
- [Mudança 1]
- [Mudança 2]

Referência visual (se tiver): [link ou descrição]
```

---

## 📊 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Autenticação
- [x] Registro com email, nickname, senha e nome
- [x] Login com email OU nickname
- [x] Hash de senha com bcrypt
- [x] JWT para sessões (30 dias)
- [x] Toggle de senha (ícone olhinho)
- [x] Middleware de autenticação
- [x] Middleware de autorização admin

### ✅ Dashboard
- [x] Saudação personalizada "Olá, [nickname]!"
- [x] Formulário de adicionar ganho
- [x] Lista de ganhos recentes
- [x] Botão editar em cada ganho
- [x] Botão deletar em cada ganho
- [x] Totais por moeda (GBP, EUR, USD)
- [x] Link para painel admin (só para admin)

### ✅ Sistema de Top
- [x] Iniciar Top de 7 dias
- [x] Desativar Top manualmente
- [x] Encerramento automático após 7 dias
- [x] Status visual do Top ativo

### ✅ Histórico
- [x] Seletor de semana
- [x] Lista de semanas disponíveis
- [x] Totais por semana
- [x] Botão "Ver Detalhes"
- [x] Página de detalhes com:
  - Nome do usuário e período
  - Totais por moeda
  - Lista completa de ganhos

### ✅ Painel Admin
- [x] Lista de todas as usuárias
- [x] Lista de todos os ganhos
- [x] Editar ganhos de qualquer usuária
- [x] Deletar ganhos de qualquer usuária
- [x] Gráfico de desempenho (últimos 30 dias)

### ✅ Permissões
- [x] Usuários veem apenas seus dados
- [x] Admin vê dados de todos
- [x] Validação no backend e frontend

---

## 🔧 MELHORIAS FUTURAS SUGERIDAS

### Prioridade Alta
- [ ] Sistema de recuperação de senha por email
- [ ] Exportar relatórios em PDF
- [ ] Gráficos de desempenho no dashboard do usuário
- [ ] Notificações quando Top está próximo de encerrar

### Prioridade Média
- [ ] Backup automático em Google Sheets
- [ ] Sistema de metas semanais/mensais
- [ ] Comparação de desempenho entre semanas
- [ ] Filtros avançados no histórico

### Prioridade Baixa
- [ ] Modo escuro
- [ ] Múltiplos idiomas (PT/EN/ES)
- [ ] App mobile (React Native)
- [ ] Integração com Telegram para notificações

---

## 🐛 PROBLEMAS CONHECIDOS

### Avisos TypeScript (Não afetam funcionamento)
```
server/_core/oauth.ts: Property 'upsertUser' does not exist
server/_core/sdk.ts: Property 'getUserByOpenId' does not exist
```

**Causa:** Sistema usa autenticação própria, não OAuth Manus.
**Solução:** Ignorar ou remover arquivos OAuth não utilizados.

---

## 📞 SUPORTE E DÚVIDAS

### Para Claude:
```
Tenho uma dúvida sobre [tópico].

Contexto: [explique o que está tentando fazer]
Problema: [descreva o problema]
Já tentei: [o que já fez]

Arquivos relevantes: [mencione os arquivos envolvidos]
```

---

## 📝 CHECKLIST PARA DEPLOY

Antes de fazer deploy, confirme:

- [ ] Código está no GitHub
- [ ] Banco de dados MySQL criado e acessível
- [ ] Connection string do banco testada
- [ ] JWT_SECRET gerado (32+ caracteres aleatórios)
- [ ] Variáveis de ambiente configuradas na plataforma de deploy
- [ ] Build local funciona (`pnpm build`)
- [ ] Migrações aplicadas (`pnpm db:push`)
- [ ] Conta admin criada no banco
- [ ] Domínio registrado (se aplicável)
- [ ] DNS configurado para apontar para deploy (se aplicável)

---

## 🎯 EXEMPLO DE CONVERSA INICIAL COM CLAUDE

```
Olá Claude!

Estou continuando o desenvolvimento do projeto "Anota Ganhos Girls" - um sistema de tracking de ganhos.

ARQUIVOS ANEXADOS:
- anota-ganhos-girls-complete.zip (código completo)
- MANUAL_CLAUDE.md (manual com todas as informações)

INFORMAÇÕES DE DEPLOY:
- GitHub: https://github.com/meuusuario/anota-ganhos-girls
- Banco: PlanetScale
- DATABASE_URL: mysql://user:pass@host/db
- JWT_SECRET: [minha chave gerada]
- Plataforma: Vercel

PRÓXIMO PASSO:
Quero fazer o deploy do projeto no Vercel. Por favor:
1. Revise a estrutura do projeto
2. Me guie no processo de deploy passo a passo
3. Configure as variáveis de ambiente
4. Teste se tudo está funcionando

Pode começar?
```

---

## ✅ CONCLUSÃO

Este manual contém **TODAS** as informações necessárias para você continuar o desenvolvimento com Claude:

1. ✅ Estrutura completa do projeto
2. ✅ Schema do banco de dados
3. ✅ Contas de teste
4. ✅ Instruções de deploy para 3 plataformas
5. ✅ Variáveis de ambiente
6. ✅ Comandos úteis
7. ✅ Lista de funcionalidades implementadas
8. ✅ Sugestões de melhorias
9. ✅ Checklist de deploy
10. ✅ Exemplos de como pedir ajuda ao Claude

**Basta enviar o ZIP + este manual para o Claude e ele terá tudo que precisa!**

---

**Desenvolvido com ❤️ para Anota Ganhos Girls**
