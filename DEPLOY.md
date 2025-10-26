# 🚀 Guia Completo de Deploy

Este guia contém instruções **passo a passo** para fazer deploy da aplicação Anota Ganhos Girls no **Render** e no **Railway**.

---

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. ✅ Conta no [GitHub](https://github.com) (gratuita)
2. ✅ Repositório `goldline-pay/Anota-ganhos-girls` no GitHub
3. ✅ Conta no [Render](https://render.com) OU [Railway](https://railway.app) (ambas gratuitas)

---

## 🎨 Opção 1: Deploy no Render (RECOMENDADO)

### ⏱️ Tempo estimado: 10-15 minutos

### Passo 1: Criar conta no Render

1. Acesse [https://render.com](https://render.com)
2. Clique em **"Get Started"**
3. Faça login com sua conta GitHub
4. Autorize o Render a acessar seus repositórios

### Passo 2: Criar banco de dados MySQL

1. No dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"MySQL"**
3. Preencha os campos:
   - **Name**: `anota-ganhos-db`
   - **Database**: `anota_ganhos_girls`
   - **User**: `root` (ou deixe o padrão)
   - **Region**: Escolha **"Frankfurt (EU Central)"** ou a mais próxima de você
   - **MySQL Version**: Deixe o padrão (8.0)
   - **Plan**: Selecione **"Free"** (ou o plano que preferir)
4. Clique em **"Create Database"**
5. ⏳ Aguarde 2-3 minutos até o banco ser criado (status ficará "Available")

### Passo 3: Copiar credenciais do MySQL

1. Clique no banco de dados que acabou de criar
2. Vá até a seção **"Connections"**
3. **COPIE E SALVE** as seguintes informações (você vai precisar):
   - **Internal Database URL** (algo como `mysql://root:senha@dpg-xxx.frankfurt-postgres.render.com/anota_ganhos_girls`)
   - **Hostname** (Internal) - exemplo: `dpg-xxx-a.frankfurt-postgres.render.com`
   - **Port** - geralmente `3306`
   - **Database** - `anota_ganhos_girls`
   - **Username** - geralmente `root`
   - **Password** - uma senha aleatória gerada

⚠️ **IMPORTANTE**: Use o **Internal Hostname**, NÃO o External!

### Passo 4: Criar Web Service

1. Volte ao dashboard principal do Render
2. Clique em **"New +"** → **"Web Service"**
3. Clique em **"Build and deploy from a Git repository"**
4. Clique em **"Connect account"** se ainda não conectou o GitHub
5. Procure e selecione o repositório: **`goldline-pay/Anota-ganhos-girls`**
6. Clique em **"Connect"**

### Passo 5: Configurar o Web Service

Preencha os campos:

- **Name**: `anota-ganhos-girls` (ou o nome que preferir)
- **Region**: Escolha a **mesma região do banco de dados** (Frankfurt)
- **Branch**: `main` (ou `master`, dependendo do seu repo)
- **Root Directory**: deixe vazio
- **Environment**: **`Node`**
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Selecione **"Free"** (ou o plano que preferir)

### Passo 6: Adicionar variáveis de ambiente

Role a página até a seção **"Environment Variables"**

Clique em **"Add Environment Variable"** e adicione **TODAS** as seguintes variáveis:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `[GERAR - veja abaixo]` |
| `DB_HOST` | `[hostname interno do MySQL]` |
| `DB_PORT` | `3306` |
| `DB_USER` | `root` (ou o user que você anotou) |
| `DB_PASSWORD` | `[senha do MySQL que você anotou]` |
| `DB_NAME` | `anota_ganhos_girls` |

#### Como gerar JWT_SECRET:

**Opção A** - Online:
1. Acesse [https://www.uuidgenerator.net/](https://www.uuidgenerator.net/)
2. Copie o UUID gerado
3. Use como JWT_SECRET

**Opção B** - Terminal (se tiver Node.js instalado):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Opção C** - Senha aleatória forte:
Use um gerador de senhas para criar uma string de 32+ caracteres

### Passo 7: Criar o serviço

1. Revise todas as configurações
2. Clique em **"Create Web Service"** (botão azul no final da página)
3. ⏳ Aguarde o deploy (pode levar 3-5 minutos)
4. Acompanhe o progresso na aba **"Logs"**

### Passo 8: Verificar deploy

Procure estas mensagens nos logs:

```
✅ Banco de dados inicializado com sucesso!
✅ Usuário admin criado: admin@anotaganhos.com / Admin123!
🚀 Servidor rodando em http://localhost:3000
```

Se vir essas mensagens, **parabéns! Deploy concluído!** 🎉

### Passo 9: Acessar a aplicação

1. No topo da página, você verá a URL do seu app (algo como `https://anota-ganhos-girls.onrender.com`)
2. Clique na URL ou copie e cole no navegador
3. Faça login com:
   - **Email**: `admin@anotaganhos.com`
   - **Senha**: `Admin123!`
4. **ALTERE A SENHA IMEDIATAMENTE!**

---

## 🚂 Opção 2: Deploy no Railway

### ⏱️ Tempo estimado: 10-15 minutos

### Passo 1: Criar conta no Railway

1. Acesse [https://railway.app](https://railway.app)
2. Clique em **"Login"**
3. Faça login com sua conta GitHub
4. Autorize o Railway a acessar seus repositórios

### Passo 2: Criar novo projeto

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure e selecione: **`goldline-pay/Anota-ganhos-girls`**
4. Clique no repositório para selecioná-lo
5. ⏳ O Railway começará o deploy automaticamente

### Passo 3: Adicionar banco de dados MySQL

1. No projeto (você verá um card com o nome do repo), clique em **"+ New"**
2. Selecione **"Database"**
3. Selecione **"Add MySQL"**
4. ⏳ Aguarde 1-2 minutos até o MySQL ser criado
5. Você verá um novo card chamado **"MySQL"**

### Passo 4: Configurar variáveis de ambiente

1. Clique no card do **seu repositório** (NÃO no MySQL)
2. Clique na aba **"Variables"** (no topo)
3. Clique em **"+ New Variable"**

Adicione **TODAS** as seguintes variáveis:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `[GERAR - veja abaixo]` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |

⚠️ **ATENÇÃO**: Para as variáveis do MySQL, digite **EXATAMENTE** como mostrado acima, incluindo `${{` e `}}`. O Railway substituirá automaticamente pelos valores corretos.

#### Como gerar JWT_SECRET:

Use uma das opções descritas na seção do Render acima.

### Passo 5: Gerar domínio público

1. Ainda no card do seu repositório, clique na aba **"Settings"**
2. Role até a seção **"Networking"**
3. Clique em **"Generate Domain"**
4. O Railway gerará uma URL pública (algo como `https://anota-ganhos-girls-production.up.railway.app`)
5. Copie essa URL

### Passo 6: Redeploy (se necessário)

Se você adicionou as variáveis de ambiente **depois** do primeiro deploy:

1. Clique nos **3 pontinhos** no canto superior direito do card do repo
2. Clique em **"Redeploy"**
3. ⏳ Aguarde o novo deploy (2-3 minutos)

### Passo 7: Verificar logs

1. Clique no card do seu repositório
2. Clique na aba **"Deployments"**
3. Clique no deployment mais recente (o primeiro da lista)
4. Role para baixo para ver os logs

Procure estas mensagens:

```
✅ Banco de dados inicializado com sucesso!
✅ Usuário admin criado: admin@anotaganhos.com / Admin123!
🚀 Servidor rodando em http://localhost:3000
```

Se vir essas mensagens, **parabéns! Deploy concluído!** 🎉

### Passo 8: Acessar a aplicação

1. Acesse a URL que você gerou no Passo 5
2. Faça login com:
   - **Email**: `admin@anotaganhos.com`
   - **Senha**: `Admin123!`
3. **ALTERE A SENHA IMEDIATAMENTE!**

---

## 🔧 Problemas Comuns e Soluções

### ❌ Erro: "connect ECONNREFUSED" ou "ER_ACCESS_DENIED_ERROR"

**Causa**: Aplicação não consegue conectar ao MySQL

**Soluções**:

1. **Render**:
   - Verifique se usou o **Internal Hostname** (não External)
   - Confirme que o MySQL está "Available" (não "Creating")
   - Verifique se todas as variáveis de ambiente estão corretas
   - Tente recriar o Web Service

2. **Railway**:
   - Verifique se usou `${{MySQL.VARIAVEL}}` (com cifrões e chaves duplas)
   - Confirme que o MySQL está rodando (card verde)
   - Faça um redeploy da aplicação
   - Aguarde 2-3 minutos após criar o MySQL antes de fazer deploy

### ❌ Erro: "Cannot find module" ou "MODULE_NOT_FOUND"

**Causa**: Dependências não foram instaladas

**Solução**:
1. Verifique se o Build Command está correto: `npm install`
2. Verifique se o `package.json` existe no repositório
3. Tente fazer um novo deploy (Render) ou redeploy (Railway)

### ❌ Erro: "Port already in use" ou "EADDRINUSE"

**Causa**: Conflito de porta (raro em produção)

**Solução**:
1. Verifique se a variável `PORT` está definida
2. No Railway, remova a variável `PORT` (Railway define automaticamente)
3. No Render, mantenha `PORT=3000`

### ❌ Aplicação não abre / Erro 503

**Causa**: Deploy falhou ou servidor não iniciou

**Solução**:
1. Verifique os logs para ver o erro específico
2. Confirme que todas as variáveis de ambiente estão definidas
3. Verifique se o banco MySQL está rodando
4. Tente fazer um novo deploy

### ❌ Admin não consegue fazer login

**Causa**: Usuário admin não foi criado

**Solução**:
1. Verifique os logs para a mensagem "✅ Usuário admin criado"
2. Se não aparecer, pode haver erro de conexão com o banco
3. Verifique as credenciais do MySQL
4. Tente fazer redeploy
5. Use exatamente: `admin@anotaganhos.com` / `Admin123!`

---

## ✅ Checklist Final

Após o deploy, verifique:

- [ ] Aplicação abre no navegador
- [ ] Login admin funciona
- [ ] Consegue criar uma anotação
- [ ] Consegue ver estatísticas
- [ ] Consegue iniciar um "top"
- [ ] Painel admin acessível
- [ ] Senha do admin foi alterada

---

## 📞 Precisa de Ajuda?

1. **Verifique os logs** - 90% dos problemas aparecem lá
2. **Consulte o README.md** - Seção "Troubleshooting"
3. **Abra uma issue no GitHub** - Descreva o problema e cole os logs
4. **Entre em contato** - suporte@anotaganhos.com

---

## 🎉 Deploy Concluído!

Se chegou até aqui e tudo funcionou, **parabéns!** 🎊

Sua aplicação está no ar e pronta para uso!

**Próximos passos recomendados:**
1. ✅ Alterar senha do admin
2. ✅ Criar usuários de teste
3. ✅ Testar todas as funcionalidades
4. ⏳ Configurar domínio personalizado (opcional)
5. ⏳ Configurar backups automáticos (opcional)
6. ⏳ Adicionar monitoramento (opcional)

---

**Última atualização:** Outubro 2024  
**Versão:** 2.0.0

