# 💖 Anota Ganhos Girls

Sistema completo de tracking de ganhos para profissionais do entretenimento adulto.

## 🚀 Funcionalidades

- ✅ Autenticação própria (email/senha + nickname)
- ✅ Registro de ganhos com múltiplas moedas (GBP, EUR, USD)
- ✅ Múltiplas formas de pagamento (Cash, Revolut, PayPal, Wise, AIB, Crypto)
- ✅ Sistema de "Top" de 7 dias
- ✅ Histórico semanal com snapshots
- ✅ Painel administrativo completo
- ✅ Design feminino rosa/roxo
- ✅ Mobile-friendly

## 🛠️ Stack Tecnológica

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Node.js + Express + tRPC 11
- **Database:** MySQL (via Drizzle ORM)
- **Auth:** JWT + bcrypt

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Aplicar migrações
pnpm db:push

# Rodar em desenvolvimento
pnpm dev
```

## 🔐 Contas de Teste

### Admin
- Email: `admin@anotaganhos.com`
- Nickname: `admin`
- Senha: `senha.1997@`

### Usuário
- Email: `pedro@example.com`
- Nickname: `pedro`
- Senha: `senha.1997@`

## 📚 Documentação Completa

Veja `MANUAL_CLAUDE.md` para documentação completa incluindo:
- Estrutura do projeto
- Schema do banco de dados
- Instruções de deploy
- Guia para continuar desenvolvimento

## 🗄️ Estrutura do Banco

### Tabelas Principais
- `users` - Usuários do sistema
- `earnings` - Registros de ganhos
- `tops` - Períodos de tracking de 7 dias
- `weekly_snapshots` - Snapshots semanais

## 🚀 Deploy

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="sua-chave-secreta-forte"
PORT=3000
NODE_ENV=production
```

### Plataformas Recomendadas
- **Vercel** (recomendado)
- **Railway**
- **Render**

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build para produção
pnpm start        # Rodar produção
pnpm db:push      # Aplicar migrações
pnpm db:generate  # Gerar tipos Drizzle
```

## 🎨 Design

- Gradiente rosa/roxo
- Background feminino
- Interface mobile-first
- Componentes shadcn/ui

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

**Desenvolvido com ❤️**
