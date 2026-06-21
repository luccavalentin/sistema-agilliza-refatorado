# PROMPT — Migração para Produção (sem dados mockados)

> Objetivo: transformar o protótipo atual (store local + seeds determinísticos) em um sistema **multitenant** real, com **persistência em banco**, **autenticação**, **autorização por papel**, **realtime**, **auditoria** e **deploy estável na Vercel**. Nenhuma tela pode renderizar dados mockados; toda leitura/escrita passa pelo backend com RLS.

---

## 0. Princípios inegociáveis

1. **Zero mock em runtime.** `src/lib/**/mock-data.ts`, `src/data/store.ts` (Zustand persistido) e qualquer `seed*` deixam de ser fonte de verdade. Permanecem **apenas** como fixtures de teste (`__tests__/fixtures`) ou como _seed SQL_ executado em migration.
2. **Server-first.** Toda leitura sensível roda em **server functions** (`createServerFn` + `requireSupabaseAuth`) ou **server routes** (`/api/public/*` para webhooks). Componentes só consomem via TanStack Query.
3. **RLS sempre ligado.** Cada tabela do schema `public` tem RLS habilitado, GRANTs explícitos e políticas escopadas por `tenant_id` + `auth.uid()` + papel.
4. **Multitenant por `tenant_id`.** Toda tabela de negócio carrega `tenant_id uuid not null`. Toda policy filtra por `tenant_id = current_tenant()`.
5. **Idempotência e auditoria.** Mutações cruzadas (aprovar proposta → gera comissão + recebível + notificação) rodam em **uma única RPC transacional** e gravam em `audit_log`.
6. **Sem estado global em memória do servidor.** Workers são stateless; cache só em TanStack Query (cliente) e Postgres (servidor).

---

## 1. Inventário do que precisa sair

Remover ou neutralizar:

- `src/data/store.ts` — substituir por hooks que consultam o backend via Query.
- `src/data/hooks.ts` — reescrever sobre `useSuspenseQuery` + server fns.
- `src/data/repositories.ts` — virar **server functions** chamando RPCs.
- `src/data/hydration-gate.tsx` — deletar (não há mais hidratação local).
- `src/lib/operacional/mock-data.ts` e `src/lib/financeiro/mock-data.ts` — mover para `supabase/seed.sql` (apenas em ambientes dev/staging).
- Botões "Restaurar demo / Limpar tudo" do `AccountMenu` — remover em produção (manter atrás de flag `import.meta.env.VITE_ENABLE_DEMO_RESET`).

---

## 2. Esquema de banco (resumo — ver `prompt-recriacao-sistema.md` para SQL completo)

Tabelas mínimas (todas com `id uuid pk`, `tenant_id uuid not null`, `created_at`, `updated_at`):

`tenants, profiles, user_roles, memberships, bancos, clientes, simulacoes, propostas, proposta_historico, demandas, tarefas, categorias, centros_custo, contas_financeiras, lancamentos, comissoes, recorrencias, conciliacao_itens, notificacoes, audit_log, sessions, webhooks, chat_messages, lgpd_consents`.

Regras obrigatórias por tabela:

```sql
-- padrão para toda tabela pública
create table public.<t> (...);
grant select, insert, update, delete on public.<t> to authenticated;
grant all on public.<t> to service_role;
alter table public.<t> enable row level security;

create policy "<t>_tenant_isolation" on public.<t>
  for all to authenticated
  using (tenant_id = public.current_tenant())
  with check (tenant_id = public.current_tenant());
```

Funções de apoio (security definer, `search_path = public`):

- `current_tenant() returns uuid` — lê `auth.jwt() -> 'app_metadata' -> 'tenant_id'` ou tabela `memberships` da sessão ativa.
- `has_role(_uid uuid, _role app_role) returns boolean` — consulta `user_roles`.
- `is_member_of(_tenant uuid) returns boolean`.

**Enum de papéis:** `create type app_role as enum ('super_admin','correspondente','corretor','cliente','financeiro','operacional');`

---

## 3. RPCs transacionais (substituem os repositories do front)

Implementar como `create or replace function` no schema `public`, `security definer`, todas auditadas:

- `rpc_aprovar_proposta(p_proposta uuid)` — atualiza proposta, insere comissão prevista, insere lançamento a receber, insere notificação, registra `audit_log`.
- `rpc_reprovar_proposta(p_proposta uuid, p_motivo text)`.
- `rpc_mover_etapa(p_proposta uuid, p_etapa text)`.
- `rpc_marcar_lancamento_pago(p_lanc uuid, p_data date, p_valor numeric)`.
- `rpc_marcar_comissao_paga(p_com uuid)`.
- `rpc_conciliar_item(p_item uuid, p_lanc uuid)`.

Cada RPC valida `has_role` + `current_tenant()` antes de mutar.

---

## 4. Camada de acesso no app (TanStack Start)

### 4.1. Estrutura de arquivos

```
src/server/queries/        # tipos e queryOptions compartilhados (client-safe)
src/lib/propostas.functions.ts
src/lib/financeiro.functions.ts
src/lib/crm.functions.ts
src/lib/notificacoes.functions.ts
src/lib/tenant.functions.ts
src/integrations/supabase/{client.ts, client.server.ts, auth-middleware.ts, auth-attacher.ts}
```

Regras:

- `*.functions.ts` em `src/lib/` (nunca em `src/server/`).
- Imports de `client.server.ts` só dentro de `.handler()` via `await import(...)`.
- Toda fn autenticada usa `.middleware([requireSupabaseAuth])`.
- `attachSupabaseAuth` registrado **uma vez** em `src/start.ts` (append ao array existente).

### 4.2. Padrão de leitura

```ts
// src/server/queries/propostas.ts
export const propostasQueryOptions = (filtros: Filtros) =>
  queryOptions({
    queryKey: ['propostas', filtros],
    queryFn: () => listarPropostas({ data: filtros }),
  });

// rota protegida (sob _authenticated/)
loader: ({ context }) => context.queryClient.ensureQueryData(propostasQueryOptions({}))

// componente
const { data } = useSuspenseQuery(propostasQueryOptions(filtros));
```

### 4.3. Padrão de mutação

```ts
const aprovar = useServerFn(aprovarPropostaFn);
const m = useMutation({
  mutationFn: aprovar,
  onSuccess: (_r, vars) => {
    queryClient.invalidateQueries({ queryKey: ['propostas'] });
    queryClient.invalidateQueries({ queryKey: ['comissoes'] });
    queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
  },
});
```

---

## 5. Autenticação e autorização

1. Habilitar Supabase Auth (email/senha + OAuth Google via broker Lovable).
2. Criar `profiles` automaticamente por trigger `on_auth_user_created`.
3. Atribuir `tenant_id` em `app_metadata` no momento do convite (`memberships` controla múltiplos vínculos).
4. Layout `src/routes/_authenticated/route.tsx` é **gerenciado pela integração** — não editar.
5. Sub-layouts por papel:
   - `_authenticated/correspondente/route.tsx` → `beforeLoad` verifica `has_role('correspondente'|'super_admin')`.
   - idem para `corretor`, `cliente`, `financeiro`.
6. Rota `/auth` pública com login, signup (apenas convite), recuperação de senha (`/reset-password` obrigatório).

---

## 6. Realtime

Para cada tabela com UI ao vivo (`propostas`, `notificacoes`, `chat_messages`, `tarefas`):

```sql
alter publication supabase_realtime add table public.<t>;
alter table public.<t> replica identity full;
```

No cliente, subscrever **dentro de `useEffect`** com cleanup (`supabase.removeChannel`). Disparar `queryClient.invalidateQueries` no payload recebido — nunca alterar cache manualmente.

---

## 7. Webhooks e jobs

- `src/routes/api/public/webhooks/*.ts` — HMAC obrigatório, `timingSafeEqual`, validação Zod, escrita via `supabaseAdmin` carregado dentro do handler.
- Cron via `pg_cron` + `pg_net` chamando endpoints estáveis `project--<id>.lovable.app/api/public/cron/*` (SLA, recorrências, fechamento mensal de comissão).

---

## 8. Secrets

Server-only (via `add_secret`, nunca em `.env` commitado): `SUPABASE_SERVICE_ROLE_KEY`, `WEBHOOK_HMAC_SECRET`, integrações bancárias, gateway de pagamento, e-mail transacional. Cliente recebe apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## 9. Estados de UI obrigatórios em toda tela

`loading (skeleton)`, `empty`, `error (com retry via router.invalidate)`, `forbidden (403)`, `offline`, `saving/optimistic`. Sem isso, telas piscam dados velhos ou quebram em produção.

---

## 10. Checklist de migração (executar nesta ordem)

1. **Migration inicial** com todas as tabelas, enums, funções, policies, grants, triggers de `updated_at` e publication realtime.
2. **Seed SQL** (apenas dev/staging) — converter conteúdo de `src/lib/**/mock-data.ts` em `insert` por `tenant_id` de demo.
3. **RPCs transacionais** (seção 3) com testes via `supabase--test_edge_functions` ou pgTAP.
4. **Server functions** por domínio (`propostas`, `financeiro`, `crm`, `notificacoes`, `tarefas`, `simulacoes`, `configuracoes`, `tenant`).
5. **Trocar hooks**: reescrever `src/data/hooks.ts` para reexportar `queryOptions` do servidor; deletar store Zustand.
6. **Refatorar cada tela** (uma por commit) consumindo `useSuspenseQuery`. Ordem sugerida:
   1. `portal/notifications-center` e `portal/account-menu`
   2. Dashboards (correspondente, corretor, cliente)
   3. Propostas (kanban + drawer + aprovar/reprovar)
   4. CRM (clientes, cadastro, consultas, relatórios)
   5. Operacional (simulações, tarefas, demandas, consultas, atualização)
   6. Financeiro (recebíveis, pagar, comissões, fluxo, conciliação, recorrências, categorias, relatórios)
   7. Configurações (perfil, white-label, integrações, regras de comissão, equipe)
   8. Portal do cliente (acompanhamento, proposta)
7. **Auditoria**: gravar em `audit_log` toda mutação relevante via trigger genérica.
8. **Realtime**: habilitar nas tabelas da seção 6 e plugar invalidations.
9. **Webhooks/cron**: implementar SLA vencido, fechamento de comissão, lembrete de documento.
10. **Remover código morto**: `src/data/store.ts`, `hydration-gate`, `mock-data.ts`, botões de demo.
11. **Testes E2E** (Playwright) em fluxos críticos: login → criar proposta → aprovar → comissão gerada → recebível liquidado → notificação chega no corretor e cliente.
12. **Hardening**: CSP, headers de segurança, rate limit nas rotas `/api/public/*`, validação Zod em 100% das entradas, sanitização de markdown/HTML.
13. **Observabilidade**: logs estruturados em server fns, captura de erro no SSR (`src/server.ts` já tem base), painel de erros do Supabase.
14. **Deploy Vercel**: variáveis em Production/Preview, domínio custom, preview por PR, smoke test pós-deploy.

---

## 11. Definition of Done por tela

Uma tela só sobe para produção quando:

- [ ] Zero import de `src/data/store` ou `**/mock-data`.
- [ ] Leitura via `useSuspenseQuery(queryOptions)` ligado a `createServerFn` autenticado.
- [ ] Mutação via `useMutation` + invalidations corretas.
- [ ] RLS testada com 2 tenants distintos (não vaza linhas).
- [ ] Estados loading/empty/error/forbidden implementados.
- [ ] Realtime ativo onde aplicável.
- [ ] Auditoria gravando em `audit_log`.
- [ ] Acessibilidade (labels, foco, contraste AA).
- [ ] Telemetria de erro chega ao painel.
- [ ] E2E cobrindo o caminho feliz e um caminho de erro.

---

## 12. Como pedir ao Lovable que execute

Cole na próxima mensagem:

> "Execute o `prompt-producao-sem-mocks.md` começando pela **etapa 1 (migration inicial)**. Pare ao final de cada etapa numerada para revisão. Não avance enquanto eu não responder 'ok próxima'. Em cada etapa, liste arquivos criados/alterados e SQL gerado. Não toque em telas antes da etapa 6."

Esse fluxo garante que o sistema sai do protótipo e entra em produção sem dados mockados, com persistência real, segurança por tenant e deploy estável.
