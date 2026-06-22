# Prompt — Módulo de Backup & Exportação (Agilliza)

## Objetivo
Construir um módulo de **Backup & Exportação completa** do sistema, gerando um único arquivo **.xlsx** com **todas as informações** de todos os módulos (CRM, Operacional, Financeiro, Configurações, Histórico), sem omitir nenhum registro — incluindo finalizados, arquivados, cancelados e logs. Suporta **backup manual imediato** e **backup automático diário** agendado.

Rota: `/correspondente/backup` e `/corretor/backup`
Componente principal: `BackupModule` em `src/components/backup/backup-module.tsx`
Motor de geração: `src/lib/backup-engine.ts` (usa `xlsx` ou `xlsxwriter`).

---

## 1. Escopo por perfil

| Perfil | Acesso | Abrangência do arquivo |
|---|---|---|
| **Correspondente (Admin)** | Total | Todos os módulos, todos os usuários, todos os registros da operação |
| **Corretor** | Restrito | Somente os dados vinculados ao seu `idUsuarioParceiro` (clientes próprios, propostas próprias, comissões próprias, tarefas próprias) |
| **Cliente** | Sem acesso | Módulo oculto |

---

## 2. Tela única — `/backup`

### 2.1 Cabeçalho (`PanelHeader`)
- Eyebrow: "Sistema · Correspondente" (ou "Sistema · Corretor")
- Título: **Backup & Exportação**
- Subtítulo: "Exportação completa de todos os dados do sistema em planilha Excel — nenhum registro omitido."
- Badge à direita: total de registros mapeados (`{N} registros mapeados`) com ícone `ShieldCheck`.

### 2.2 Banner de sucesso (animado, transitório)
Aparece por 3s após backup gerado:
- Ícone `CheckCircle2` verde
- "Backup gerado com sucesso!"
- Nome do arquivo + total de registros + nº de abas

### 2.3 Layout em 2 colunas (`lg:grid-cols-[1fr_320px]`)

---

## 3. Coluna principal

### 3.1 Card de ação principal
- Ícone grande `FileSpreadsheet` em quadrado arredondado com fundo `brand/10`
- Título: "Backup completo do sistema"
- Descrição: gera arquivo `.xlsx` com **N abas**, cobrindo **todos os módulos**, incluindo finalizados, arquivados e histórico completo.
- Chips de tags: Clientes, Propostas, Kanban, Financeiro, Comissões, SLA, Tarefas, Histórico.
- Rodapé:
  - Esquerda: "Último backup: {data/hora}" (com `CheckCircle2`) ou "Nenhum backup realizado ainda" (com `Info` amarelo)
  - Direita: botão primário **"Gerar e baixar backup agora"** — `Download` icon → vira `RefreshCw` animado durante geração, texto vira "Gerando planilha...".

### 3.2 Lista de módulos incluídos
Card com header "Módulos incluídos no backup — {N} abas · {total} registros".
Cada linha:
- Ícone do módulo (`Users`, `TrendingUp`, `Layers`, `FileText`, `AlertTriangle`, `CheckCircle2`, `Wallet`, `BarChart3`, `RefreshCw`, `Database`)
- Nome do módulo
- Barra de progresso proporcional (relativo ao maior módulo)
- Contagem de registros (negrito)
- Ícone `ChevronRight`

**Módulos obrigatórios** (cada um vira uma aba):
1. **Clientes** — cadastro completo, todos os campos (CPF/CNPJ, contatos, endereço, qualificação, situação, cônjuge, banco, autorização LGPD, corretor responsável)
2. **Simulações** — todas as simulações realizadas, inputs e outputs
3. **Propostas (Kanban)** — todas as propostas em qualquer status (incl. arquivadas/canceladas)
4. **Histórico de propostas** — log de mudanças de status, data, usuário, observação
5. **Demandas / SLA** — demandas abertas, em andamento, concluídas, vencidas
6. **Tarefas** — tarefas atribuídas a usuários, status, prazos
7. **Contas a receber** — lançamentos, vencidos, liquidados, parciais
8. **Contas a pagar** — idem
9. **Comissões** — regras, a receber, a pagar, adiantamentos, conciliação
10. **Recorrências** — todas as regras de recorrência ativas e inativas
11. **Conciliação bancária** — extratos importados, status de conciliação
12. **Contas financeiras** — contas bancárias cadastradas, saldos
13. **Usuários / Equipe** — usuários cadastrados, perfis, permissões (sem senhas)
14. **Bancos parceiros** — bancos cadastrados no domínio
15. **Categorias financeiras** — plano de contas / categorias / centros de custo

### 3.3 Resumo financeiro do backup
Grid 2 colunas com 4 KPIs:
- Saldo total das contas (cor `brand`)
- Total a receber (pendente) — verde
- Total a pagar (pendente) — vermelho
- Total de comissões previstas — âmbar

---

## 4. Sidebar direita

### 4.1 Backup automático diário
Card com:
- Header: ícone `Calendar` + "Backup automático diário" + toggle `ToggleLeft`/`ToggleRight`
- Quando ativo: texto verde de confirmação; quando inativo: descrição neutra
- Input `type="time"` para horário diário (desabilitado quando toggle off)
- Quando ativo: aviso azul "Próximo backup: hoje às {hora}" + alerta "⚠️ O sistema precisa estar aberto no navegador."

**Persistência:** `localStorage`:
- `agilliza:backup:auto` (boolean)
- `agilliza:backup:horario` (HH:MM)
- `agilliza:backup:ultimoAuto` (data toDateString para evitar duplicar no dia)

**Loop de verificação:** `setInterval` de 60s comparando hora atual com horário definido; dispara `executarBackup("automatico")` uma vez por dia.

### 4.2 Histórico de backups
- Header: "Histórico de backups ({N})"
- Lista scrollável (max-h 360px) das últimas **30** execuções:
  - Ícone redondo: `Calendar` (automático, brand) ou `Download` (manual, emerald)
  - Nome do arquivo (negrito)
  - Data/hora · tipo
  - Total de registros exportados (em cor `brand`)
- Estado vazio: ícone `Database` cinza + "Nenhum backup realizado ainda"

**Persistência:** `agilliza:backup:historico` (array JSON, slice 30).

### 4.3 Card "Sobre o backup"
Bullets com ícones:
- ✅ Todos os registros exportados — nenhum omitido, incluindo concluídos e arquivados
- ✅ Formato .xlsx compatível com Excel, Google Sheets e LibreOffice
- ✅ Valores monetários formatados em BRL, datas em DD/MM/AAAA
- ✅ Histórico das propostas em aba separada
- ⚠️ O backup automático requer que o sistema esteja aberto no navegador

---

## 5. Motor de backup (`src/lib/backup-engine.ts`)

### 5.1 API pública
```ts
export interface ModuloBackup { nome: string; registros: number; }
export interface BackupMetadata {
  nomeArquivo: string;          // "agilliza-backup-AAAA-MM-DD-HHMM.xlsx"
  geradoEm: string;             // ISO
  modulos: ModuloBackup[];      // todos os 15 módulos
  totais: {
    saldoContas: number;
    totalReceber: number;
    totalPagar: number;
    totalComissoes: number;
  };
}
export function getBackupMetadata(): BackupMetadata;
export function gerarBackupXLSX(): void;   // monta o workbook e dispara download
```

### 5.2 Regras de geração
- Uma aba por módulo (nome exato da lista §3.2).
- Primeira linha = cabeçalho (negrito, freeze pane).
- Datas formatadas `DD/MM/AAAA HH:mm`.
- Valores monetários: número puro com formato de célula `R$ #.##0,00`.
- Booleans: `Sim`/`Não`.
- Enums (status, tipoPessoa, tipoSituacao…): label legível em português.
- Campos vazios = string vazia, nunca `null`/`undefined`.
- Nenhum filtro de status — **incluir cancelados, arquivados, finalizados, históricos**.
- Aba "Histórico de propostas" deve registrar cada transição (proposta, statusAnterior, statusNovo, usuário, data, observação).
- Aba "Usuários / Equipe" **nunca** inclui senhas, hashes, tokens ou refresh tokens.

### 5.3 Download
- Gerar `Blob` `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `URL.createObjectURL` + `<a download>` programático + `URL.revokeObjectURL`.

---

## 6. Comportamento e UX

- Botão de gerar fica desabilitado durante a geração (`opacity-60`, `active:scale-95`).
- Mínimo de 800ms de animação mesmo se a geração for instantânea (UX de feedback).
- Banner de sucesso some após 3s.
- Histórico atualizado **imediatamente** após geração (manual ou automático).
- Toda interação persiste em `localStorage` — sobrevive a reload.
- Acessibilidade: todos os botões têm `title`, ícones decorativos não interferem em leitor de tela, contraste AA.

---

## 7. Interligação com outros módulos
- Não modifica nenhum dado — é **somente leitura**.
- Lê dos mesmos repositórios usados por CRM, Operacional e Financeiro (`src/data/repositories.ts`, `src/lib/financeiro/mock-data.ts`, `src/lib/operacional/mock-data.ts`, `src/lib/crm-clients.ts`).
- Quando um corretor abre a tela, os repositórios já devem retornar apenas os dados de seu escopo (filtro aplicado upstream).

---

## 8. Critérios de aceite
1. Botão "Gerar e baixar backup agora" produz um `.xlsx` válido que abre no Excel.
2. O arquivo contém **15 abas** com os nomes exatos da §3.2.
3. Nenhum registro é omitido — incluindo cancelados, arquivados, históricos.
4. Backup automático dispara no horário configurado uma única vez por dia.
5. Histórico mantém as últimas 30 execuções, com tipo manual/automático distinto.
6. Senhas e tokens **nunca** aparecem no arquivo.
7. Corretor vê apenas seus dados; Correspondente vê tudo.
8. Tudo persiste em `localStorage` e sobrevive a reload.
