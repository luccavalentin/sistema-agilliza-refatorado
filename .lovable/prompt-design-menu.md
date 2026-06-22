# PROMPT — DESIGN, EFEITOS E CORES DO MENU (SIDEBAR)

Construa a navegação lateral (sidebar) dos três portais — Correspondente, Corretor e Cliente — seguindo rigorosamente o sistema visual abaixo. Não use cores hardcoded (ex.: `bg-white`, `text-black`, `bg-[#xxxxxx]`). Use **somente tokens semânticos** definidos em `src/styles.css` (sidebar, primary, accent, muted, foreground, border, ring etc.).

---

## 1) Estrutura visual

- Componente base: shadcn **Sidebar** (`@/components/ui/sidebar`) com `collapsible="icon"`.
- Largura expandida: `w-64` (16rem). Largura colapsada: `w-14` (mini-rail só com ícones).
- Cabeçalho da sidebar (`SidebarHeader`):
  - Logo + nome do produto à esquerda.
  - Badge discreto do perfil ativo (Correspondente / Corretor / Cliente) com `bg-accent/40 text-accent-foreground`.
- Corpo (`SidebarContent`): grupos (`SidebarGroup`) com `SidebarGroupLabel` em **uppercase**, `text-xs tracking-wider text-sidebar-foreground/60`.
- Rodapé (`SidebarFooter`): avatar do usuário, nome, e botão de colapsar/expandir. Mantém `SidebarTrigger` sempre visível no header global.

---

## 2) Tokens de cor (semânticos)

Usar exclusivamente os tokens da família **sidebar** já definidos em `src/styles.css`:

- Superfície: `bg-sidebar` / `text-sidebar-foreground`
- Borda: `border-sidebar-border`
- Item ativo: `bg-sidebar-accent text-sidebar-accent-foreground`
- Hover: `hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground`
- Foco (teclado): `focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar`
- Indicador de seleção: barra vertical à esquerda do item ativo `before:bg-sidebar-primary` (3px, altura total do item, `rounded-r`).
- Submenu (filhos): fundo levemente recuado `bg-sidebar/60`, texto `text-sidebar-foreground/80`.
- Separadores entre grupos: `border-t border-sidebar-border/60`.

> Regra: nunca usar gradientes roxos/indigo genéricos, nem `text-white`/`bg-black`. Tudo via tokens.

---

## 3) Tipografia

- Família: herdar do projeto (definida em `@theme`).
- `SidebarGroupLabel`: `text-[11px] font-medium uppercase tracking-[0.08em] text-sidebar-foreground/60`.
- `SidebarMenuButton`: `text-sm font-medium`.
- Item ativo: `font-semibold`.
- Submenu: `text-[13px] font-normal`.
- Truncar com `truncate` quando colapsado/responsivo; tooltip exibe o texto completo no estado mini.

---

## 4) Ícones

- Lucide React, tamanho `h-4 w-4` (itens), `h-5 w-5` (cabeçalho).
- Cor herda do texto (`currentColor`). No item ativo, ícone fica `text-sidebar-primary`.
- No estado colapsado (mini-rail), exibir apenas o ícone centralizado + tooltip (`TooltipProvider` shadcn) com o título.

---

## 5) Espaçamento e raio

- Padding do item: `px-3 py-2`.
- Gap interno (ícone ↔ texto): `gap-2.5`.
- Raio: `rounded-md` (itens), `rounded-lg` (cards de header/footer).
- Espaço entre grupos: `mt-4`.
- Submenus recuados: `pl-8` (mantém alinhamento com ícone do pai).

---

## 6) Estados e efeitos

- **Hover:** transição suave `transition-colors duration-150 ease-out`.
- **Active:** fundo `bg-sidebar-accent` + barra `before:` lateral + ícone em `text-sidebar-primary`.
- **Focus-visible:** anel `ring-sidebar-ring` (acessível por teclado).
- **Pressed:** `active:scale-[0.98] transition-transform`.
- **Disabled:** `opacity-50 pointer-events-none`.
- **Loading (skeleton):** `Skeleton` shadcn com `bg-sidebar-accent/40`.
- **Badge de contagem** (ex.: notificações, pendências): `ml-auto rounded-full bg-sidebar-primary/15 text-sidebar-primary text-[11px] px-1.5 py-0.5`.
- **Alerta crítico** (ex.: SLA estourado): badge `bg-destructive/15 text-destructive` com `animate-pulse`.
- **Indicador "Aguardando integração da API"** (Scan IA / Flash IA): faixa amarela piscante `border-amber-400 bg-amber-100 text-amber-900 animate-pulse` (já padronizada no projeto).

---

## 7) Submenus recolhíveis

- Usar `Collapsible` shadcn dentro do `SidebarMenuItem`.
- Chevron à direita: `ChevronRight` rotaciona `data-[state=open]:rotate-90` com `transition-transform duration-200`.
- Submenu abre com `data-[state=open]:animate-accordion-down` e fecha com `data-[state=closed]:animate-accordion-up`.
- O grupo que contém a rota ativa começa **aberto** (`defaultOpen` calculado pela rota atual).

---

## 8) Animações globais

- Transições: `duration-150` (hover/colors), `duration-200` (collapsible/chevron), `duration-300` (expand/collapse da sidebar).
- Easing: `ease-out`.
- Respeitar `prefers-reduced-motion`: desabilitar `animate-pulse` e transformar transições em `duration-0` (já tratado em `src/styles.css`).

---

## 9) Responsividade

- **Desktop (≥1024px):** sidebar fixa, colapsável para mini-rail.
- **Tablet (768–1023px):** colapsada por padrão em mini-rail.
- **Mobile (<768px):** sidebar vira `Sheet` lateral (offcanvas), aberta pelo `SidebarTrigger` no header.
- Em mini-rail, **sempre** mostrar tooltip ao hover do ícone.

---

## 10) Acessibilidade

- `aria-current="page"` no item ativo.
- `aria-expanded` nos triggers de submenu.
- Navegação 100% por teclado (Tab/Shift+Tab, Enter, setas).
- Contraste mínimo AA garantido pelos tokens `sidebar-*`.
- `role="navigation"` no `Sidebar` e `aria-label` por perfil ("Navegação do Correspondente" etc.).

---

## 11) Diferenciação por perfil (sutil)

Mesma identidade visual, com **um** detalhe de cor no header da sidebar:

- **Correspondente:** badge do perfil em `bg-primary/15 text-primary`.
- **Corretor:** badge em `bg-accent/40 text-accent-foreground`.
- **Cliente:** badge em `bg-success/15 text-success` (token `success` já existe).

Nada além disso muda entre perfis — paleta, espaçamentos, tipografia e efeitos são idênticos.

---

## 12) Checklist final

- [ ] Nenhuma cor hardcoded; tudo via tokens `sidebar-*` e semânticos.
- [ ] Item ativo com barra lateral + fundo `sidebar-accent` + ícone `sidebar-primary`.
- [ ] Submenus animados com chevron rotacionando.
- [ ] Mini-rail funcional com tooltips.
- [ ] Sheet no mobile.
- [ ] Badges de contagem e alerta padronizados.
- [ ] Faixa amarela piscando para "Aguardando integração da API" em Scan IA e Flash IA.
- [ ] Acessível (teclado, ARIA, contraste, reduced-motion).
