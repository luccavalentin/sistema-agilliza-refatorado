# Prompt — Portal do Cliente (Agilliza)

Construa o **Portal do Cliente** do ecossistema Agilliza: uma área 100% dedicada ao tomador de crédito acompanhar sua própria proposta, enviar documentos, responder pendências e se comunicar com o corretor/correspondente responsável. O portal é **somente leitura na maior parte do fluxo** — o cliente nunca edita dados cadastrais, simulações, propostas, financeiro ou comissões. Ele apenas **acompanha**, **envia documentos** e **conversa**.

Sem qualquer integração com HomeFin/SaaS externo: todos os dados vêm dos módulos internos (CRM, Operacional, Financeiro do correspondente/corretor que atende o cliente).

---

## 1. Escopo por perfil

- **Cliente (perfil único)** — vê apenas a sua própria proposta (uma proposta ativa por vez; histórico de propostas anteriores em aba "Histórico").
- **Correspondente / Corretor** — não usam o Portal do Cliente; eles **disparam atualizações** (status, mensagens, solicitação de documentos) que aparecem em tempo real no portal.
- **Cliente nunca vê:** comissões, custos internos, margem, dados de outros clientes, dashboards do correspondente/corretor, configurações administrativas, relatórios gerenciais, valores de remuneração do corretor.

---

## 2. Estrutura de navegação (`PortalShell kind="cliente"`)

```
/cliente
 ├── /                       → Painel de Monitoramento (visão geral)
 ├── /proposta               → Acompanhar Minha Proposta (linha do tempo completa)
 ├── /documentos             → Meus Documentos (upload + status)
 ├── /mensagens              → Conversa com o Corretor
 ├── /historico              → Histórico de Propostas (encerradas/arquivadas)
 └── /perfil                 → Meus Dados (somente leitura + solicitar correção)
```

Grupo único de navegação na sidebar: **"Minha Proposta"** com os 6 itens acima. Header com `PanelHeader eyebrow="Acompanhamento · Cliente"` e badge `ShieldCheck` "Escopo · sua proposta".

---

## 3. Telas e componentes

### 3.1 `/cliente` — Painel de Monitoramento
- **Status geral** (Em análise / Pendência / Aprovada / Contrato / Finalizada) em destaque com cor semântica.
- **Cards de KPI** (apenas leitura): Valor financiado, Valor do imóvel, Parcela estimada, Prazo, Banco em análise, Status atual, Próxima ação, Documentos pendentes.
- **Linha do tempo resumida** (9 etapas: Cadastro iniciado → Documentos enviados → Simulação realizada → Proposta enviada → Em análise → Pendência → Aprovada → Contrato → Finalizada).
- **Próximos passos** (lista de ações que o cliente deve tomar).
- **Atualizações recentes** (últimas 4 mensagens/eventos do corretor).
- **Botão "Falar com meu corretor"** (abre `/cliente/mensagens`).

Componente referência: `src/components/dashboards/cliente-dashboard.tsx`.

### 3.2 `/cliente/proposta` — Acompanhamento Detalhado
- Linha do tempo completa com data/hora de cada etapa.
- Detalhes da proposta: produto, banco, valores, prazo, taxa, imóvel, responsável (nome + foto do corretor + tempo médio de resposta).
- Observações do banco (avaliação agendada, pendências bancárias).
- **Sem botões de edição.** Apenas "Solicitar correção" → abre modal que envia mensagem ao corretor.

### 3.3 `/cliente/documentos` — Meus Documentos
- Lista de documentos solicitados com status: `Aprovado`, `Em análise`, `Pendente`, `Reprovado`.
- Ações por documento:
  - **Pendente / Reprovado** → botão **"Enviar"** (drag&drop, até 10 MB, formatos PDF/JPG/PNG).
  - **Em análise / Aprovado** → apenas visualizar (preview/download).
- Indicador de validade (ex.: comprovante de residência expira em 60 dias).
- Banner com motivo de reprovação quando aplicável.
- Confirmação visual imediata após upload (3s animado) e atualização do status para "Em análise".

### 3.4 `/cliente/mensagens` — Conversa com o Corretor
- Chat 1:1 entre cliente e corretor responsável (sem grupo, sem outros usuários).
- Mensagens com timestamp, indicador de lida, anexos.
- Resposta automática do corretor com SLA ("responde em até 4h úteis").
- Cliente pode anexar arquivos (mesmas regras de `/documentos`).
- Notificação no header quando há mensagem nova.

### 3.5 `/cliente/historico` — Propostas Anteriores
- Lista de propostas encerradas (Finalizadas, Canceladas, Reprovadas).
- Cada item mostra: produto, banco, valor, data de encerramento, status final.
- Clique → modal somente leitura com timeline e detalhes congelados no momento do encerramento.

### 3.6 `/cliente/perfil` — Meus Dados
- Exibe nome, CPF (mascarado), e-mail, telefone, endereço — **somente leitura**.
- Botão **"Solicitar correção"** abre modal com campo livre que dispara mensagem para o corretor (não altera dados diretamente).
- Preferências: notificações por e-mail, WhatsApp, push (toggle local em `localStorage`).
- Botão "Sair".

---

## 4. Conexões com o ecossistema

O Portal do Cliente é um **consumidor** dos módulos internos. Nenhum dado é editado por ele — todas as mutações vêm dos outros módulos.

### 4.1 CRM (Cadastro de Clientes)
- **Origem dos dados:** nome, CPF, e-mail, telefone, endereço, foto, `idCliente`.
- **Fluxo:** quando o correspondente/corretor cadastra ou edita o cliente no CRM, os dados aparecem em `/cliente/perfil` automaticamente.
- **Solicitação de correção:** cliente abre chamado → cria registro em `crm.solicitacoesCorrecao` que aparece na fila de demandas do corretor.

### 4.2 Operacional (Simulações, Propostas, Demandas, Tarefas)
- **Proposta ativa:** lida de `operacional.propostas` filtrada por `idCliente`, status ≠ encerrado.
- **Linha do tempo:** derivada de `operacional.propostas.historico` (eventos de mudança de status).
- **Documentos:** lista vem de `operacional.propostas.documentos` (gerada quando o banco/corretor solicita).
- **Pendências:** cada item em status "Pendente" no operacional gera entrada em `/cliente/documentos` e card em "Próximos passos".
- **Upload do cliente:** sobe arquivo para storage, atualiza `documento.status = "Em análise"`, dispara notificação para o corretor + entrada em `operacional.demandas` (SLA: 4h úteis para análise).
- **Histórico:** propostas com status "Finalizada", "Cancelada", "Reprovada" alimentam `/cliente/historico`.

### 4.3 Financeiro
- **Cliente NÃO acessa** Contas a Pagar, Contas a Receber, Comissões, Fluxo, Conciliação, Categorias, Relatórios.
- Único dado financeiro visível: **parcela estimada** e **valor financiado** da própria proposta (vindos do operacional, não do módulo financeiro).
- Comissões do corretor são **invisíveis** ao cliente em qualquer tela.

### 4.4 Gestão Administrativa / Configurações / Backup
- **Sem acesso.** Rotas `/cliente/configuracoes`, `/cliente/gestao`, `/cliente/backup` não existem.

### 4.5 Notificações
- Cliente recebe notificação (header bell + e-mail/WhatsApp conforme preferência) quando:
  - Status da proposta muda
  - Documento é aprovado/reprovado
  - Corretor envia mensagem
  - Nova pendência é aberta
  - Contrato disponível para assinatura
- Notificações ficam em `notifications.cliente.<idCliente>`.

### 4.6 Painel do Corretor / Correspondente (efeito espelho)
- Toda ação do cliente (upload, mensagem, solicitação de correção) **aparece em tempo real**:
  - Nas **Demandas/SLA** do corretor responsável.
  - No **chat operacional** (popout-chat) do corretor.
  - Como evento na **timeline da proposta** no Kanban operacional.
- O corretor responde → notificação volta ao cliente. Ciclo fechado.

---

## 5. Regras de negócio

1. **Uma proposta ativa por vez.** Se o cliente tem múltiplas propostas em andamento, exibir seletor no topo do `/cliente` para alternar (raro, mas previsto).
2. **Sem edição direta.** Qualquer pedido de alteração de dados (cadastrais, proposta, documentos já aprovados) passa por mensagem ao corretor.
3. **Upload:** máximo 10 MB, formatos `.pdf .jpg .jpeg .png`. Arquivos maiores → erro claro com sugestão de compactação.
4. **Documento reprovado** mantém histórico do envio anterior + motivo da reprovação; novo upload cria nova versão.
5. **SLA visível:** cliente vê tempo médio de resposta do corretor e prazo estimado da próxima etapa.
6. **Privacidade:** CPF, RG e dados sensíveis aparecem mascarados por padrão (toggle "mostrar"); downloads de documentos pessoais exigem reautenticação por senha.
7. **Sessão:** logout automático após 30 min de inatividade.
8. **Acessibilidade:** todos os botões com `aria-label`, contraste AA, navegação por teclado, leitor de tela testado.

---

## 6. Estrutura técnica

- Rota base: `src/routes/cliente.tsx` (layout) + `src/routes/cliente.*.tsx` (leafs).
- Layout via `PortalShell kind="cliente" groups={...}`.
- Componentes em `src/components/cliente/`:
  - `cliente-acompanhamento.tsx` (existe — reaproveitar para `/proposta`)
  - `cliente-documentos.tsx` (novo)
  - `cliente-mensagens.tsx` (novo)
  - `cliente-historico.tsx` (novo)
  - `cliente-perfil.tsx` (novo)
- Dashboard: `src/components/dashboards/cliente-dashboard.tsx` (existe).
- Dados: hooks em `src/data/hooks.ts` filtrados por `idCliente` da sessão (`useClienteProposta`, `useClienteDocumentos`, `useClienteMensagens`, `useClienteHistorico`).
- Mock data: `src/lib/operacional/mock-data.ts` (já existe) — adicionar mocks de mensagens e histórico do cliente.
- Persistência: `localStorage` para preferências; uploads e mensagens via store interno (mesma camada do operacional).

---

## 7. Critérios de aceitação

- [ ] Cliente loga e vê **apenas** sua proposta ativa.
- [ ] Painel mostra status geral, KPIs, timeline resumida, próximos passos, atualizações.
- [ ] `/proposta` exibe timeline completa com 9 etapas e detalhes da proposta — sem botões de edição.
- [ ] `/documentos` permite upload em itens pendentes/reprovados e mostra status colorido.
- [ ] Upload atualiza status para "Em análise" e dispara demanda no painel do corretor.
- [ ] `/mensagens` é chat 1:1 funcional com anexos e indicador de lida.
- [ ] `/historico` lista propostas encerradas em modo somente leitura.
- [ ] `/perfil` mostra dados mascarados + botão "Solicitar correção" que envia mensagem ao corretor.
- [ ] Cliente **não consegue** acessar rotas de financeiro, comissões, configurações, backup, gestão (404 ou redirect para `/cliente`).
- [ ] Notificações em tempo real para mudanças de status, mensagens e pendências.
- [ ] Mutações do corretor (status, documento aprovado, mensagem) refletem no portal sem reload.
- [ ] CPF/RG mascarados por padrão; download exige reautenticação.
- [ ] Logout automático após 30 min; sessão persiste reload dentro do prazo.
- [ ] Acessibilidade AA; navegação completa por teclado.

---

## 8. Resumo da interligação

```
┌─────────────┐  cadastra/edita   ┌─────────────┐
│     CRM     │ ─────────────────▶│   Cliente   │
└─────────────┘                   │  (perfil)   │
                                  └─────┬───────┘
┌──────────────┐  cria proposta         │ vê
│  Operacional │ ───────────────────────▶
│ (Kanban/SLA) │ ◀── upload/mensagem ───┤
└──────┬───────┘                        │
       │ dispara comissão               │
       ▼                                │
┌──────────────┐                        │
│  Financeiro  │   (invisível p/ cliente)
└──────────────┘                        │
                                        │
┌──────────────┐  notifica              │
│ Notificações │ ◀──────────────────────┘
└──────────────┘
```

O Portal do Cliente é a **camada de transparência** do ecossistema: tudo que o corretor/correspondente faz internamente se traduz, filtrado e simplificado, em uma experiência segura e clara para o tomador do crédito.
