# PROMPT — MENU E NAVEGAÇÃO DO PERFIL CLIENTE

Copie e cole no Lovable a partir de **INÍCIO DO PROMPT**.

---

## INÍCIO DO PROMPT

Implemente o menu lateral e a navegação completa do **Perfil Cliente**, respeitando a base visual já definida do sistema (tokens semânticos, shadcn `Sidebar`, padrões de cor, tipografia, ícones e animações descritos em `prompt-design-menu.md`). Não duplique componentes — reutilize o mesmo `AppSidebar` usado pelos perfis Correspondente e Corretor, alternando apenas o conjunto de itens, o badge de perfil e o escopo de dados.

---

### 1. Contexto e princípios

- O Cliente é o **usuário final** do ecossistema (tomador do crédito imobiliário).
- Ele enxerga **apenas os próprios dados**: suas simulações, propostas, documentos, mensagens, pendências e status.
- Nunca enxerga dados de outros clientes, corretores ou do correspondente.
- O menu deve ser **simples, direto, com poucas opções**, focado em acompanhamento e ação (enviar documento, responder pendência, assinar contrato).
- Linguagem clara, sem jargão técnico bancário. Ex.: usar "Meu crédito" em vez de "Operação", "Meus documentos" em vez de "Central documental".
- Mobile-first: a maioria dos clientes acessa pelo celular. O menu colapsa em `Sheet` (offcanvas) no mobile e em mini-rail no tablet.

---

### 2. Estrutura do menu (itens e rotas)

Renderizar dentro do mesmo `AppSidebar`, na variante `profile="cliente"`. Ordem obrigatória, de cima para baixo:

**Grupo: PRINCIPAL**
1. **Início** — `/cliente` — ícone `Home`
   - Dashboard pessoal com status do crédito, próximos passos e alertas.
2. **Meu crédito** — `/cliente/credito` — ícone `Wallet`
   - Detalhes da operação ativa: valor, prazo, taxa, parcela estimada, banco, etapa atual.
3. **Simulações** — `/cliente/simulacoes` — ícone `Calculator`
   - Histórico de simulações feitas para o cliente, com botão "Nova simulação" (se permitido).
4. **Propostas** — `/cliente/propostas` — ícone `FileSignature`
   - Lista de propostas enviadas aos bancos, status (em análise, aprovada, reprovada, condicionada), condições e ações.

**Grupo: DOCUMENTAÇÃO**
5. **Meus documentos** — `/cliente/documentos` — ícone `FolderOpen`
   - Submenu:
     - **Enviar documento** — `/cliente/documentos/enviar`
     - **Pendentes** — `/cliente/documentos/pendentes` (badge com contagem `bg-warning/15 text-warning`)
     - **Aprovados** — `/cliente/documentos/aprovados`
     - **Histórico** — `/cliente/documentos/historico`
6. **Assinaturas** — `/cliente/assinaturas` — ícone `PenSquare`
   - Contratos e termos pendentes de assinatura eletrônica (badge `animate-pulse` quando houver pendência crítica).

**Grupo: ACOMPANHAMENTO**
7. **Linha do tempo** — `/cliente/timeline` — ícone `Activity`
   - Eventos do processo em ordem cronológica (cadastro → simulação → proposta → análise → aprovação → assinatura → liberação).
8. **Mensagens** — `/cliente/mensagens` — ícone `MessageCircle`
   - Conversa com o corretor responsável e notificações do correspondente (badge com contagem de não lidas).
9. **Notificações** — `/cliente/notificacoes` — ícone `Bell`
   - Histórico de avisos (documento aprovado, proposta enviada, pendência aberta, etc.).

**Grupo: CONTA**
10. **Meu perfil** — `/cliente/perfil` — ícone `User`
    - Dados pessoais, contato, endereço, composição de renda, dependentes. Edição com confirmação.
11. **Segurança** — `/cliente/seguranca` — ícone `Shield`
    - Troca de senha, 2FA, dispositivos conectados, LGPD (consentimentos, exportar meus dados, excluir conta).
12. **Ajuda** — `/cliente/ajuda` — ícone `HelpCircle`
    - FAQ, fale com seu corretor, abrir chamado.

**Rodapé do sidebar (`SidebarFooter`)**
- Avatar + nome do cliente + etapa atual em mini-badge (ex.: "Em análise").
- Botão colapsar/expandir.
- Link **Sair** com ícone `LogOut`.

---

### 3. Itens que o Cliente NÃO vê

Garantir que nenhum item destes apareça no menu do Cliente (eles existem nos perfis Correspondente/Corretor):

- CRM (visão de carteira de clientes), Relatórios gerenciais, Comissões, Equipe, Configurações do correspondente, Integrações, Scan IA, Flash IA, Logs/Auditoria, Gestão de usuários, Funil global, Ranking de corretores, Financeiro da operação interna.

A separação é feita por **gate de rota** no layout `_authenticated/cliente.tsx` (verificação de role via `has_role(auth.uid(), 'cliente')`) e por **filtro de itens** no componente `AppSidebar` baseado em `profile`.

---

### 4. Comportamento e estados

- **Item ativo:** barra vertical `before:bg-sidebar-primary` (3px), `bg-sidebar-accent`, ícone em `text-sidebar-primary`, label `font-semibold`. Usar `aria-current="page"`.
- **Hover:** `bg-sidebar-accent/60`, `transition-colors duration-150`.
- **Submenu:** `Collapsible` shadcn com `ChevronRight` rotacionando `data-[state=open]:rotate-90`; abre automaticamente se a rota ativa estiver dentro dele (`defaultOpen` derivado de `useLocation`).
- **Badges:**
  - Pendências de documento: `bg-warning/15 text-warning`.
  - Mensagens não lidas: `bg-sidebar-primary/15 text-sidebar-primary`.
  - Assinatura crítica vencendo: `bg-destructive/15 text-destructive animate-pulse`.
- **Mini-rail (tablet):** mostra apenas ícones, com `Tooltip` no hover exibindo o label.
- **Mobile:** `Sheet` lateral, abre pelo botão `Menu` no topo. Fechar ao navegar.
- **Skeleton:** enquanto carrega permissões, mostrar `bg-sidebar-accent/40` nos itens.

---

### 5. Header do sidebar (`SidebarHeader`)

- Logo do correspondente (white-label — vem da configuração do tenant).
- Abaixo da logo: badge de perfil `Cliente` com `bg-success/15 text-success rounded-full px-2 py-0.5 text-[11px]`.
- Nome do correspondente em `text-xs text-sidebar-foreground/70` (deixa claro com quem o cliente está operando).

---

### 6. Dashboard `/cliente` (Início)

Tela inicial após login, conteúdo do menu **Início**:

- **Card hero:** "Olá, {primeiroNome}" + etapa atual da operação com barra de progresso (Cadastro → Simulação → Proposta → Análise → Aprovação → Assinatura → Liberação).
- **Próximos passos:** lista com até 3 ações pendentes do cliente (ex.: "Envie seu comprovante de renda", "Assine o contrato", "Confirme seus dados bancários"). Cada item tem CTA direto para a tela correspondente.
- **Cards de resumo (4):** Valor solicitado, Parcela estimada, Prazo, Banco/Produto.
- **Alertas:** banner amarelo `animate-pulse` se houver documento vencido ou assinatura pendente >48h.
- **Atalhos rápidos:** botões grandes (Enviar documento, Falar com meu corretor, Ver propostas).
- **Última atualização:** "Atualizado há X min" no canto.

---

### 7. Segurança e escopo de dados

- Todas as rotas `/cliente/*` ficam sob `src/routes/_authenticated/cliente/*`.
- O layout gate valida a role `cliente` e redireciona para `/auth` ou `/sem-permissao` caso contrário.
- Server functions usadas pelo Cliente devem filtrar **sempre** por `auth.uid()` e nunca aceitar `cliente_id` arbitrário vindo do frontend.
- RLS nas tabelas: o Cliente só seleciona linhas onde `cliente_id = auth.uid()` (ou via tabela de vínculo equivalente).
- Documentos: download via signed URL (15 min de validade), bucket privado.
- Nunca expor IDs internos do correspondente/corretor além do necessário (nome do corretor responsável é OK; estrutura interna não).

---

### 8. Integração com HomeFin (somente leitura para o Cliente)

- O Cliente **não dispara** chamadas diretas à HomeFin. Toda leitura passa por server functions já existentes (`crmGetOportunidade`, `getProposta`, `getDocumentos`) com filtro pelo CPF/ID do próprio cliente.
- Atualizações de status (proposta aprovada, documento validado) chegam via polling leve (TanStack Query `staleTime` 30s na tela ativa) ou webhook → realtime quando disponível.
- Banners "Aguardando integração da API" (amarelo piscante) permanecem em Scan IA / Flash IA — mas esses módulos **não aparecem** no menu do Cliente.

---

### 9. Acessibilidade e responsividade

- Contraste AA em todos os estados.
- Navegação por teclado: `Tab`, `Enter`, `Esc` (fecha sheet/submenu), setas dentro do menu.
- `aria-label` no `nav`: "Menu do cliente".
- `aria-expanded` nos submenus, `aria-current="page"` no item ativo.
- Respeita `prefers-reduced-motion` (desliga `animate-pulse` e transforms).
- Touch targets ≥ 44px no mobile.

---

### 10. Resultado esperado

Entregar:
- `src/routes/_authenticated/cliente/` com todas as rotas listadas (stubs com `PanelHeader` quando a tela ainda não existir).
- `AppSidebar` ajustado para aceitar `profile="cliente"` e renderizar exatamente o conjunto de itens acima, na ordem definida, com os badges e estados especificados.
- Gate de role no layout cliente.
- Dashboard `/cliente` funcional consumindo as server functions já criadas, com escopo restrito ao próprio usuário.
- Zero vazamento de itens/rotas dos outros perfis no menu do Cliente.
- Build, lint e typecheck passando.

## FIM DO PROMPT
