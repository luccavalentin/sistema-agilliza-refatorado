# Plano de Refatoração e Otimização — Plataforma Agilliza

Plano executado em **6 etapas independentes e incrementais**. Cada etapa entrega valor isolado, pode ser validada e revertida sem travar as seguintes.

---

## Etapa 1 — Fundação Visual (Design System)

**Objetivo:** consolidar tokens, tipografia e identidade Agilliza em um único lugar.

- Revisar `src/styles.css` e padronizar tokens semânticos em `oklch`:
  - `--brand` (azul Agilliza), `--brand-foreground`, `--direction` (vermelho/coral), `--graphite`, `--surface`, `--surface-elevated`, `--border-strong`.
  - Tokens de elevação: `--shadow-sm/md/lg/elegant`, gradiente `--gradient-brand`.
- Definir par tipográfico institucional (ex.: **Urbanist** display + **Inter** corpo) via `<link>` no `__root.tsx`.
- Padronizar raios (`--radius-sm/md/lg/xl`) e espaçamentos.
- Substituir cores hardcoded (`text-white`, `bg-black`, hex inline) por tokens nos componentes existentes.
- Garantir contraste AA em ambos os modos (claro/escuro), com tokens de `muted-foreground` ajustados.

**Entrega:** paleta, tipografia e tokens unificados, sem alteração funcional.

---

## Etapa 2 — Shell, Navegação e Layout Responsivo

**Objetivo:** transformar `portal-shell.tsx` em uma casca moderna e mobile-first.

- Sidebar colapsável (shadcn `Sidebar`) com:
  - Estados expandido / ícone-only / off-canvas (mobile via `Sheet`).
  - Persistência do estado em `localStorage`.
  - Agrupamento por módulo (CRM, Operacional, Financeiro, Gestão, Backup).
- Topbar refinada: busca global (`Command`), notificações, menu de conta, breadcrumb dinâmico.
- Grid `grid-cols-[minmax(0,1fr)_auto]` em toda linha que mistura texto + widgets (regra anti-quebra mobile).
- Container fluido (`max-w-screen-2xl`) + padding responsivo (`px-4 sm:px-6 lg:px-8`).
- `<main>` único por rota, com `h-dvh` em vez de `h-screen`.
- Skip-link "Pular para o conteúdo" para acessibilidade por teclado.

**Entrega:** navegação consistente em mobile, tablet e desktop nos 3 perfis (correspondente, corretor, cliente).

---

## Etapa 3 — Refatoração de Componentes Pesados

**Objetivo:** quebrar arquivos grandes em pedaços reutilizáveis e tipados.

Alvos prioritários (>400 linhas ou com lógica + UI misturadas):
- `crm-cadastro.tsx`, `crm-consultas.tsx`, `crm-dashboard.tsx`
- `painel-operacional.tsx`, `propostas-kanban.tsx`, `simulacao-wizard.tsx`
- `painel-financeiro.tsx`, `fluxo-caixa.tsx`, `lancamentos-lista.tsx`
- Dashboards (`correspondente-dashboard.tsx`, `corretor-dashboard.tsx`)

Padrão a aplicar em cada um:
1. Separar **lógica** em hooks (`use-<feature>.ts`) e **dados** em repositórios (`src/data/*`).
2. Separar **apresentação** em subcomponentes puros em `components/<feature>/parts/`.
3. Eliminar `any`, propagar tipos a partir de `src/lib/*/types.ts`.
4. Memoização (`useMemo`/`useCallback`) apenas onde há custo real medido.
5. Lazy loading por rota com `React.lazy` + `Suspense` (reduz bundle inicial).

**Entrega:** componentes <250 linhas, hooks reutilizáveis, bundle inicial menor.

---

## Etapa 4 — UI/UX Moderna por Módulo

**Objetivo:** aplicar a fundação visual nas telas operacionais.

Por módulo:
- **CRM** — cards de cliente com avatar, status colorido (token), tabela com `sticky` header, filtros em `Popover`, formulário em `Sheet` lateral.
- **Operacional** — Kanban com colunas roláveis, cards densos com indicador SLA (cor + ícone, nunca só cor — WCAG), modal de detalhe em `Dialog` com tabs.
- **Financeiro** — KPIs no topo (`bento-grid`), gráficos `recharts` com tokens, tabelas com paginação e exportação.
- **Cliente** — timeline vertical do processo, próximos passos destacados, documentos com drag-and-drop.

Padrões transversais:
- Estados vazios ilustrados + CTA claro.
- Skeletons (`Skeleton`) em todo carregamento (nunca spinner solto).
- Toasts (`sonner`) para feedback de ação.
- Animações sutis com Motion (entrada de cards, transição de tabs) — respeitar `prefers-reduced-motion`.

**Entrega:** todas as telas com o mesmo padrão visual moderno.

---

## Etapa 5 — Acessibilidade (WCAG 2.1 AA)

**Objetivo:** garantir uso por teclado, leitores de tela e contraste adequado.

Checklist auditado em todas as rotas:
- `aria-label` em todo botão ícone-only.
- `<label>` associado a todo `input` (htmlFor + id).
- Cabeçalhos hierárquicos sem pulo (`h1` → `h2` → `h3`).
- Foco visível (`focus-visible:ring-2 ring-brand/40`) em todos interativos.
- Tap targets ≥ 44×44px em mobile.
- `role` + suporte a teclado em qualquer `div` clicável (preferir converter em `<button>`).
- `aria-live="polite"` em áreas de notificação e validação.
- `lang="pt-BR"` no `<html>`.
- Substituir widgets custom por primitivos shadcn/Radix (ARIA correto out-of-the-box).
- Cor nunca como único canal: status sempre acompanha ícone/texto.

**Entrega:** relatório de auditoria zerado em itens críticos.

---

## Etapa 6 — Performance, Qualidade de Código e Observabilidade

**Objetivo:** sistema rápido, previsível e fácil de manter.

- **Bundle:** análise com `vite-bundle-visualizer`, code-splitting por rota, tree-shake de `lucide-react` (imports nomeados).
- **Imagens:** logos Agilliza otimizados (PNG → WebP via Lovable Assets), `loading="lazy"`, `aspect-*` para evitar CLS.
- **Dados:** consolidar acesso em `src/data/repositories.ts`, padronizar TanStack Query (`queryOptions` + `ensureQueryData` em loaders).
- **Server Functions:** validar inputs com Zod, mover lógica de negócio do cliente para `*.functions.ts` quando aplicável.
- **Qualidade:**
  - ESLint + Prettier rodando limpo (zero warnings).
  - Remover `console.log`, código morto, imports não usados.
  - Tipagem estrita (eliminar `any` residual).
- **SEO/meta:** `head()` específico por rota (title <60 chars, description <160).
- **Erros:** `errorComponent` + `notFoundComponent` em toda rota com loader.

**Entrega:** Lighthouse ≥ 90 em Performance / Acessibilidade / Best Practices / SEO.

---

## Ordem de Execução e Dependências

```text
Etapa 1 (Fundação) ──┬─> Etapa 2 (Shell)      ──┬─> Etapa 4 (UI por módulo)
                     │                          │
                     └─> Etapa 3 (Refatoração) ─┘
                                                │
                                                ├─> Etapa 5 (Acessibilidade)
                                                │
                                                └─> Etapa 6 (Performance)
```

- Etapas 1 e 2 são pré-requisito de tudo.
- Etapas 3 e 4 podem rodar em paralelo por módulo.
- Etapas 5 e 6 são transversais e fecham o ciclo.

---

## Critérios de Aceite Globais

- Nenhuma cor hardcoded fora de `styles.css`.
- Nenhum componente >300 linhas.
- 100% das rotas responsivas (375px → 1920px) sem quebra de layout.
- Auditoria de acessibilidade sem itens críticos.
- Lighthouse ≥ 90 nas 4 categorias.
- Logos originais Agilliza presentes em login, shell e telas institucionais.

---

## Como começar

Recomendo iniciar pela **Etapa 1 (Fundação Visual)** — ela destrava todas as demais sem risco funcional. Quer que eu já comece por ela, ou prefere ajustar o escopo de alguma etapa antes?
