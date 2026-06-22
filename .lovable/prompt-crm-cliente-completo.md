# PROMPT — CRM DE CLIENTE (COMPLETO)

Construa o módulo **CRM de Cliente** respeitando a base visual já definida do sistema (tokens semânticos de `src/styles.css`, componentes shadcn, sidebar e shell já existentes). O CRM é compartilhado entre os perfis **Correspondente**, **Corretor/Parceiro** e **Cliente** — todos consomem a MESMA base de dados, variando apenas o escopo de visualização (`scope`):

- **Correspondente** → vê todos os clientes do ecossistema.
- **Corretor/Parceiro** → vê apenas sua carteira (clientes vinculados a ele).
- **Cliente** → vê apenas o próprio cadastro, documentos e histórico.

Toda tela deve receber `scope: "correspondente" | "corretor" | "cliente"` e filtrar dados de acordo. Não duplique componentes por perfil — use a mesma tela com condicionais.

---

## 1. ESTRUTURA DE NAVEGAÇÃO

Submenu **CRM de Clientes** (dentro do grupo *CRM e Gestão de Cliente*):

1. **Dashboard** — visão analítica
2. **Cadastro** — novo cliente / edição
3. **Consultas** — listagem + filtros + ações em massa
4. **Documentos** — central de upload, visualização, download
5. **Histórico & Timeline** — eventos do cliente
6. **Relatórios** — exportáveis (PDF/Excel/CSV)

Rotas:
```
/{perfil}/crm                 → Dashboard
/{perfil}/crm/cadastro        → Cadastro/Edição
/{perfil}/crm/consultas       → Consultas
/{perfil}/crm/documentos      → Central de Documentos
/{perfil}/crm/historico       → Timeline
/{perfil}/crm/relatorios      → Relatórios
```

---

## 2. DASHBOARD DO CRM

Cabeçalho (`PanelHeader`): título "CRM de Clientes", subtítulo conforme escopo, filtros globais (período, produto, status, origem, corretor — este último só para correspondente).

**KPIs (cards no topo, 4–6 cards):**
- Clientes ativos (total + variação %)
- Novos no período (com sparkline)
- Em análise / Em documentação / Aprovados / Reprovados
- Ticket médio (R$)
- Taxa de conversão (Simulação → Proposta → Aprovação)
- Pendências críticas (badge vermelho pulsante se > 0)

**Gráficos:**
- Funil de conversão (Lead → Simulação → Proposta → Aprovação → Contratação)
- Evolução mensal de novos clientes (barras)
- Distribuição por produto (donut)
- Mapa de calor por UF/cidade
- Top 10 corretores por volume (apenas correspondente)

**Blocos auxiliares:**
- Últimas movimentações (lista com avatar, nome, evento, hora)
- Aniversariantes do dia/semana
- Clientes sem movimento há > 30 dias (alerta amarelo)
- Pendências de documento por cliente (lista priorizada)

---

## 3. CADASTRO DE CLIENTE

Wizard em **abas verticais** (stepper lateral) com salvar parcial a cada etapa:

### 3.1 Identificação
- Tipo: PF / PJ (toggle)
- Nome completo / Razão social
- CPF / CNPJ (com máscara e validação)
- RG / Inscrição Estadual
- Data de nascimento / Data de fundação
- Estado civil, regime de bens, profissão
- Nacionalidade, naturalidade
- Nome social, gênero

### 3.2 Contato
- Telefones (múltiplos, com tipo: celular/comercial/recado)
- E-mails (múltiplos)
- WhatsApp preferido (toggle por telefone)
- Preferência de contato

### 3.3 Endereço
- CEP com autopreenchimento (ViaCEP)
- Rua, número, complemento, bairro, cidade, UF
- Tipo: residencial / comercial / correspondência
- Múltiplos endereços permitidos

### 3.4 Dados financeiros
- Renda mensal / Faturamento
- Comprovação (CLT, autônomo, empresário, aposentado)
- Outras rendas, despesas fixas
- Score interno (read-only, calculado)
- Restrições (SPC/Serasa — read-only após consulta)

### 3.5 Composição de renda
- Adicionar coparticipantes (cônjuge, sócio, fiador)
- Cada um com mini-cadastro (nome, CPF, renda, parentesco)
- Soma automática da renda total

### 3.6 Imóvel/Operação (se houver simulação vinculada)
- Endereço do imóvel
- Tipo, valor de venda, valor de financiamento
- Vendedor vinculado
- Documentação do imóvel

### 3.7 Vínculos
- Corretor responsável (autocomplete)
- Imobiliária / Parceiro
- Analista backoffice
- Comercial responsável
- Origem do lead (orgânico, indicação, campanha X)

### 3.8 Documentos (vide seção 4)

### 3.9 Observações & Tags
- Campo livre rich-text
- Tags coloridas (criar/selecionar)
- Marcadores: VIP, Prioridade, Atenção

**Botões fixos no rodapé:** Salvar rascunho • Salvar e continuar • Salvar e fechar • Cancelar
**Validação:** Zod com mensagens inline. Bloqueia avanço se etapa obrigatória inválida.

---

## 4. CENTRAL DE DOCUMENTOS

**Funcionalidades obrigatórias:**

### 4.1 Upload
- Drag & drop + botão "Selecionar arquivo"
- Múltiplos arquivos simultâneos
- Tipos aceitos: PDF, JPG, PNG, DOCX, XLSX (configurável)
- Tamanho máx: 20MB/arquivo (configurável)
- Barra de progresso por arquivo
- Categoria obrigatória ao subir (RG, CPF, Comprovante de Renda, Comprovante de Residência, Holerite, IR, Contrato Social, Matrícula do Imóvel, etc.)
- Validade (data de expiração opcional)
- OCR/Scan IA opcional (botão "Analisar com IA" — faixa amarela pulsante "Aguardando integração da API")

### 4.2 Visualização
- Preview inline para PDF e imagens (modal full-screen com zoom/rotate)
- Ícone por tipo de arquivo
- Metadados: enviado por, data, tamanho, categoria, validade, status

### 4.3 Ações por documento
- **Baixar** (download direto)
- **Visualizar** (preview)
- **Substituir** (upload de nova versão — mantém histórico)
- **Aprovar / Reprovar** (correspondente/corretor) com motivo
- **Solicitar reenvio** (envia notificação ao cliente)
- **Excluir** (soft delete, com confirmação)
- **Compartilhar** (gera link temporário assinado)
- **Histórico de versões** (lista todas as versões anteriores)

### 4.4 Status visuais
- 🟡 Pendente envio
- 🔵 Em análise
- 🟢 Aprovado
- 🔴 Reprovado (com motivo visível)
- ⚫ Expirado
- 🟣 Vencendo em 30 dias (alerta)

### 4.5 Controle de acesso
- Cliente vê apenas documentos marcados como "visíveis ao cliente"
- Corretor vê documentos da sua carteira
- Correspondente vê tudo
- Toggle "Visível ao cliente" em cada documento

### 4.6 Storage
- Usar **Lovable Cloud Storage** (bucket privado `crm-documentos`)
- Path: `crm-documentos/{cliente_id}/{categoria}/{timestamp}-{filename}`
- URLs assinadas com expiração curta (15min) para download
- RLS por `cliente_id` e perfil

---

## 5. CONSULTAS (já existe — manter padrão atual e estender)

- Barra de busca global
- Chips de filtros avançados
- Abas: Clientes / Vendedores / Imóveis / Composição / Documentos / Vínculos / Propostas / Simulações
- Tabela com colunas conforme escopo
- **Ações por linha:** Visualizar, Editar, Vínculos, Vendedores, Imóveis, Documentos, Criar simulação, Anexar documento, Observação, Histórico, Inativar
- **Ações em massa:** exportar selecionados, atribuir corretor, mudar status, enviar mensagem
- Paginação + ordenação por coluna

---

## 6. HISTÓRICO & TIMELINE

Linha do tempo vertical do cliente com eventos:
- Cadastro criado/atualizado
- Documento enviado/aprovado/reprovado
- Simulação criada
- Proposta enviada/aprovada/reprovada
- Mensagem enviada/recebida
- Status alterado
- Observação adicionada
- Vínculo de corretor alterado

Cada evento: ícone, autor, data/hora, descrição, link para detalhe.
Filtros por tipo de evento e período.
Exportável em PDF.

---

## 7. RELATÓRIOS

Tela com cards de relatórios pré-configurados + construtor customizado:

### Relatórios prontos:
1. Clientes por status
2. Clientes por produto
3. Conversão de funil (período)
4. Carteira por corretor (apenas correspondente)
5. Documentos pendentes
6. Documentos vencendo
7. Aniversariantes
8. Clientes sem movimento
9. Origem dos leads
10. Performance por origem
11. Ranking de corretores
12. Auditoria de alterações cadastrais

### Construtor:
- Selecionar campos (drag)
- Filtros (período, status, produto, corretor, UF…)
- Agrupamento e ordenação
- Preview em tabela
- **Exportar:** PDF (com cabeçalho/logo), Excel, CSV
- **Agendar envio:** diário/semanal/mensal por e-mail
- Salvar como relatório favorito

---

## 8. INTEGRAÇÕES COM O ECOSSISTEMA

- **Scan IA / Flash IA** → botões nos documentos e no cadastro (faixa amarela pulsante "Aguardando integração da API")
- **Operacional** → cliente do CRM gera Simulação → Proposta automaticamente
- **Financeiro** → ao aprovar proposta, cria contas a receber/comissão
- **Portal Cliente** → cliente vê seu próprio cadastro/documentos/histórico em modo read-only (exceto upload de docs pendentes)
- **Backup** → CRM entra na rotina de backup automático
- **Notificações** → eventos disparam notificação no sino e push/e-mail/WhatsApp

---

## 9. PADRÕES VISUAIS E TÉCNICOS

- **Tokens semânticos apenas** (`bg-card`, `text-graphite`, `border-border`, `bg-brand`, etc.) — nada de cores hardcoded.
- Componentes: `PanelHeader`, `Card`, `Table` shadcn, `Dialog`, `Tabs`, `Tooltip`, `Badge`, `Sheet` (drawer para detalhes).
- Estados: loading skeleton, vazio (empty state com ilustração + CTA), erro (com retry).
- Acessibilidade: AA, navegação por teclado, `aria-label` em ícones-only, `role` correto.
- Responsividade: tabelas com scroll horizontal em mobile, formulários em coluna única.
- Performance: paginação server-side, lazy load de previews, debounce na busca (300ms).
- Auditoria: toda alteração registra `created_by`, `updated_by`, `updated_at` + entrada na timeline.

---

## 10. RESULTADO ESPERADO

Módulo CRM de Cliente 100% funcional nos três perfis com:
- Dashboard analítico com KPIs, funil e gráficos
- Cadastro em wizard com 9 etapas e salvar parcial
- Consultas com filtros avançados e ações em massa
- Central de Documentos com upload/download/visualização/versionamento/aprovação
- Timeline de histórico filtrável e exportável
- Relatórios prontos + construtor + agendamento
- Integração visual com Scan IA / Flash IA (faixa amarela pulsante aguardando API)
- Controle de escopo por perfil sem duplicação de componentes
