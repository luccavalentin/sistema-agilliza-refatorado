# PROMPT — COMO FUNCIONA O CRM DE CLIENTES

Use este prompt para explicar (ou recriar) o funcionamento do módulo **CRM de Clientes** dentro do ecossistema. O CRM é compartilhado entre os perfis **Correspondente**, **Corretor/Parceiro** e **Cliente**, variando apenas o escopo dos dados visíveis (`scope: "correspondente" | "corretor" | "cliente"`). Os mesmos componentes são renderizados para todos os perfis — nunca duplicar telas.

---

## 1. Visão geral

O CRM de Clientes é o núcleo operacional do sistema. Concentra cadastro, consulta, documentação, simulações, propostas, relacionamento e relatórios de todos os clientes (PF e PJ) da base. Está conectado à **API HomeFin** para sincronização de oportunidades, propostas, documentos e follow-ups.

Princípios:
- **Base única**: todos os perfis enxergam a mesma fonte de dados, com filtros automáticos por escopo.
- **Sem duplicação de componentes**: a mesma tela serve os três perfis, apenas com `scope` diferente.
- **Servidor é a fonte da verdade**: toda integração HomeFin acontece em server functions; o frontend nunca chama a API externa diretamente.
- **Segurança por RLS + escopo**: Cliente só vê seus próprios dados, Corretor sua carteira, Correspondente todo o ecossistema.

---

## 2. Estrutura de navegação do CRM

Submenus disponíveis em `/correspondente/crm`, `/corretor/crm` e `/cliente` (no perfil Cliente alguns itens são ocultos):

| Submenu          | Rota                          | Função |
|------------------|-------------------------------|--------|
| Dashboard        | `/{perfil}/crm`               | KPIs, funil, alertas e movimentações recentes |
| Cadastro         | `/{perfil}/crm/cadastro`      | Wizard de 9 passos para criar/editar cliente |
| Consultas        | `/{perfil}/crm/consultas`     | Busca global com filtros e abas |
| Documentos       | (dentro de consultas/cliente) | Upload, aprovação, versionamento, download |
| Relatórios       | `/{perfil}/crm/relatorios`    | Relatórios pré-configurados e builder custom |
| Scan IA          | `/{perfil}/crm/scan-ia`       | Leitura inteligente de documentos (aguardando API) |
| Flash IA         | `/{perfil}/crm/flash-ia`      | Resumo e insights por IA (aguardando API) |

O perfil **Cliente** acessa apenas o que é dele: dashboard pessoal, seus documentos, suas simulações/propostas e linha do tempo. Não vê listas de outros clientes, comissões, corretores ou relatórios gerenciais.

---

## 3. Dashboard

Cartões e blocos principais:
- **KPIs**: clientes ativos, novos no mês, em análise, aprovados, reprovados, ticket médio, taxa de conversão, pendências em aberto.
- **Funil**: Lead → Simulação → Proposta → Aprovação → Contrato.
- **Crescimento mensal**: gráfico de barras/linha (últimos 12 meses).
- **Distribuição por produto**: donut (Financiamento Imobiliário, Home Equity, etc.).
- **Mapa de calor por UF** (apenas Correspondente).
- **Top corretores** (apenas Correspondente).
- **Últimas movimentações**, **aniversariantes**, **clientes inativos**, **documentos pendentes**.
- **Alertas**: SLA vencendo, propostas paradas, documentos rejeitados.

---

## 4. Cadastro (Wizard de 9 passos)

1. Identificação (PF/PJ, nome/razão social, CPF/CNPJ, nascimento)
2. Contato (telefones, e-mail, preferência de canal)
3. Endereço (CEP autopreenchimento, residencial + correspondência)
4. Dados financeiros (estado civil, regime, profissão, ocupação)
5. Renda (composição com cônjuge/sócios, comprovantes)
6. Imóvel pretendido (valor, tipo, localização, finalidade)
7. Vínculos (corretor responsável, imobiliária, vendedor, analista)
8. Documentos (upload categorizado por tipo)
9. Observações e LGPD (`fgAutorizacaoDados`)

Cada passo:
- Validado com **Zod**.
- Salva parcialmente (rascunho) ao avançar.
- Stepper visual no topo com status (concluído / atual / pendente).
- Envia ao final para `crmCreateOportunidade` (HomeFin) via server function.

---

## 5. Consultas

Tela central de busca:
- **Busca global** por nome, CPF/CNPJ, telefone, e-mail (debounce 300ms).
- **Filtros avançados** em chips: status, produto, corretor, imobiliária, analista, cidade, UF, período, origem, possui simulação/proposta/pendência.
- **Abas**: Clientes · Vendedores · Imóveis · Composição de renda · Documentos · Vínculos · Propostas · Simulações.
- **Tabela** com paginação server-side, ordenação, ações inline (visualizar, editar, vínculos, vendedores, imóveis, documentos, criar simulação, anexar, observação, histórico, inativar).
- **Ações em lote**: exportar, atribuir corretor, enviar mensagem, alterar status.

Escopo automático: Correspondente vê toda a base, Corretor apenas sua carteira, Cliente apenas si mesmo.

---

## 6. Central de Documentos

- **Upload**: drag & drop, até 20 MB por arquivo, categoria obrigatória (RG, CPF, comprovante de renda, IR, certidões, matrícula, etc.).
- **Preview inline** (PDF/imagem) + download, substituição, aprovação, rejeição, compartilhamento.
- **Versionamento**: histórico completo com autor, data e motivo.
- **Status** (cores semânticas): 🟡 enviado · 🔵 em análise · 🟢 aprovado · 🔴 rejeitado · ⚫ expirado.
- **Storage**: bucket privado `crm-documentos` no Lovable Cloud, URLs assinadas com expiração de 15 min.
- **RLS** por `cliente_id` e perfil; toda ação é auditada.
- **Integração HomeFin**: upload multipart para `/documento/{id}/upload` e vínculo à simulação/proposta.

---

## 7. Simulações e Propostas

- **Simulação** criada a partir do cliente (valor, prazo, entrada, produto). Resultado armazenado e versionado.
- **Proposta** gerada a partir de uma simulação aprovada, enviada à HomeFin (`/incluir-proposta-integracao`) com confirmação obrigatória do usuário e bloqueio anti-duplicação.
- Status acompanhado em tempo real (polling 30s + webhook → realtime).
- Aba específica em Consultas e bloco no Dashboard do cliente.

---

## 8. Linha do tempo

Histórico vertical do cliente unificando:
- Cadastro e alterações
- Documentos (envio, aprovação, rejeição)
- Simulações e propostas
- Mensagens e observações
- Mudanças de status
- Follow-ups da HomeFin (`tipoFup: 'I' | 'E'`)

Exportável em PDF. Filtro por tipo de evento e período.

---

## 9. Relatórios

- **12 relatórios pré-configurados**: carteira, conversão, pipeline, produtividade por corretor, documentos pendentes, propostas por status, etc.
- **Builder customizado**: arrastar campos, aplicar filtros, agrupar, pré-visualizar.
- **Exportação**: PDF, Excel, CSV.
- **Agendamento**: envio recorrente por e-mail.
- **Favoritos** por usuário.

Cliente não vê relatórios gerenciais — apenas seu próprio extrato.

---

## 10. Integrações

- **HomeFin API** (server-side only, secrets `HOMEFIN_SECRET_ID` / `HOMEFIN_SECRET_KEY`): cadastro, simulações, propostas, documentos, follow-ups.
- **Scan IA / Flash IA**: faixa amarela piscando *"Aguardando integração da API"* enquanto não conectado.
- **Operacional**: simulações e propostas refletem no Painel Operacional.
- **Financeiro**: comissões geradas a partir de contratos aprovados.
- **Portal do Cliente**: leitura sincronizada via mesmas server functions.
- **Backup** e **Notificações** ativos por padrão.

---

## 11. Padrões visuais e técnicos

- **Tokens semânticos** (`bg-card`, `text-graphite`, `border-border`, `bg-brand`, `bg-warning`, `bg-destructive`) — nunca cores hardcoded.
- **shadcn/ui**: Card, Table, Dialog, Tabs, Tooltip, Badge, Sheet, Collapsible.
- **PanelHeader** padronizado no topo de cada tela com `eyebrow`, `title`, `subtitle`.
- **Loading**: skeletons. **Empty/Erro**: estados dedicados.
- **Acessibilidade AA**, navegação por teclado, `aria-current`, `prefers-reduced-motion`.
- **Performance**: paginação server-side, debounce em buscas, TanStack Query com `staleTime` adequado.
- **Auditoria**: toda ação sensível registrada (autor, ação, alvo, timestamp).

---

## 12. Resultado esperado

Um CRM de Clientes único, compartilhado pelos três perfis, conectado à HomeFin, com:
- Dashboard com KPIs, funil e alertas
- Cadastro completo em 9 passos
- Consultas com busca, filtros e abas
- Central de Documentos com upload/aprovação/versionamento
- Simulações e propostas integradas
- Linha do tempo unificada
- Relatórios pré-configurados e customizados
- Scan IA / Flash IA preparados (faixa amarela até a API conectar)

Reaproveitando 100% dos componentes existentes (`PanelHeader`, `Card`, `Table`, `Dialog`, `Tabs`, `Badge`, `Sheet`) e mantendo o design system já definido.
