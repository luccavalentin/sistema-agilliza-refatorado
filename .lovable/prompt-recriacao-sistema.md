# Prompt Mestre — Recriação Completa do Sistema GestCred

Este documento é um **prompt único, sequencial e auto-contido** para recriar do zero a plataforma de gestão para correspondentes bancários, corretores e clientes finais. Compatível com hospedagem em Vercel (stack 100% serverless/edge-friendly). Execute as etapas em ordem — cada uma é uma micro-tarefa fechada.

---

## 0. Contexto de produto (leia antes de começar)

Plataforma SaaS **multitenant** para o mercado de crédito (Crédito com Garantia de Imóvel / Home Equity, Crédito Consignado, Financiamento Imobiliário, Antecipação de Recebíveis). Três perfis de usuário que compartilham o mesmo backend mas enxergam portais distintos:

- **Correspondente** (tenant master / empresa) — dono da operação. Vê tudo da empresa: todos os corretores, todos os clientes, financeiro consolidado, comissões a pagar, conciliação bancária, relatórios gerenciais, configurações da empresa.
- **Corretor** (usuário da empresa) — vendedor vinculado a um correspondente. Vê só a própria carteira: seus clientes, suas propostas, suas comissões a receber, suas metas, suas tarefas.
- **Cliente final** (consumidor) — pessoa que contratou o crédito. Vê só as próprias propostas, documentos, status de análise e contrato.

**Regra de ouro multitenant:** toda entidade tem `correspondente_id` (tenant) + `corretor_id` (owner) + `cliente_id` (sujeito). Toda query é filtrada por tenant antes de qualquer coisa. RLS/policies aplicam o filtro no banco — nunca confiar só no frontend.

---

## 1. Identidade visual (LOCKED — não negociar)

Não inventar paleta. Use exatamente:

```
Brand (azul institucional):     #000F9F  (Pantone Blue 072 C)
Direction (vermelho destaque):  #F5333F  (Pantone Red 032 C)
Grafite (texto principal):      #1A1F2E
Cinza muito claro (surfaces):   #F5F6FA
Cinza claro (borders):          #E5E7EB
Cinza médio (muted text):       #6B7280
Sucesso:                        #15803D
Atenção:                        #D97706
Info:                           #2563EB
Sidebar background:              Azul brand #000F9F
Sidebar texto:                   #FFFFFF
```

- Fundo geral branco, cards brancos, sidebar azul-marinho institucional sólida.
- Raio padrão `0.5rem`. Tipografia Inter. Densidade média (parecida com Linear/Notion, não com Material).
- Status em badges com cor semântica + fundo translúcido (~12% opacidade).
- Botão primário azul brand sólido. Destrutivo vermelho direction. Secundário cinza muito claro.
- Tokens **semânticos obrigatórios** (nunca hardcodar `bg-white`, `text-black`, `#xxx` em componentes — sempre via tokens CSS).

---

## 2. Stack obrigatória (compatível com Vercel)

- Framework full-stack baseado em React com SSR/edge, file-based routing e server functions (RPC tipado cliente→servidor).
- Estilização via utilitários CSS com tokens semânticos em `:root`.
- Biblioteca de componentes acessíveis baseada em Radix (estilo shadcn).
- Estado/server cache via biblioteca de data-fetching com cache e invalidação.
- Validação com schema (Zod ou equivalente).
- Banco Postgres gerenciado com Row Level Security; storage de arquivos; auth gerenciada.
- Realtime via WebSocket/postgres changes para notificações e Kanban.
- Tudo deployável em Vercel (sem binários nativos, sem subprocessos, sem dependências Node-only).

---

## 3. Arquitetura multitenant (lógica central — implemente ANTES das telas)

### 3.1 Modelo de tenants

```
correspondente (tenant raiz)
  └── usuarios (corretores, admins, financeiro, operacional)
       └── clientes (carteira do corretor, mas pertence ao correspondente)
            └── propostas (ligadas a cliente + corretor + correspondente)
                 ├── documentos
                 ├── tratativas (timeline)
                 ├── comissoes (uma para o corretor, uma para o correspondente)
                 └── lancamentos_financeiros (a receber/a pagar)
```

### 3.2 Roles (papéis)

Tabela `user_roles` separada (NUNCA na tabela de profile). Enum `app_role`:
`super_admin | correspondente_admin | correspondente_financeiro | correspondente_operacional | corretor | cliente`.

Função `has_role(user_id, role)` SECURITY DEFINER. Todas as policies usam `has_role()` para evitar recursão.

### 3.3 Integração entre os 3 portais (o que torna o sistema "vivo")

**Evento único → reações em cascata nos 3 portais.** Exemplos:

1. **Corretor cria simulação para cliente** → aparece imediatamente no portal do cliente como "Simulação disponível", aparece no painel do correspondente como "nova simulação na carteira X".
2. **Cliente aceita simulação e envia documentos** → vira proposta no Kanban do corretor (etapa "Análise documental"), gera tarefa para o corretor, gera notificação para o correspondente.
3. **Corretor move proposta para "Enviada ao banco"** → cliente vê "Em análise no banco", correspondente vê na fila operacional.
4. **Banco aprova (corretor marca aprovação)** → automaticamente:
   - Gera **comissão prevista do corretor** (% sobre valor).
   - Gera **comissão prevista do correspondente** (% override sobre valor).
   - Cria **lançamento a receber** no financeiro do correspondente (recebível do banco).
   - Cria **lançamento a pagar** no financeiro do correspondente (comissão a pagar ao corretor).
   - Cria **lançamento a receber** no financeiro do corretor (comissão a receber).
   - Notifica os 3 portais.
   - Atualiza KPIs de todos os dashboards em tempo real.
5. **Banco efetiva pagamento (correspondente concilia OFX)** → comissão do corretor vira "Liberada para pagamento", após pagamento do correspondente vira "Paga" no portal do corretor.

**Toda essa lógica vive em repositórios server-side** (server functions) com transações ACID. Frontend só dispara a ação; toda cascata é atômica no banco com triggers/funções SQL quando possível.

### 3.4 Permissões por portal

| Recurso | Correspondente | Corretor | Cliente |
|---|---|---|---|
| Ver todos clientes do tenant | ✅ | ❌ (só os próprios) | ❌ (só ele mesmo) |
| Criar/editar corretor | ✅ | ❌ | ❌ |
| Aprovar/reprovar proposta | ✅ | ✅ (só as próprias) | ❌ |
| Ver comissões consolidadas | ✅ | ❌ (só as próprias) | ❌ |
| Pagar comissão | ✅ | ❌ | ❌ |
| Conciliação bancária | ✅ | ❌ | ❌ |
| Aceitar/recusar proposta | ❌ | ❌ | ✅ |
| Upload de documentos | ✅ | ✅ | ✅ (próprios) |

### 3.5 Realtime

Canais por tenant: `tenant:{correspondente_id}:propostas`, `tenant:{correspondente_id}:notificacoes`. Frontend assina apenas o próprio tenant.

---

## 4. Modelo de dados (schema canônico)

Crie nesta ordem, cada CREATE TABLE seguido de GRANT + ENABLE RLS + POLICIES na mesma migração:

1. `correspondentes` (id, razao_social, cnpj, plano, status, criado_em)
2. `app_role` enum + `user_roles` (user_id, role, correspondente_id) + `has_role()`
3. `profiles` (user_id, correspondente_id, nome, email, telefone, avatar_url, configuracoes_jsonb)
4. `bancos` (id, nome, codigo, produtos_aceitos[], ativo) — global, read-only para tenants
5. `produtos` (id, nome, tipo) — global
6. `clientes` (id, correspondente_id, corretor_id, nome, cpf, rg, nascimento, telefone, email, endereco_jsonb, origem, score, tags[], etapa_crm, criado_em)
7. `simulacoes` (id, correspondente_id, corretor_id, cliente_id, produto_id, banco_id, valor, parcelas, taxa, cet, resultado_jsonb, status, criado_em)
8. `propostas` (id, numero, correspondente_id, corretor_id, cliente_id, simulacao_id, banco_id, produto, valor, parcelas, taxa, etapa_kanban, status, criada_em, atualizada_em)
9. `proposta_historico` (id, proposta_id, usuario_id, acao, dados_jsonb, criado_em)
10. `documentos` (id, correspondente_id, proposta_id, cliente_id, tipo, nome, storage_path, tamanho, validade, status, enviado_por, criado_em)
11. `tratativas` (id, proposta_id, autor_id, tipo, mensagem, anexos_jsonb, criado_em)
12. `tarefas` (id, correspondente_id, atribuido_a, criado_por, titulo, descricao, prioridade, prazo, status, proposta_id?, cliente_id?, criado_em)
13. `categorias_financeiras` (id, correspondente_id, nome, tipo, cor) — `tipo`: receita | despesa
14. `centros_custo` (id, correspondente_id, nome)
15. `contas_financeiras` (id, correspondente_id, nome, banco, agencia, conta, tipo, saldo_inicial)
16. `lancamentos` (id, correspondente_id, tipo, descricao, categoria_id, centro_custo_id, conta_id, cliente_id?, proposta_id?, corretor_id?, valor, emissao, vencimento, liquidacao?, status, forma_pagamento, recorrencia_id?, criado_em)
17. `comissoes` (id, correspondente_id, corretor_id, cliente_id, proposta_id, banco_id, base_calculo, percentual, valor, status, data_prevista, data_pagamento?, bloqueada)
18. `recorrencias` (id, correspondente_id, descricao, valor, periodicidade, proxima_geracao, ativa)
19. `conciliacao_itens` (id, correspondente_id, conta_id, data, descricao, valor, status, lancamento_id?)
20. `notificacoes` (id, correspondente_id, usuario_id?, categoria, nivel, titulo, descricao, link, lida, criado_em)
21. `audit_log` (id, correspondente_id, usuario_id, tabela, registro_id, acao, antes_jsonb, depois_jsonb, criado_em)

**Policies padrão:** `SELECT/INSERT/UPDATE/DELETE` só onde `correspondente_id = (SELECT correspondente_id FROM profiles WHERE user_id = auth.uid())` **E** role apropriado via `has_role()`. Cliente final tem policy adicional: só vê linhas onde `cliente_id = (SELECT id FROM clientes WHERE auth_user_id = auth.uid())`.

---

## 5. Layout base (PortalShell) — micro-etapa de design

Antes de qualquer tela, construa o shell que TODOS os portais usam:

- **Sidebar fixa à esquerda** (256px desktop, drawer no mobile) — fundo azul `#000F9F`, texto branco. Logo no topo. Grupos colapsáveis com label em uppercase pequena. Item ativo: fundo branco translúcido + barra lateral branca. Submenu indentado com seta.
- **Topbar** (h=56px, fundo branco, borda inferior) — breadcrumb à esquerda + busca global (atalho ⌘K) ao centro + 3 botões à direita: **Notificações** (sino com badge contador) → **Sons** (toggle mute) → **Minha Conta** (avatar com menu).
- **Conteúdo:** container fluído com padding 24px, max-width adaptativo.
- **Notifications Center** (popover lateral 400px, lista agrupada por dia, filtros por categoria, ações marcar lida/limpar tudo).
- **Account Menu** (popover): aba Perfil (nome, email, telefone, avatar), aba Segurança (trocar senha, 2FA, sessões), aba Preferências (tema, idioma, sons), aba Notificações (canais por categoria), aba Dados (exportar LGPD), aba Sair.

---

## 6. Estrutura de menus por portal (LOCKED — não alterar)

### 6.1 Correspondente (`/correspondente`)
- **Visão Geral**: Painel de Monitoramento
- **CRM e Gestão de Cliente**: Scan IA · Flash IA · CRM de Clientes (Dashboard · Cadastro · Consultas · Relatórios)
- **Operacional**: Painel · Consultas · Simulações · Minhas Simulações · Propostas · Demandas & SLA · Tarefas · Relatórios
- **Gestão Financeira**: Painel Financeiro · Contas a Receber · Contas a Pagar · Comissões · Fluxo de Caixa · Conciliação Bancária · Categorias · Recorrências · Relatórios Financeiros
- **Configurações**: Empresa · Usuários · Bancos & Produtos · Tabelas de Comissão · Integrações · Plano & Faturamento

### 6.2 Corretor (`/corretor`)
- **Visão Geral**: Painel de Monitoramento
- **CRM e Gestão de Cliente**: Scan IA · Flash IA · CRM de Clientes (Dashboard · Cadastro · Consultas · Relatórios)
- **Operacional**: Painel · Consultas · Simulações · Minhas Simulações · Propostas · Demandas & SLA · Minhas Tarefas · Atualização de Proposta · Relatórios
- **Gestão Financeira**: Painel · Meus Recebíveis · Minhas Comissões · Minhas Despesas · Fluxo de Caixa · Recorrências · Relatórios
- **Configurações**

### 6.3 Cliente (`/cliente`)
- Início (resumo das propostas)
- Minha Proposta (detalhe + timeline + documentos + chat)
- Documentos (upload/lista)
- Histórico
- Minha Conta

---

## 7. Construção das telas (uma por micro-etapa)

Para cada tela: (a) layout em wireframe → (b) tokens semânticos → (c) hooks de dados via server function → (d) loading skeleton → (e) empty state → (f) error boundary → (g) responsivo mobile.

### Etapa 7.1 — Login / Cadastro
Tela única split-screen: esquerda branding azul brand + slogan, direita formulário (email/senha, "esqueci senha", "criar conta correspondente"). Pós-login, redireciona conforme role: super_admin → `/admin`, correspondente_* → `/correspondente`, corretor → `/corretor`, cliente → `/cliente`.

### Etapa 7.2 — Onboarding de correspondente
Wizard 4 passos: 1) Dados da empresa (CNPJ, razão social) · 2) Plano · 3) Convite dos primeiros usuários · 4) Bancos & produtos. Cria tenant + perfil admin.

### Etapa 7.3 — Dashboard Correspondente
KPIs (Propostas no mês · Volume R$ · Taxa de aprovação · Comissão prevista · Ticket médio · SLA médio) + gráfico de funil + ranking de corretores + últimas atividades. Cada KPI clicável abre **drill-down dialog** com tabela filtrada.

### Etapa 7.4 — Dashboard Corretor
KPIs pessoais + meta do mês com barra de progresso + próximas tarefas + propostas em atraso + comissões previstas vs realizadas.

### Etapa 7.5 — Dashboard Cliente
Card grande com status da proposta atual + timeline visual + próximas pendências (documentos faltantes) + chat com correspondente.

### Etapa 7.6 — CRM Dashboard
Funil visual por etapa (Lead → Qualificado → Em proposta → Cliente), cards de KPI (taxa conversão, ciclo médio, origem), tabela de últimos leads.

### Etapa 7.7 — CRM Cadastro de Cliente
Formulário em abas: Dados pessoais · Endereço · Documentos · Renda & garantias · Origem & tags. Máscaras de CPF/telefone/CEP, auto-fill via CEP.

### Etapa 7.8 — CRM Consultas
Tabela com filtros (etapa, corretor, origem, data, tag), busca por nome/CPF, ações em linha (ver, editar, criar simulação, criar proposta).

### Etapa 7.9 — CRM Relatórios
Filtros temporais + gráficos (origem, conversão por etapa, ticket por origem) + exportar CSV/PDF.

### Etapa 7.10 — Simulador
Wizard: 1) Cliente (autocomplete ou novo) · 2) Produto + banco · 3) Valor + parcelas + garantia · 4) Resultado (parcela, CET, IOF, seguros) com opção "Salvar simulação" e "Enviar ao cliente".

### Etapa 7.11 — Minhas Simulações
Tabela paginada com filtros, ação "Converter em proposta".

### Etapa 7.12 — Propostas Kanban
Colunas: Cadastro → Análise documental → Em análise no banco → Aprovada → Contrato emitido → Liberada → Reprovada. Cards arrastáveis (dnd-kit). Card mostra cliente, valor, banco, dias na etapa, alerta SLA. Drawer lateral ao clicar: detalhes + tabs (Geral · Documentos · Tratativas · Histórico · Chat). Botões Aprovar/Reprovar disparam cascata da seção 3.3.

### Etapa 7.13 — Demandas & SLA
Tabela de propostas com SLA estourado/próximo, agrupado por banco, com semáforo e tempo médio.

### Etapa 7.14 — Tarefas
Lista + calendário, criar tarefa vinculada a cliente/proposta, prioridade, prazo, atribuir.

### Etapa 7.15 — Atualização de Proposta (corretor)
Tela rápida: busca proposta por número, mostra etapa atual, permite anexar documento + escrever tratativa + mover etapa em 1 clique.

### Etapa 7.16 — Painel Financeiro
KPIs (Saldo · A receber 30d · A pagar 30d · Comissões previstas · Inadimplência), gráfico fluxo projetado vs realizado, próximos vencimentos.

### Etapa 7.17 — Contas a Receber / a Pagar
Tabela com filtros (status, vencimento, categoria, centro de custo, cliente), totalizadores, ações Pagar/Receber, edição inline, modal de novo lançamento.

### Etapa 7.18 — Comissões
Tabela com filtros (corretor, banco, status, período). Status: Prevista → Aprovada → Bloqueada → Liberada → Paga. Ações: bloquear, liberar, pagar (gera lançamento). Visão corretor: mesma tabela só com as próprias.

### Etapa 7.19 — Fluxo de Caixa
Gráfico de barras (entradas vs saídas por dia/semana/mês) + tabela diária + projeção 90 dias incluindo recorrências.

### Etapa 7.20 — Conciliação Bancária
Upload OFX/CNAB → lista de itens do extrato com sugestão automática de match com lançamentos → ações Confirmar / Criar lançamento / Ignorar. Indicador "X% conciliado".

### Etapa 7.21 — Categorias / Centros de Custo
CRUD simples com cor + tipo.

### Etapa 7.22 — Recorrências
CRUD de despesas/receitas recorrentes (aluguel, salários, mensalidades) com periodicidade e próxima geração automática.

### Etapa 7.23 — Relatórios Financeiros
DRE simplificado, comissões pagas vs previstas, inadimplência por corretor, exportação.

### Etapa 7.24 — Portal Cliente — Acompanhamento
Timeline grande da proposta com cada etapa, documentos pendentes destacados, chat com correspondente, botão "Aceitar contrato" quando liberado.

### Etapa 7.25 — Configurações Empresa
Aba Dados · Logotipo · Endereço · Equipe (convidar usuário, definir role) · Bancos habilitados · Tabelas de comissão por banco/produto · Integrações (OFX, e-sign, WhatsApp) · Plano & Faturamento.

### Etapa 7.26 — Notificações & Sons
Centro com filtros, marcar todas lidas, configurar canais (in-app, email, push) por categoria. Som curto ao receber notificação crítica (toggle no topbar).

### Etapa 7.27 — Minha Conta
Perfil, senha, 2FA, sessões ativas, preferências, exportar dados (LGPD), excluir conta.

---

## 8. Funcionalidades transversais

- **Busca global ⌘K**: indexa clientes, propostas, lançamentos. Resultados agrupados.
- **Realtime**: Kanban e notificações atualizam sem reload.
- **Upload seguro**: storage privado, URLs assinadas, antivírus opcional, validade dos documentos.
- **Audit log**: toda mutação relevante (aprovar proposta, pagar comissão, mudar role) registra em `audit_log`.
- **LGPD**: termo de consentimento no cadastro, exportar dados (JSON+PDF), excluir conta com anonimização.
- **i18n**: pt-BR default, estrutura pronta para en/es.
- **SEO** nas páginas públicas (login, landing): title <60c, description <160c, H1 único, JSON-LD da empresa.
- **PWA**: manifest + service worker para offline básico em mobile.
- **Observabilidade**: capturar erros frontend + server functions.

---

## 9. Diferenciais (pós-MVP, mesma arquitetura)

e-Sign nativa · WhatsApp Business API para tratativas · OCR de documentos · Score IA de aprovação · BI white-label · API pública para integrações de banco · App mobile.

---

## 10. Ordem de execução recomendada

1. Identidade visual + PortalShell (seções 1, 5)
2. Auth + roles + tenant (seções 3.2, 4 itens 1-3)
3. Schema completo + RLS (seção 4)
4. CRM (7.6 → 7.9)
5. Simulador + Propostas Kanban com cascata (7.10 → 7.13)
6. Financeiro completo (7.16 → 7.23)
7. Portal Cliente (7.24)
8. Configurações + Notificações + Conta (7.25 → 7.27)
9. Realtime, audit, LGPD, observabilidade (seção 8)
10. Deploy Vercel + domínio + monitoramento

Cada etapa entrega valor isolado e pode ser revisada antes da próxima.

---

**Fim do prompt mestre.** Use cada seção como instrução individual ao agente — uma seção por turno garante execução limpa.
