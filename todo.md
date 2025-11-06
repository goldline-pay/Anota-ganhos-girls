# Anota Ganhos Girls - TODO

## Projeto Simplificado Concluído
- [x] Sistema de autenticação com OAuth Manus
- [x] Adicionar ganhos com valor, moeda, duração e forma de pagamento
- [x] Visualizar totais por moeda (GBP, EUR, USD)
- [x] Histórico de ganhos
- [x] Remover ganhos
- [x] Interface mobile funcional e limpa

## Database Schema
- [x] Criar tabela de usuários com autenticação própria (email/senha)
- [x] Criar tabela de anotações de ganhos (earnings)
- [x] Criar tabela de snapshots semanais (week_snapshots)
- [x] Criar tabela de semanas correntes (current_week)
- [x] Criar tabela de logs de auditoria (audit_logs)

## Backend - Autenticação
- [x] Implementar registro de usuário com email e senha
- [x] Implementar login com JWT
- [x] Implementar middleware de autenticação
- [x] Implementar middleware de autorização admin
- [x] Criar usuário admin padrão automaticamente

## Backend - Anotações de Ganhos
- [x] Endpoint para criar anotação (valor, moeda, duração, forma de pagamento, data)
- [x] Endpoint para listar anotações do usuário
- [x] Endpoint para editar anotação (substituir, não duplicar)
- [x] Endpoint para deletar anotação
- [x] Suporte para múltiplas moedas (GBP, EUR, USD)
- [x] Suporte para formas de pagamento (Cash, Revolut, PayPal, Wise, AIB, Crypto)

## Backend - Sistema de Snapshots Semanais
- [x] Job automático que detecta fim de ciclo de 7 dias
- [x] Criar snapshot com todos os valores da semana (por usuária e global)
- [x] Zerar valores correntes do dashboard após snapshot
- [x] Colocar semana anterior no histórico (read-only)
- [x] Restringir edição retroativa (histórico somente leitura)
- [x] Permitir admin visualizar e editar tudo com log

## Backend - Backup e Auditoria
- [ ] Integração com Google Sheets para backup automático (SKIP - não prioritário)
- [ ] Gravar snapshot em Google Sheets ao finalizar semana (SKIP - não prioritário)
- [ ] Salvar link do arquivo no DB (SKIP - não prioritário)
- [x] Implementar logs de auditoria (timestamp, usuário, IP, ação)
- [x] Registrar eventos críticos (zerar semana, criar snapshot, edições)

## Backend - Sistema de Notificações
- [ ] Implementar retry 3x se job semanal falhar
- [ ] Notificar por e-mail/Telegram se falhar após retries

## Backend - Endpoints Admin
- [ ] Listar todos os usuários
- [ ] Visualizar anotações de qualquer usuário
- [ ] Editar anotações de qualquer usuário (com log)
- [ ] Deletar anotações de qualquer usuário (com log)
- [ ] Gerar snapshots manuais
- [ ] Acionar reprocessamento
- [ ] Exportar dados

## Frontend - Autenticação
- [x] Página de login com feedback visual
- [x] Página de registro com feedback visual
- [x] Logout
- [x] Proteção de rotas

## Frontend - Dashboard
- [x] Design mobile funcional e legível (evitar excesso de cores)
- [x] Exibir valores correntes da semana
- [x] Exibir totais por moeda (GBP, EUR, USD)
- [x] Exibir totais por forma de pagamento
- [x] Botão "Iniciar Top de 7 Dias"
- [x] Botão "Desativar Top"
- [x] Indicador visual de status do Top ativo
- [x] Carregamento correto de dados ao atualizar página (F5)
- [x] Loading indicators durante carregamento

## Frontend - Anotações
- [x] Formulário para criar anotação (valor, moeda, duração, forma de pagamento, data)
- [x] Seletor de moeda (GBP, EUR, USD)
- [x] Seletor de forma de pagamento (Cash, Revolut, PayPal, Wise, AIB, Crypto)
- [x] Lista de anotações com todos os campos visíveis
- [ ] Editar anotação (todos os campos editáveis) (SKIP - pode adicionar depois)
- [x] Deletar anotação
- [x] Feedback visual ao salvar/editar/deletar

## Frontend - Relatório Semanal
- [x] Exibir detalhamento diário dos ganhos
- [x] Mostrar total de cada moeda por dia
- [x] Mostrar formas de pagamento utilizadas por dia
- [x] Exibir cada anotação individual (valor, moeda, forma de pagamento)
- [x] Resumo consolidado dos ganhos totais por forma de pagamento

## Frontend - Histórico
- [x] Página de histórico de Tops anteriores
- [x] Exibir todas as semanas anteriores (read-only)
- [x] Detalhamento por dia de cada semana
- [x] Totais e resumos de cada semana

## Frontend - Painel Admin
- [ ] Dashboard admin com acesso a todas as contas
- [ ] Visualizar histórico e snapshots de todas as usuárias
- [ ] Editar dados de qualquer usuária (com confirmação)
- [ ] Logs de auditoria visíveis
- [ ] Exportar dados

## Testes e Deploy
- [ ] Testar criação de usuário
- [ ] Testar criação de anotações
- [ ] Testar edição de anotações
- [ ] Testar snapshot automático
- [ ] Testar backup em Google Sheets
- [ ] Testar logs de auditoria
- [ ] Verificar funcionamento em mobile
- [ ] Criar checkpoint final


## Bugs
- [x] Corrigir erro de autenticação - problema identificado: tRPC não está processando corretamente as mutations de login/register

## Nova Solicitação
- [x] Implementar sistema de autenticação próprio com email/senha (sem OAuth Manus)
- [x] Criar página de registro
- [x] Criar página de login
- [x] Armazenar senhas com hash bcrypt
- [x] Usar JWT para sessões

## Admin Features
- [x] Criar conta admin com email admin@anotaganhos.com
- [ ] Implementar endpoint para admin editar ganhos de qualquer usuária
- [ ] Implementar interface admin para visualizar todas as usuárias
- [ ] Implementar interface admin para editar ganhos

## Bugs
- [x] Corrigir erro na query da tabela earnings - tabela criada com sucesso

## Redesign Completo
- [x] Gerar imagens sensuais para background e elementos visuais
- [x] Implementar botão "Iniciar Top de 7 Dias"
- [x] Implementar botão "Desativar Top"
- [x] Mostrar status do Top ativo no dashboard
- [x] Criar página de Histórico com tops anteriores
- [x] Design feminino e sensual com cores adequadas
- [x] Relatório semanal detalhado por dia
- [x] Resumo consolidado por forma de pagamento

## Novas Funcionalidades Solicitadas
- [x] Adicionar botão de editar em cada ganho
- [x] Implementar modal/formulário de edição de ganhos
- [x] Criar painel admin para visualizar todas as contas
- [x] Permitir admin editar ganhos de qualquer usuária
- [x] Mostrar lista de todas as usuárias no painel admin

## Gráfico de Desempenho
- [x] Adicionar gráfico de ganhos totais por dia no painel admin
- [x] Usar biblioteca de gráficos (Recharts)
- [x] Mostrar totais consolidados por dia

## Novas Melhorias
- [x] Adicionar botão "Editar" em cada ganho na seção "Ganhos Recentes" do dashboard
- [x] Implementar modal de edição para usuários normais editarem seus próprios ganhos
- [x] Adicionar link/botão "Painel Admin" visível apenas para admin no dashboard

## Personalização
- [x] Adicionar nome do usuário na página inicial para personalização

## Bug
- [x] Link Admin não está aparecendo no dashboard para conta admin - corrigido salvando role no localStorage

## Novas Funcionalidades e Correções
- [x] Adicionar toggle "olhinho" para mostrar/ocultar senha
- [x] Corrigir bug ao editar valores
- [x] Reimplementar sistema de Top: duração de 7 dias (desativa automaticamente às 00:00 do 7º dia)
- [x] Permitir encerrar Top manualmente antes dos 7 dias
- [x] Gerar relatório completo ao encerrar Top (automático ou manual)
- [x] Relatório deve mostrar valores por forma de pagamento
- [x] Relatório deve mostrar totais por moeda (GBP, EUR, USD)
- [x] Relatório deve ter detalhamento dia a dia da semana
