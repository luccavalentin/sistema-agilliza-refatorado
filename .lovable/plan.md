# Refatoração: Filtros Funcionais em Todas as Telas

## Diagnóstico

O componente `FilterBar` (`src/components/dashboards/primitives.tsx`) atualmente renderiza apenas `<button>` decorativos — sem estado, sem `onChange`, sem opções. Ele é consumido em ~12 telas e por isso **nenhum filtro de dashboard funciona**. As telas de listas (Kanban, Tarefas, Contas a Pagar/Receber, etc.) já têm filtros funcionais com `useState` + busca global; o problema concentra-se nos dashboards e painéis.

## Solução

### Etapa 1 — Refatorar a primitiva `FilterBar` (1 arquivo)

Transformar em componente controlado de verdade:

```text
FilterBar({
  filters: [{ key, label, value, options: string[], onChange }],
  onReset?, extra?
})
```

- Renderizar `<select>` real (estilo shadcn) para cada filtro
- Botão "Limpar" quando algum filtro for diferente do default
- Suportar filtro de período com opções padronizadas (7/30/90 dias, Ano, Personalizado)
- Manter o mesmo visual (FILTROS · PERÍODO · ...) da imagem enviada

### Etapa 2 — Hook utilitário `useDashboardFilters` (1 arquivo novo)

`src/hooks/use-dashboard-filters.ts` — estado + helper de filtragem por período/banco/produto/corretor/status/imobiliária/analista, aplicável aos arrays de `mock-data` (propostas, simulações, lançamentos, leads).

### Etapa 3 — Aplicar em cada dashboard (12 arquivos)

Para cada tela abaixo: instanciar o hook, passar `filters` ao `FilterBar`, e usar os arrays filtrados nos KPIs, gráficos, listas e funis:

1. `correspondente-dashboard.tsx`
2. `corretor-dashboard.tsx`
3. `cliente-dashboard.tsx` (período + status do próprio processo)
4. `crm/crm-dashboard.tsx`
5. `crm/crm-relatorios.tsx`
6. `operacional/painel-operacional.tsx`
7. `operacional/minhas-simulacoes.tsx`
8. `operacional/consultas-operacionais.tsx` (consolidar com filtros locais existentes)
9. `financeiro/painel-financeiro.tsx`
10. `financeiro/comissoes-view.tsx`
11. `financeiro/conciliacao-view.tsx`
12. `financeiro/relatorios-financeiros.tsx`

`relatorios-gerenciais.tsx` já tem filtros próprios funcionais — apenas validar.

### Etapa 4 — Validação

- Rodar Playwright em 3 telas-amostra (Correspondente dashboard, CRM dashboard, Painel Financeiro): mudar Banco → KPIs e gráficos refletem; trocar Período → série temporal muda; "Limpar" → volta ao default.
- Garantir que telas de lista (Kanban, Tarefas, Contas, etc.) continuam funcionando — elas não usam `FilterBar`, só busca local + global; não serão tocadas.

## Fora do escopo

- Telas de listas que já têm filtros funcionais (Kanban, Tarefas, Contas a Pagar/Receber, Comissões-lista, Lançamentos, Recorrências, CRM Consultas) — não mexer.
- Persistir filtros em URL (`validateSearch`) — pode ser etapa futura se você quiser shareable links.
- Backend/Supabase — continua mock, conforme combinado anteriormente.

## Detalhes técnicos

- Filtros como `useState` local em cada dashboard (sem URL por enquanto)
- Filtragem 100% client-side sobre os arrays de `mock-data`
- Tipos compartilhados em `src/hooks/use-dashboard-filters.ts`
- Visual idêntico ao da imagem de referência (FILTROS · labels uppercase · selects bordas suaves)

Posso prosseguir?