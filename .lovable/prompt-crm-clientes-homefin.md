# Prompt — CRM de Clientes (alinhado à API HomeFin)

> Use este prompt para reconstruir o módulo **CRM → Clientes** do ecossistema (Correspondente, Corretor e Cliente) com **campos, domínios e regras 100% espelhados na API HomeFin** (Oportunidade, Participante, Simulação, Proposta, Documentos, Follow-up). O objetivo é que cada campo do formulário corresponda exatamente ao payload que será enviado/recebido da HomeFin, eliminando retrabalho na hora da integração.

---

## 1. Visão geral

Recrie o **CRM de Clientes** como o cadastro central de pessoas e empresas do ecossistema. Cada cliente cadastrado no CRM se transforma, no momento da simulação, em uma **Oportunidade HomeFin** + um ou mais **Participantes HomeFin** (Comprador / Vendedor / Cônjuge / Compositor de renda).

O CRM é o mesmo nos três sistemas, mas com escopos diferentes:

- **Correspondente** — vê todos os clientes da operação, todos os corretores, todas as imobiliárias.
- **Corretor** — vê apenas os clientes da sua carteira.
- **Cliente** — vê apenas o próprio cadastro e propõe correções.

Os três compartilham a **mesma base de dados**. Qualquer alteração de cadastro feita pelo Corretor aparece imediatamente para o Correspondente e, quando aplicável (dados pessoais), também para o próprio Cliente.

---

## 2. Estrutura do CRM de Clientes

O módulo Clientes deve ter quatro áreas:

1. **Lista de clientes** (consulta unificada com filtros).
2. **Ficha do cliente** (dados completos do participante).
3. **Vínculos do cliente** (oportunidades, simulações, propostas, documentos, follow-ups, cônjuge, compositores de renda, vendedores, imóveis).
4. **Histórico do cliente** (timeline auditável: o que mudou, quem mudou, quando).

---

## 3. Campos da ficha de cliente — espelhados na API HomeFin

> **Regra de ouro:** todo campo abaixo deve usar **o mesmo nome técnico, o mesmo tipo e o mesmo domínio de valores** da API HomeFin. Labels podem ser em português, mas o `name` do campo no formulário e o nome da coluna no banco devem ser idênticos ao schema da API.

### 3.1 Identificação do participante (HomeFin → `CreateParticipantRequest`)

| Campo (API) | Label UI | Tipo | Domínio / Máscara |
|---|---|---|---|
| `tipoSituacao` | Situação | enum | `A` Ativa / `I` Inativa |
| `tipoQualificacao` | Qualificação | enum | `CO` Comprador / `VD` Vendedor |
| `tipoPessoa` | Tipo de pessoa | enum | `F` Física / `J` Jurídica |
| `nomeParticipante` | Nome completo / Razão social | string | — |
| `cpfCnpj` | CPF / CNPJ | string | **somente números** |
| `dataNascimento` | Data de nascimento / fundação | date | `yyyy-MM-dd` |
| `nomeMae` | Nome da mãe | string | (PF) |
| `tipoSexo` | Sexo | enum | `M` / `F` |
| `tipoEstadoCivil` | Estado civil | enum | `CA` Casado(a) / `S` Solteiro(a) / `VI` Viúvo(a) / `DI` Divorciado(a) / `SL` Separado(a) Legalmente / `UE` União Estável |
| `tipoRegimeCasamento` | Regime de casamento | enum | `CP` Comunhão Parcial / `CU` Comunhão Universal / `PA` Participação Final nos Aquestos / `SC` Separação Convencional / `SO` Separação Obrigatória |
| `fgAutorizacaoDados` | Autoriza tratamento de dados | boolean | LGPD |
| `compradorPrincipal` | Comprador principal | enum | `S` / `N` |

### 3.2 Documento de identidade (PF)

| Campo (API) | Label UI | Domínio |
|---|---|---|
| `tipoDocumentoIdentidade` | Tipo de documento | `RG` / `CNH` |
| `numeroDocumento` | Número | string |
| `dataExpedicao` | Data de expedição | `yyyy-MM-dd` |
| `orgaoExpedidor` | Órgão expedidor | string |
| `ufExpedicao` | UF de expedição | UF (2 letras) |

### 3.3 Contato

| Campo (API) | Label UI | Máscara |
|---|---|---|
| `email` | E-mail | RFC 5322 |
| `celular` | Celular | **somente números** (ex. `11912345678`) |

### 3.4 Endereço

`cep` (8 dígitos), `logradouro`, `numeroLogradouro`, `complementoLogradouro`, `bairro`, `municipio`, `uf`.

> Implementar **busca por CEP** que preenche `logradouro / bairro / municipio / uf` automaticamente.

### 3.5 Profissão e renda (PF)

| Campo (API) | Label UI |
|---|---|
| `nomeProfissao` | Profissão |
| `nomeEmpresaProfissao` | Empresa |
| `renda` | Renda mensal (R$) |
| `utilizaFgts` | Utiliza FGTS (`S`/`N`) |

### 3.6 Dados bancários

`idBanco` (vem do domínio `/dominios/bancos`), `codigoAgencia`, `codigoContaCorrente`, `digitoContaCorrente`.

### 3.7 Pessoa Jurídica (quando `tipoPessoa = J`)

| Campo (API) | Label UI |
|---|---|
| `tipoEmpresa` | Tipo de empresa (`SA` / `EPP` / `ME` / `MEI` / `EIRELI`) |
| `dataRegistroEmpresa` | Data de constituição |
| `faturamentoEmpresa` | Faturamento anual |
| `patrimonioLiquidoEmpresa` | Patrimônio líquido |
| `capitalSocialEmpresa` | Capital social |

### 3.8 Cônjuge (quando `tipoEstadoCivil ∈ {CA, UE}`)

Todos os campos com sufixo `Conjuge` da API: `nomeConjuge`, `cpfConjuge`, `dataNascimentoConjuge`, `tipoEstadoCivilConjuge`, `tipoDocumentoIdentidadeConjuge`, `numeroDocumentoConjuge`, `dataExpedicaoConjuge`, `orgaoExpedidorConjuge`, `ufExpedicaoConjuge`, `nomeProfissaoConjuge`, `nomeEmpresaProfissaoConjuge`, `rendaConjuge`, `tipoSexoConjuge`.

Mostrar bloco **Cônjuge** condicionalmente.

### 3.9 Composição de renda

Lista N de **compositores** — cada compositor é um novo Participante (`tipoQualificacao = CO`) vinculado à mesma oportunidade. Reaproveitar a ficha completa.

---

## 4. Aba "Oportunidades" do cliente — campos da API `CreateOpportunityRequest`

Cada oportunidade exibida e editável usa **exatamente** estes campos:

- **Operação** — `operacao.idOperacao` (vem de `/dominios/operacoes`).
- **Imóvel** — `tipoImovel` (`AP` / `CS` / `GA` / `TE` / `TC`), `usoImovel` (`R` / `C`), `uf`, `valorImovel`, endereço completo (`cep`, `logradouro`, `numeroLogradouro`, `complementoLogradouro`, `bairro`, `municipio`), `contatoAvaliacao`, `telefoneContatoAvaliacao`.
- **Financiamento** — `valorFinanciamento`, `prazo` (meses), `utilizaFgtsSimulacao` (`S`/`N`), `codigoSistemaAmortizacaoBanco.id` (`S` SAC / `P` PRICE).
- **Bancos** — array `bancos[]` com `idBanco`, `codigoBanco`, `nomeBanco`, `flagSimulacao` (`S`/`N`) — usar `/dominios/bancos`.
- **Cliente principal embutido** — `cpfCnpj`, `nome`, `rendaTotal`, `dataNascimento`, `email`, `celular`, `fgCompoeRenda`, e bloco de cônjuge (`cpfConjuge`, `nomeConjuge`, `emailConjuge`, `celularConjuge`, `rendaConjuge`).
- **Situação** — `tipoSituacao` (`A` Ativa / `T` Contrato Emitido / `C` Cancelada) — somente leitura, vem do retorno.
- **Identificadores HomeFin** — `idOportunidade`, `codigoOportunidade`, `codigoOportunidadeBanco`, `idBancoEscolhido` — exibir como referência.

---

## 5. Aba "Simulações" — `CreateSimulationRequest`

Para cada oportunidade, lista de simulações com campos da API: valores simulados por banco (`valorFinanciamentoSimulacao`, `valorParcelaSimulacao`, `prazoPagamentoSimulacao`), retornos do banco escolhido (`valorFinanciamentoBanco`, `valorParcelaBanco`, `prazoPagamentoBanco`, `valorFinanciamentoBancoMax`, `valorParcelaBancoMax`, `prazoPagamentoBancoMax`, `taxaJurosAnoBanco`, `valorIofBanco`, `sistemaAmortizacaoBanco`, `indexadorBanco`).

Ação "Enviar simulação ao banco" → chama `POST /oportunidade/{id}/simulacao/{idSimulacao}/integracao`.

---

## 6. Aba "Propostas" — `CreateProposalRequest`

Botão "Incluir proposta" chama `POST /oportunidade/{id}/incluir-proposta-integracao`. Exibir status, banco, código da proposta no banco, datas e retornos.

---

## 7. Aba "Documentos" — `SendDocumentsRequest`

- Lista de documentos do cliente, do imóvel e dos participantes.
- Upload via `POST /documento/{id}/upload`.
- Envio em lote ao banco via `POST /oportunidade/{id}/incluir-documentos-integracao`.
- Exibir `SituacaoIntegracaoDocumento` (pendente / enviado / aceito / rejeitado).

---

## 8. Aba "Follow-up" — `FollowUpRequest`

Linha do tempo de interações (`POST /oportunidade/{id}/follow-up`): data, autor (`idUsuarioParceiro`), texto livre, tipo de contato. Ordenação decrescente.

---

## 9. Aba "Participantes" — gestão de envolvidos

Lista de participantes da oportunidade (`/oportunidade/{id}/participante` — POST cria, PUT atualiza, DELETE remove). Cada linha mostra `tipoQualificacao` (Comprador/Vendedor), `tipoPessoa`, nome, CPF/CNPJ, renda e flag `compradorPrincipal`.

---

## 10. Domínios (selects) — fontes oficiais

| Select | Endpoint HomeFin |
|---|---|
| Operações | `GET /dominios/operacoes` |
| Bancos | `GET /dominios/bancos` |
| Usuários parceiros (corretores) | `GET /usuarios-parceiros` |
| Regional / Parceiro / Usuário parceiro | retornados em `POST /auth/token` |

Cachear localmente com refresh diário. Nunca hardcodar listas de bancos ou operações.

---

## 11. Lista de clientes (tela principal do CRM)

Colunas: Nome, CPF/CNPJ, Contato, Status (`tipoSituacao` da última oportunidade), Produto (operação HomeFin), Corretor (`idUsuarioParceiro`), Imobiliária (regional/parceiro), Analista, Criado, Atualizado, Pendências (nº de documentos pendentes).

Filtros (chips): Nome, CPF/CNPJ, Telefone, E-mail, Status, Operação, Tipo de imóvel, Uso do imóvel, UF, Banco escolhido, Corretor, Período, Possui simulação, Possui proposta, Possui pendência, Utiliza FGTS, Compõe renda.

Ações por linha: Visualizar, Editar, Criar simulação (abre wizard pré-preenchido), Vínculos, Documentos, Anexar documento, Follow-up, Histórico, Inativar (`tipoSituacao = I`).

---

## 12. Validações alinhadas à API

- `cpfCnpj`, `celular`, `cep` → **somente números** antes do envio.
- Datas → `yyyy-MM-dd`.
- Enums → enviar **apenas o código** (`AP`, `CA`, `SAC` etc.), nunca o rótulo em português.
- `valorImovel`, `valorFinanciamento`, `renda` → número com até 2 casas decimais, sem máscara monetária no payload.
- `tipoRegimeCasamento` obrigatório quando `tipoEstadoCivil ∈ {CA, UE}`.
- `dados do cônjuge` obrigatórios quando o regime exige (CP/CU/PA).
- `dataExpedicao` ≤ hoje.
- Empresa (`tipoPessoa = J`) → `tipoEmpresa`, `dataRegistroEmpresa`, `faturamentoEmpresa` obrigatórios.
- `fgAutorizacaoDados` obrigatório `true` antes de qualquer envio à HomeFin (LGPD).

---

## 13. Conexão entre os três sistemas

- **Corretor cadastra cliente** → grava no banco do ecossistema → aparece na lista do Correspondente em tempo real → cria conta de acesso do Cliente (Portal do Cliente recebe convite).
- **Corretor cria oportunidade** → POST HomeFin `/oportunidade` → `idOportunidade` é salvo no cliente → aparece na timeline do Cliente e no funil do Correspondente.
- **Simulação / Proposta / Documentos / Follow-up** → cada chamada à HomeFin atualiza o cadastro local e dispara notificação contextual nos três painéis (com profundidade decrescente: Correspondente vê tudo, Corretor vê detalhe operacional, Cliente vê linguagem amigável).
- **Cliente envia documento pelo Portal do Cliente** → upload local + `POST /documento/{id}/upload` → status muda em todos os três painéis.
- **Correspondente altera regional/operação** → propaga para o Corretor responsável e ajusta os domínios da oportunidade.

---

## 14. Segurança e auditoria

- Toda mutação no cadastro grava no histórico: campo alterado, valor anterior, valor novo, autor, timestamp, IP.
- Mascarar CPF/CNPJ na lista para perfis sem permissão.
- Portal do Cliente é **somente leitura + envio de documentos + correção dos próprios dados pessoais** (não pode alterar valores financeiros, banco ou oportunidade).
- Tokens HomeFin sempre server-side; nunca expor `Authorization` no frontend.

---

## 15. Direção visual

Mesma identidade dos demais módulos: Azul Profundo (institucional), Vermelho Direcional (alertas), Verde (sucesso), Âmbar (aviso), Azul claro (informativo), Cinza (neutro). Sem gradientes, sem landing page, sem animações decorativas. Tabelas densas, tipografia corporativa, foco em leitura rápida e ações por linha.

---

## Resultado esperado

Um **CRM de Clientes único, hierárquico e auditável**, em que cada campo é um espelho fiel do contrato da API HomeFin — pronto para que a integração real (Edge Functions) seja apenas o transporte do payload, sem precisar redesenhar formulário, validação nem domínio de valores.

---

## 16. Tela "Cadastro de Cliente" (/crm/cadastro)
Wizard 6 etapas espelhando CreateParticipantRequest: Identificação, Estado Civil/Cônjuge, Documento, Contato/Endereço, Renda/Banco, LGPD/Vínculo. Campo "Buscar cliente existente" como <input type="text"> com autocomplete (anti-duplicidade). idUsuarioParceiro fixo para Corretor. Salva rascunho por etapa e grava histórico.

## 17. Tela "Consultas de Clientes" (/crm/consultas)
Filtros: busca livre (cpfCnpj, nome, email, celular, idCliente, codigoOportunidade), tipoPessoa, tipoSituacao, tipoQualificacao, uf, municipio, idUsuarioParceiro, idParceiro, idRegional, faixaRenda, possuiOportunidade, tipoTemperaturaOportunidade, período, fgAutorizacaoDados. Tabela densa com ações por linha e em massa. Escopo: Correspondente (tudo), Corretor (só sua carteira).

## 18. Tela "Relatórios de Clientes" (/crm/relatorios)
Relatórios: Carteira, Produção por Corretor, Funil Comercial, Qualidade da Base, LGPD & Compliance, Origem/Captação. Exportação CSV/XLSX/PDF. Mesmos dados do Painel de Monitoramento — consistência total entre dashboards e relatórios.
