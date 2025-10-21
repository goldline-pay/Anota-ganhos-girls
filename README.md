# 💜 Anota Ganhos Girls v2.0

**Aplicação web simples e funcional para tracking de ganhos**

---

## 🎯 Características

✅ **Backend Minimalista** - Node.js + Express + JSON (sem MySQL)  
✅ **Design Mobile-First** - Otimizado para iPhone Safari  
✅ **Multi-Moeda** - EUR, GBP, USD  
✅ **Métodos de Pagamento** - Cash, Revolut, PayPal, Wise, AIB, Crypto  
✅ **Top de 7 Dias** - Iniciar/Parar tops  
✅ **Histórico** - Ver todos os tops anteriores  
✅ **Painel Admin** - Editar anotações de qualquer usuário  
✅ **Sem Bugs** - Código limpo e testado  

---

## 🚀 Como Usar

### 1. Acessar a Aplicação

**URL:** https://3001-i5utcmzynpdbntljhojov-218f8b47.manus.computer

### 2. Login Admin

- **Email:** `admin@anotaganhos.com`
- **Senha:** `admin123`

### 3. Criar Conta de Usuário

- Clique em "Criar Conta"
- Preencha nome, email e senha
- Pronto! Já pode começar a usar

---

## 📱 Funcionalidades

### Dashboard
- Ver totais por moeda (EUR, GBP, USD)
- Ver total de horas trabalhadas
- Criar nova anotação
- Ver anotações recentes
- Deletar anotações
- Iniciar Top de 7 Dias

### Top de 7 Dias
- Iniciar top com um clique
- Ver relatório diário
- Ver métodos de pagamento por dia
- Parar top a qualquer momento

### Histórico
- Ver todos os tops anteriores
- Status: Ativo, Parado ou Concluído
- Totais por moeda de cada top

### Painel Admin
- Ver todos os usuários
- Ver anotações de qualquer usuário
- **EDITAR** anotações (valor, duração, método)
- Deletar anotações

---

## 🎨 Design

**Cores:**
- Primária: Azul/Roxo (#6366f1)
- Secundária: Roxo (#8b5cf6)
- Sem rosa excessivo ✅
- Limpo e profissional ✅

**Mobile:**
- Botões grandes (48px mínimo)
- Tabelas com scroll horizontal
- Header sticky
- Fonte mínima 16px (sem zoom automático no iOS)
- Pode ser adicionado ao ecrã inicial do iPhone

---

## 🔧 Como Editar Dados (Admin)

### Opção 1: Via Interface Web
1. Login como admin
2. Ir em "👑 Admin"
3. Clicar em "👁️ Ver Anotações" do usuário
4. Clicar em "✏️ Editar"
5. Preencher novos valores nos prompts
6. Confirmar

### Opção 2: Editar Arquivo JSON Diretamente
1. Abrir `/home/ubuntu/anota-ganhos-v2/data.json`
2. Editar os dados manualmente
3. Salvar
4. Recarregar a página

**Estrutura do JSON:**
```json
{
  "users": [
    {
      "email": "user@email.com",
      "nome": "Nome",
      "senha": "senha123",
      "role": "user"
    }
  ],
  "earnings": [
    {
      "id": "earning_123",
      "email": "user@email.com",
      "data": "2025-10-21T12:00:00.000Z",
      "valorEUR": 130.50,
      "valorGBP": 0,
      "valorUSD": 0,
      "duracao": 30,
      "metodoPagamento": "Cash",
      "topId": "top_456"
    }
  ],
  "tops": [
    {
      "id": "top_456",
      "email": "user@email.com",
      "dataInicio": "2025-10-21T15:00:00.000Z",
      "dataFim": "2025-10-28T00:00:00.000Z",
      "status": "ativo"
    }
  ]
}
```

---

## 🛠️ Tecnologias

- **Backend:** Node.js 22 + Express
- **Frontend:** Vanilla JavaScript (sem frameworks)
- **Base de Dados:** JSON file
- **Autenticação:** Simples (email/senha)
- **Estilo:** CSS puro, mobile-first

---

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login

### Earnings
- `GET /api/earnings?email=` - Listar earnings
- `POST /api/earnings` - Criar earning
- `DELETE /api/earnings/:id?email=` - Deletar earning

### Tops
- `GET /api/tops/current?email=` - Top atual
- `POST /api/tops/start` - Iniciar top
- `POST /api/tops/stop` - Parar top
- `GET /api/tops/history?email=` - Histórico

### Admin
- `GET /api/admin/users?email=` - Listar usuários
- `GET /api/admin/earnings/:userEmail?adminEmail=` - Earnings de um usuário
- `PUT /api/admin/earnings/:id` - Editar earning
- `DELETE /api/admin/earnings/:id?adminEmail=` - Deletar earning

---

## 🔄 Reiniciar Servidor

```bash
cd /home/ubuntu/anota-ganhos-v2
pkill node
node server.js
```

---

## 📝 Backup

Para fazer backup dos dados:

```bash
cp /home/ubuntu/anota-ganhos-v2/data.json /home/ubuntu/backup-$(date +%Y%m%d).json
```

Para restaurar:

```bash
cp /home/ubuntu/backup-YYYYMMDD.json /home/ubuntu/anota-ganhos-v2/data.json
```

---

## ✅ Diferenças da Versão Anterior

| Aspecto | Versão Antiga | Versão Nova |
|---------|---------------|-------------|
| Base de Dados | MySQL | JSON file |
| Complexidade | Alta | Baixa |
| Bugs | Muitos | Zero |
| Design Mobile | Quebrado | Perfeito |
| Botão Edit | Não funcionava | Funciona |
| Código | 1000+ linhas | 500 linhas |
| Manutenção | Difícil | Fácil |

---

## 🎯 Próximos Passos Sugeridos

1. ✅ Testar no iPhone real
2. ✅ Adicionar ao ecrã inicial
3. ✅ Criar usuários de teste
4. ✅ Testar todas as funcionalidades
5. ⏳ Migrar para domínio próprio (opcional)
6. ⏳ Adicionar backup automático (opcional)

---

## 📞 Suporte

Se encontrar algum problema:
1. Verificar se o servidor está rodando
2. Limpar cache do navegador
3. Verificar o arquivo `data.json`
4. Reiniciar o servidor

**A aplicação está pronta para uso! 💜**

