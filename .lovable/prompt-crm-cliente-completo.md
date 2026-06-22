# PROMPT — CRM DE CLIENTE (COMPLETO) + INTEGRAÇÃO HOMEFIN API

Construa o módulo **CRM de Cliente** respeitando a base visual já definida do sistema (tokens semânticos de `src/styles.css`, componentes shadcn, sidebar e shell já existentes) **e integrado de forma segura à API HomeFin** (`https://api.homefin.com.br/external`).

O CRM é compartilhado entre **Correspondente**, **Corretor/Parceiro** e **Cliente** — todos consomem a MESMA base de dados, variando apenas o escopo (`scope: "correspondente" | "corretor" | "cliente"`):

- **Correspondente** → vê todo o ecossistema.
- **Corretor/Parceiro** → vê apenas sua carteira.
- **Cliente** → vê apenas o próprio cadastro/documentos/histórico (read-only com upload de pendentes).

Não duplique componentes por perfil — use a mesma tela com condicionais por `scope`.

---

## 0. REGRA INEGOCIÁVEL DE SEGURANÇA HOMEFIN

Credenciais e tokens HomeFin permanecem **100% server-side**:

- **NUNCA** colocar `SECRET_ID`, `SECRET_KEY`, JWT ou refreshToken HomeFin no frontend, em `VITE_*`, localStorage, sessionStorage, cookies JS, HTML, bundle público, URL, query string, mensagens de erro ou respostas ao cliente.
- **NUNCA** chamar `https://api.homefin.com.br` do navegador.
- **NUNCA** expor segredos em logs, console, monitoramento, BD em texto puro, commits, seeds ou docs públicas.
- Armazenar `HOMEFIN_SECRET_ID` e `HOMEFIN_SECRET_KEY` somente em **Lovable Cloud Secrets** (via tool `add_secret`). Se ainda não cadastrados, implementar a integração com esses nomes e informar o admin para cadastrar no painel seguro.
- Autenticação técnica (`/auth/token`) apenas em **server function** (`createServerFn`) ou **server route** (`/api/...`). JWT e refreshToken permanecem no servidor.
- Frontend chama somente **endpoints internos autenticados do projeto** (server functions com `requireSupabaseAuth`). Funções internas validam sessão + autorização do usuário sobre o recurso antes de acessar HomeFin.
- Timeout, retry controlado, logs sanitizados (mascarar CPF/CNPJ, e-mail, celular, Authorization, JWT, refreshToken, secretId, secretKey).
- Respostas internas nunca repassam headers secretos nem corpo bruto da autenticação — apenas dados de negócio.
- CORS restrito aos domínios do sistema. Sem `Access-Control-Allow-Origin: *` em rotas autenticadas.
- Em dev usar secrets de ambiente e mocks sem PII real.

---

## 1. ARQUITETURA SERVER-SIDE (camada HomeFin)

Criar `src/lib/homefin/` (importável apenas por server functions):

```
src/lib/homefin/
├── client.server.ts          # HTTP client único, base URL fixa, allowlist de rotas, timeout, sanitize
├── auth.server.ts            # POST /auth/token, cache curto de JWT, re-auth após 401 (1x), 1 retry
├── service.server.ts         # operações de negócio (oportunidade, simulação, participante, documento, follow-up)
├── mappers.ts                # CRM Cliente ↔ HomeFin DTOs (client-safe)
├── schemas.ts                # Zod schemas (client-safe) para validação dupla
└── errors.ts                 # SafeApiError + mapeamento status → code
```

Server functions expostas ao frontend em `src/lib/crm/*.functions.ts`:
- `crmGetDominios` → `/dominios/operacoes`, `/dominios/bancos`, `/usuarios-parceiros`
- `crmCreateOportunidade`, `crmGetOportunidade`, `crmUpdateOportunidade`
- `crmCreateSimulacao`, `crmUpdateSimulacao`, `crmExecutarIntegracaoSimulacao`
- `crmAddParticipante`, `crmUpdateParticipante`, `crmDeleteParticipante`
- `crmEnviarProposta`
- `crmUploadDocumento`, `crmVincularDocumentos`
- `crmRegistrarFollowUp`

Todas com `.middleware([requireSupabaseAuth])` e validação Zod via `.inputValidator()`.

### Fluxo obrigatório de cada chamada

1. Frontend chama server fn com **apenas dados necessários** (sem IDs HomeFin arbitrários quando deriváveis).
2. Server fn valida sessão (`requireSupabaseAuth`), perfil e pertencimento do recurso (RLS + checagem explícita).
3. Server obtém/reutiliza JWT HomeFin via `auth.server.ts` (cache curto respeitando expiração).
4. Server chama HomeFin com `Authorization: Bearer <jwt>` e timeout.
5. Em 401 → reautentica 1x, repete 1x. Sem loops.
6. Sanitiza resposta, mapeia para DTO do CRM, persiste no Lovable Cloud quando aplicável.
7. Retorna ao frontend **apenas dados de negócio** ou `SafeApiError`.

### Erros padronizados

```ts
type SafeApiError = {
  code: 'VALIDATION' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'RATE_LIMITED' | 'UPSTREAM_UNAVAILABLE' | 'INTERNAL';
  message: string;            // mensagem amigável, sem detalhe técnico
  fieldErrors?: Record<string, string>;
  requestId?: string;
};
```

Mapeamento: 400/422→VALIDATION, 401 (após retry)→UNAUTHENTICATED, 403→FORBIDDEN, 404→NOT_FOUND, 429→RATE_LIMITED, 5xx/timeout→UPSTREAM_UNAVAILABLE.

---

## 2. ROTAS HOMEFIN INTEGRADAS

| Método | Rota HomeFin | Server fn CRM | Tela CRM |
|---|---|---|---|
| POST | `/auth/token` | (interno, auth.server.ts) | — |
| GET | `/usuarios-parceiros` | `crmGetUsuariosParceiros` | Cadastro · Vínculos |
| GET | `/dominios/operacoes` | `crmGetOperacoes` | Cadastro · Operação |
| GET | `/dominios/bancos` | `crmGetBancos` | Simulação |
| POST | `/oportunidade` | `crmCreateOportunidade` | Wizard final |
| GET | `/oportunidade/{id}` | `crmGetOportunidade` | Detalhe / Timeline |
| PUT | `/oportunidade/{id}` | `crmUpdateOportunidade` | Edição |
| POST | `/oportunidade/{id}/simulacao` | `crmCreateSimulacao` | Simulações |
| PUT | `/oportunidade/{id}/simulacao/{idSim}` | `crmUpdateSimulacao` | Simulações |
| POST | `/oportunidade/{id}/simulacao/{idSim}/integracao` | `crmExecutarIntegracaoSimulacao` | Simulações · Ação |
| POST | `/oportunidade/{id}/participante` | `crmAddParticipante` | Composição de renda |
| PUT | `/oportunidade/{idOp}/participante/{id}` | `crmUpdateParticipante` | Composição de renda |
| DELETE | `/oportunidade/{idOp}/participante/{id}` | `crmDeleteParticipante` | Composição de renda |
| POST | `/oportunidade/{id}/incluir-proposta-integracao` | `crmEnviarProposta` | Simulações · Enviar |
| POST | `/documento/{id}/upload` (multipart) | `crmUploadDocumento` | Central de Documentos |
| POST | `/oportunidade/{id}/incluir-documentos-integracao` | `crmVincularDocumentos` | Central de Documentos |
| POST | `/oportunidade/{id}/follow-up` | `crmRegistrarFollowUp` | Timeline |

---

## 3. ESTRUTURA DE NAVEGAÇÃO (CRM)

Submenu **CRM de Clientes**:
1. **Dashboard** · 2. **Cadastro** · 3. **Consultas** · 4. **Documentos** · 5. **Histórico & Timeline** · 6. **Relatórios**

Rotas: `/{perfil}/crm`, `/{perfil}/crm/cadastro`, `/{perfil}/crm/consultas`, `/{perfil}/crm/documentos`, `/{perfil}/crm/historico`, `/{perfil}/crm/relatorios`.

---

## 4. DASHBOARD DO CRM

Cabeçalho (`PanelHeader`) + filtros (período, produto/operação, status, origem, corretor).

**KPIs:** Clientes ativos · Novos no período · Em análise / Documentação / Aprovados / Reprovados · Ticket médio · Conversão (Lead → Simulação → Proposta → Aprovação) · Pendências críticas (badge pulsante).

**Gráficos:** Funil de conversão · Evolução mensal · Distribuição por operação · Heatmap UF · Top 10 corretores (correspondente).

**Blocos:** Últimas movimentações · Aniversariantes · Sem movimento >30d · Pendências de documento priorizadas.

Dados de funil/etapa vêm de `crmGetOportunidade` agregados no servidor.

---

## 5. CADASTRO DE CLIENTE (wizard) — mapeado para `CreateOpportunity` HomeFin

Stepper lateral, salvar parcial a cada etapa (rascunho local + persistência ao concluir). Validação Zod inline. Ordem alinhada ao fluxo HomeFin:

### 5.1 Pré-carregamento
Ao abrir o wizard, server carrega em paralelo: `operacoes`, `bancos`, `usuariosParceiros` (apenas autorizados ao usuário logado). `regional`, `parceiro`, `usuarioParceiro` vêm da autenticação server-side ou seleção autorizada — **nunca de ID livre do navegador**.

### 5.2 Identificação (PF/PJ)
PF: nome, CPF, RG, data nascimento (`yyyy-MM-dd`), estado civil (`CA|S|VI|DI|SL|UE`), regime de bens (`CP|CU|PA|SC|SO`), nacionalidade, profissão, gênero (`M|F`), nome social.
PJ: razão social, CNPJ, IE, data fundação, tipo empresa (`SA|EPP|ME|MEI|EIRELI`), faturamento, patrimônio líquido, capital social.

### 5.3 Contato
Telefones (múltiplos), e-mails (múltiplos), WhatsApp preferido, preferência de contato. Celular somente números no payload.

### 5.4 Endereço
CEP (autocomplete ViaCEP) → logradouro, número, complemento, bairro, município, UF. Múltiplos endereços.

### 5.5 Dados financeiros & consentimento
Renda mensal / faturamento, comprovação (CLT/autônomo/empresário/aposentado), outras rendas, despesas, score interno (read-only), restrições (read-only).
**`fgAutorizacaoDados`** — checkbox **explícito**, nunca pré-marcado, registrado com timestamp/IP/usuário em tabela de auditoria.

### 5.6 Composição de renda (Participantes)
Lista com adicionar/editar/remover. Cada item = `ParticipantInput`:
- `tipoQualificacao` (`CO`=comprador, `VD`=vendedor), `tipoPessoa` (`F|J`), `fgCompoeRenda`
- Pessoais + endereço + bancários (idBanco/agência/conta/dígito)
- `utilizaFgts` (`S|N`), `fgAutorizacaoDados` próprio
- Bloco cônjuge condicional ao estado civil/regime
- Bloco empresarial condicional a `tipoPessoa = 'J'`
Mutações chamam `crmAddParticipante` / `crmUpdateParticipante` / `crmDeleteParticipante` (com confirmação).

### 5.7 Imóvel/Operação
`operacao.idOperacao` (combo da lista), `tipoImovel` (`AP|CS|GA|TE|TC`), `usoImovel` (`C|R`), `situacaoImovel` (`N|U`), UF, `valorImovel`, `valorFinanciamento`, `prazo`, `utilizaFgtsSimulacao` (`S|N`), `fgFinanciarDespesas` (`S|N`), `codigoSistemaAmortizacaoBanco` (`S`=SAC, `P`=PRICE).

### 5.8 Vínculos
Corretor responsável (autocomplete dos `usuariosParceiros` autorizados), imobiliária/parceiro, analista backoffice, comercial, origem do lead.

### 5.9 Bancos para simulação
Multi-select de `bancos` com flag `flagSimulacao: 'S'`.

### 5.10 Documentos (vide §6)

### 5.11 Observações & Tags
Rich-text livre, tags coloridas, marcadores (VIP/Prioridade/Atenção).

**Rodapé:** Salvar rascunho · Salvar e continuar · Salvar e fechar · Cancelar.
**Submit final** → `crmCreateOportunidade` retorna `idOportunidade` (guardado com segurança no servidor + vinculado ao registro CRM local).

---

## 6. CENTRAL DE DOCUMENTOS

### 6.1 Upload
Drag&drop + botão. Múltiplos arquivos. PDF/JPG/PNG/DOCX/XLSX. Máx 20MB (validar no frontend para UX e **novamente no servidor**). Categoria obrigatória, validade opcional. Barra de progresso por arquivo. Botão "Analisar com IA" (Scan IA / Flash IA) com **faixa amarela pulsante "Aguardando integração da API"**.

**Fluxo HomeFin:**
1. Upload do binário → `crmUploadDocumento` que internamente faz `POST /documento/{id}/upload` multipart com campo `arquivo` e `documentoAprovado: false`. **Não definir boundary manual**.
2. Após upload bem-sucedido, ao executar simulação/proposta, chamar `crmVincularDocumentos` (`POST /oportunidade/{id}/incluir-documentos-integracao` com `{ idSimulacao }`).
3. Servidor valida tamanho, extensão e MIME. Nunca loga o conteúdo do arquivo.

### 6.2 Visualização & Ações
Preview inline (PDF/imagem) em modal com zoom/rotate. Ações por documento: Baixar (URL assinada 15min), Visualizar, Substituir (versionamento), Aprovar/Reprovar (com motivo), Solicitar reenvio (notifica cliente), Excluir (soft delete), Compartilhar (link assinado), Histórico de versões.

### 6.3 Status visuais
🟡 Pendente · 🔵 Em análise · 🟢 Aprovado · 🔴 Reprovado · ⚫ Expirado · 🟣 Vencendo 30d.

### 6.4 Controle de acesso
Cliente vê só documentos com flag "visível ao cliente". Corretor vê só carteira. Correspondente vê tudo. Storage: bucket privado `crm-documentos` no Lovable Cloud, path `crm-documentos/{cliente_id}/{categoria}/{ts}-{filename}`, RLS por `cliente_id` + perfil.

---

## 7. CONSULTAS

Mantém padrão atual: busca global, filtros avançados em chips, abas (Clientes/Vendedores/Imóveis/Composição/Documentos/Vínculos/Propostas/Simulações), tabela colunada por escopo, ações por linha, ações em massa (exportar, atribuir corretor, mudar status, enviar mensagem), paginação + ordenação server-side. Coluna **Etapa HomeFin** quando oportunidade vinculada.

---

## 8. HISTÓRICO & TIMELINE

Linha do tempo vertical: cadastro, documento (upload/aprovação/reprova), simulação (criação/atualização/integração executada), proposta (envio), follow-up HomeFin (`tipoFup: 'I' | 'E'`, título, comentário), status, observações, vínculos.

Cada evento: ícone, autor, data/hora, descrição, link para detalhe. Filtros por tipo/período. Exportável em PDF.

Botão **"Registrar follow-up"** → modal (tipoFup, título, comentário) → `crmRegistrarFollowUp`.

Após cada mutação bem-sucedida em HomeFin, **re-buscar** `crmGetOportunidade` para refletir etapa/situação atualizadas.

---

## 9. SIMULAÇÕES & PROPOSTA (dentro do detalhe do cliente)

Aba "Simulações" lista simulações por banco com colunas: banco, valor financiamento, parcela, taxa, prazo, indexador, IOF, status integração.

**Ações:**
- **Nova simulação** → modal (`CreateSimulation`) → `crmCreateSimulacao`.
- **Editar** → `crmUpdateSimulacao` (inclui `valorDespesasFinanciadas`, `valorTotalFinanciamento`, `fgFinanciarDespesas`).
- **Executar integração** → `crmExecutarIntegracaoSimulacao` (quando disponível).
- **Enviar proposta ao banco** → confirmação obrigatória → `crmEnviarProposta({ idSimulacao })`. Botão desabilitado durante envio, anti-duplo-clique, anti-duplicidade no servidor (idempotência por `idSimulacao` em janela curta).

---

## 10. RELATÓRIOS

Cards pré-configurados + construtor:
1. Por status · 2. Por operação · 3. Funil (período) · 4. Carteira por corretor · 5. Docs pendentes · 6. Docs vencendo · 7. Aniversariantes · 8. Sem movimento · 9. Origem dos leads · 10. Performance por origem · 11. Ranking corretores · 12. Auditoria cadastral · 13. **Propostas enviadas HomeFin** · 14. **Integrações executadas (sucesso/falha)**.

Construtor: campos drag, filtros, agrupamento, ordenação, preview. Exportar PDF/Excel/CSV. Agendar envio diário/semanal/mensal. Favoritar.

---

## 11. VALIDAÇÕES & LGPD

- Validar CPF/CNPJ, e-mail, celular, CEP, UF, datas (`yyyy-MM-dd`), valores positivos, prazo.
- Remover máscara de CPF/CNPJ/celular/CEP **apenas ao montar payload server-side**.
- `fgAutorizacaoDados` **nunca pré-marcado**, ação consciente, auditável.
- Cônjuge condicional ao estado civil/regime; empresariais condicionais a PJ.
- Sem PII real em testes/previews/logs/mensagens.
- Menor privilégio, RLS, checagem de pertencimento antes de consulta/alteração.

---

## 12. PADRÕES VISUAIS E TÉCNICOS

- Tokens semânticos apenas (`bg-card`, `text-graphite`, `border-border`, `bg-brand`…). Sem cores hardcoded.
- shadcn: `PanelHeader`, `Card`, `Table`, `Dialog`, `Tabs`, `Tooltip`, `Badge`, `Sheet`.
- Estados: loading skeleton, empty state, erro com retry.
- Acessibilidade AA, teclado, `aria-label`, `role` correto.
- Responsivo (scroll horizontal em tabelas; formulários em coluna única no mobile).
- Performance: paginação server-side, lazy preview, debounce busca 300ms.
- Auditoria: `created_by`, `updated_by`, `updated_at` + entrada na timeline para toda alteração.
- Botões desabilitados durante envios; progresso no upload; confirmação para exclusão de participante e envio de proposta; preservar dados em erro recuperável.

---

## 13. INTEGRAÇÕES COM O ECOSSISTEMA

- **Scan IA / Flash IA** → botões com faixa amarela pulsante "Aguardando integração da API".
- **Operacional** → cliente CRM gera Simulação → Proposta via HomeFin.
- **Financeiro** → ao aprovar proposta, cria contas a receber/comissão.
- **Portal Cliente** → read-only do próprio cadastro/documentos/histórico (exceto upload de pendentes).
- **Backup** → CRM entra na rotina automática.
- **Notificações** → eventos disparam sino + push/e-mail/WhatsApp.

---

## 14. CRITÉRIOS DE ACEITE (verificar e reportar)

- [ ] Busca no repositório/bundle não encontra `SECRET_ID`, `SECRET_KEY`, JWT, refreshToken HomeFin.
- [ ] DevTools Network não mostra requisição do navegador para `api.homefin.com.br`.
- [ ] Usuário sem sessão não acessa server fns CRM.
- [ ] Usuário sem autorização não consulta/altera oportunidade de terceiros.
- [ ] 401 HomeFin → 1 reautenticação + 1 retry; sem loop.
- [ ] Logs sanitizados (sem PII, sem tokens).
- [ ] Criar/consultar oportunidade OK.
- [ ] CRUD participante OK.
- [ ] Criar/atualizar simulação OK.
- [ ] Executar integração simulação OK.
- [ ] Enviar proposta com confirmação + anti-duplicidade OK.
- [ ] Upload multipart correto + validação server OK.
- [ ] Vincular documentos OK.
- [ ] Registrar follow-up OK.
- [ ] Dashboard, Cadastro (wizard), Consultas, Documentos, Timeline, Relatórios funcionando nos 3 perfis.
- [ ] Responsivo desktop/mobile, feedback de loading/erro.
- [ ] TypeScript, lint, build sem erros.

---

## 15. ENTREGÁVEL FINAL

Resumo objetivo contendo:
- Arquivos criados/alterados.
- Server functions implementadas (lista com nomes).
- **Secrets que o admin precisa cadastrar via painel seguro: `HOMEFIN_SECRET_ID` e `HOMEFIN_SECRET_KEY`** (não exibir valor algum).
- Testes executados.
- Limitações conhecidas da documentação HomeFin (ex.: sem endpoint de refresh → estratégia adotada).
