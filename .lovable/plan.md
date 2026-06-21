## Objetivo

Substituir os mocks espalhados (`buildMockRows`, arrays hardcoded em cada componente) por uma **camada de dados única, reativa e persistente** — sem Supabase. Tudo roda no navegador com `localStorage` como "banco", mas com a mesma API que será trocada por server functions depois (só troca a implementação do repositório, os componentes não mudam).

---

## Arquitetura

```text
src/data/
├── types.ts                  # entidades canônicas (Cliente, Proposta, Lancamento, Comissao, Tarefa, Tratativa, Notificacao...)
├── seed.ts                   # dados iniciais ricos e coerentes entre módulos
├── store.ts                  # store reativo (Zustand) + persist no localStorage
├── repositories/
│   ├── clientes.ts           # CRUD + filtros + agregações
│   ├── propostas.ts          # CRUD + mudança de etapa Kanban + timeline
│   ├── financeiro.ts         # lançamentos, recorrências, conciliação
│   ├── comissoes.ts          # geração automática a partir de propostas aprovadas
│   ├── tarefas.ts
│   └── notificacoes.ts       # gera notificações ao mudar estados
├── hooks/
│   ├── use-clientes.ts       # hooks React tipados que consomem o store
│   ├── use-propostas.ts
│   ├── use-financeiro.ts
│   ├── use-comissoes.ts
│   ├── use-dashboard.ts      # KPIs derivados (computed selectors)
│   └── use-detail-rows.ts    # alimenta o detail-dialog com dados reais
└── index.ts
```

**Regras-chave:**
- Uma única "fonte da verdade" por entidade. Componentes nunca mais declaram arrays mock locais.
- Mutações disparam efeitos cruzados: aprovar proposta → gera comissão + lançamento a receber + notificação + tratativa.
- Seletores derivam KPIs em tempo real (entradas previstas vs realizadas, funil CRM, SLA, etc.).
- Tudo persistido em `localStorage` sob a chave `gestcred.db.v1`, com botão "Resetar dados demo" nas configurações.

---

## Entidades (resumo)

- **Cliente**: id, nome, cpf, telefone, email, origem, etapa CRM, score, tags, dataCadastro, owner
- **Proposta**: id, clienteId, banco, produto, valor, parcelas, taxa, etapa Kanban, status, criadoEm, atualizadoEm, documentos[], chat[], timeline[]
- **Comissao**: id, propostaId, valor, percentual, status (prevista/aprovada/paga/cancelada), dataPrevista, dataPagamento, banco
- **Lancamento**: id, tipo (entrada/saida), categoria, descricao, valor, vencimento, pagamento, status, contaId, recorrenciaId?
- **Tarefa**: id, titulo, descricao, prioridade, prazo, status, propostaId?, clienteId?, atribuido
- **Tratativa**: id, propostaId|clienteId, autor, mensagem, tipo, criadoEm
- **Notificacao**: id, categoria, titulo, descricao, lida, criadoEm, link

Seed gera ~60 clientes, ~120 propostas espalhadas em todas as etapas, comissões/lançamentos derivados, tarefas e notificações coerentes com os últimos 90 dias.

---

## Migração dos componentes

Substituir por hooks reais (sem mudar a UI):

| Arquivo | Antes | Depois |
|---|---|---|
| `dashboards/*-dashboard.tsx` | KPIs hardcoded | `useDashboard(role)` |
| `dashboards/detail-dialog.tsx` | `buildMockRows()` | `useDetailRows(key, filters)` lendo do store |
| `operacional/propostas-kanban.tsx` | array local | `usePropostas()` + `moveProposta(id, etapa)` |
| `operacional/minhas-tarefas.tsx` | mock | `useTarefas()` |
| `operacional/minhas-simulacoes.tsx` | mock | `useSimulacoes()` (já existe arquivo de mock, vira repo) |
| `financeiro/fluxo-caixa.tsx` | mock | `useFluxoCaixa(periodo)` derivado de lançamentos |
| `financeiro/comissoes-view.tsx` | mock | `useComissoes(filtro)` |
| `financeiro/conciliacao-view.tsx` | mock | `useConciliacao()` |
| `financeiro/lancamentos-lista.tsx` | mock | `useLancamentos(filtro)` |
| `financeiro/recorrencias-view.tsx` | mock | `useRecorrencias()` |
| `financeiro/categorias-view.tsx` | mock | `useCategorias()` |
| `crm/crm-dashboard.tsx`, `crm-consultas.tsx`, `crm-cadastro.tsx` | mock | `useClientes()` + mutações |
| `cliente/cliente-acompanhamento.tsx` | mock | `usePropostasDoCliente(clienteId)` |
| `portal/notifications-center.tsx` | seed local | `useNotificacoes()` (já tem persist, refatorar pro store central) |

---

## Cross-module reactivity (o que faz o sistema "viver")

Quando o usuário **aprova uma proposta no Kanban**:
1. Status muda → timeline ganha entrada
2. Comissão automaticamente gerada (status "prevista")
3. Lançamento "a receber" criado no financeiro
4. Notificação disparada
5. KPIs dos 3 dashboards (correspondente/corretor/cliente) recalculam na hora
6. Funil CRM avança

Tudo isso fica em `repositories/propostas.ts` numa única função `aprovarProposta(id)`.

---

## Stack técnica

- **Zustand** com middleware `persist` — leve, sem boilerplate, já compatível com React 19
- Seletores memoizados para KPIs
- `nanoid` para IDs (já existe via deps transitivas, ou adicionar)
- Zero mudança em rotas, layout, design tokens

---

## Detalhes técnicos

- `store.ts` expõe `useDB()` com slices: `clientes`, `propostas`, `lancamentos`, `comissoes`, `tarefas`, `notificacoes`, `tratativas`, `categorias`, `recorrencias`, `bancos`
- Persist com versionamento (`version: 1`) e migração futura
- Botão "Resetar para dados demo" em `configuracoes` que limpa o storage e re-seeda
- Botão "Limpar tudo" que zera para banco vazio (útil pra testar fluxo)
- Quando trocar pra Supabase depois: só reimplementar `repositories/*` — hooks e componentes ficam intactos

---

## Entregáveis desta etapa

1. Estrutura `src/data/` completa com types, seed, store e repositórios
2. Refatoração de todos os componentes da tabela acima para consumir os hooks
3. `detail-dialog` lendo dados reais filtrados (não mais mock por KPI)
4. Ações do Kanban e cards realmente mutando o estado e refletindo nos outros módulos
5. Botões de reset/seed nas configurações
6. Mantém 100% da UI atual — só troca a fonte dos dados

---

## Fora do escopo (deixar para depois)

- Backend real (Supabase/API)
- Autenticação real
- Multi-usuário/sync entre abas (dá pra adicionar com `BroadcastChannel` num próximo passo)
- Upload real de arquivos (continua mock)

Posso começar?