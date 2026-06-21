/**
 * backup-engine.ts — Motor de exportação XLSX para o sistema Agilliza.
 *
 * Gera um arquivo .xlsx com múltiplas abas, cada uma cobrindo um módulo
 * completo do sistema. Nenhum dado é omitido — inclui registros concluídos,
 * cancelados, arquivados e histórico.
 *
 * Quando integrado ao Supabase: substitua os arrays de mock pelas queries
 * reais. A estrutura de colunas e formatação permanecem idênticas.
 */
import * as XLSX from "xlsx";

// -- Dados mock (trocar por queries Supabase quando integrar BD) --
import { clientes, propostas, simulacoes, demandas, tarefas, bancos, usuarios } from "@/lib/operacional/mock-data";
import { contasReceber, contasPagar, comissoes, recorrencias, categorias, centrosCusto, contas, itensConciliacao } from "@/lib/financeiro/mock-data";

// -- Helpers --
const fmt = (v: unknown): string => {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    // ISO date → DD/MM/AAAA HH:MM
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
      const d = new Date(v);
      return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
    return v;
  }
  if (Array.isArray(v)) return v.join(", ");
  return JSON.stringify(v);
};

const brl = (n: number | undefined): string =>
  n === undefined ? "" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pct = (n: number | undefined): string =>
  n === undefined ? "" : `${n.toFixed(4).replace(".", ",")}%`;

const usuarioNome = (id?: string) => usuarios.find((u) => u.id === id)?.nome ?? id ?? "";
const clienteNome = (id?: string) => clientes.find((c) => c.id === id)?.nome ?? id ?? "";
const bancoNome = (id?: string) => bancos.find((b) => b.id === id)?.nome ?? id ?? "";
const categoriaNome = (id?: string) => categorias.find((c) => c.id === id)?.nome ?? id ?? "";
const centroCustoNome = (id?: string) => centrosCusto.find((c) => c.id === id)?.nome ?? id ?? "";
const contaNome = (id?: string) => contas.find((c) => c.id === id)?.nome ?? id ?? "";

// ---------------------------------------------------------------------------
// 1 — CLIENTES
// ---------------------------------------------------------------------------
function abaClientes(): any[][] {
  const header = [
    "ID", "Nome", "CPF", "CNPJ", "E-mail", "Telefone",
    "Corretor responsável", "Tipo",
  ];
  const rows = clientes.map((c) => [
    c.id, c.nome, fmt(c.cpf), fmt(c.cnpj ?? ""), fmt(c.email), fmt(c.telefone),
    usuarioNome(c.corretorId),
    c.cnpj ? "Pessoa Jurídica" : "Pessoa Física",
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 2 — SIMULAÇÕES
// ---------------------------------------------------------------------------
function abaSimulacoes(): (string | number)[][] {
  const header = [
    "ID", "Status", "Produto", "Cliente", "Corretor", "Criada em", "Atualizada em",
    "Valor do imóvel", "Valor entrada", "Valor financiado", "Valor solicitado (HE)",
    "LTV %", "Prazo (meses)", "Renda bruta", "Observações",
  ];
  const rows = simulacoes.map((s) => [
    s.id,
    s.status,
    s.produto,
    clienteNome(s.clienteId),
    usuarioNome(s.corretorId),
    fmt(s.criadaEm),
    fmt(s.atualizadaEm),
    brl(s.valorImovel),
    brl(s.valorEntrada),
    brl(s.valorFinanciado),
    brl(s.valorSolicitado),
    pct(s.ltvPercent),
    s.prazoMesesBase,
    brl(s.rendaBruta),
    s.observacoes ?? "",
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 3 — PROPOSTAS (Kanban)
// ---------------------------------------------------------------------------
function abaPropostas(): (string | number)[][] {
  const header = [
    "ID", "Número", "Status", "Etapa (Kanban)", "Produto", "Banco",
    "Cliente", "Corretor", "Responsável", "Valor", "Prioridade",
    "SLA prazo", "Pendências", "Documentos", "Transferida",
    "Criada em", "Atualizada em",
  ];
  const rows = propostas.map((p) => [
    p.id,
    p.numero,
    p.status,
    p.etapa,
    p.produto,
    bancoNome(p.bancoId),
    clienteNome(p.clienteId),
    usuarioNome(p.corretorId),
    usuarioNome(p.responsavelId),
    brl(p.valor),
    p.prioridade,
    fmt(p.slaPrazo),
    p.pendencias,
    p.documentos,
    p.transferida ? "Sim" : "Não",
    fmt(p.criadaEm),
    fmt(p.atualizadaEm),
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 4 — HISTÓRICO DAS PROPOSTAS
// ---------------------------------------------------------------------------
function abaHistoricoPropostas(): (string | number)[][] {
  const header = ["Proposta ID", "Número", "Data", "Usuário", "Ação"];
  const rows: (string | number)[][] = [];
  for (const p of propostas) {
    for (const h of p.historico ?? []) {
      rows.push([p.id, p.numero, fmt(h.data), usuarioNome(h.usuarioId), h.acao]);
    }
  }
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 5 — DEMANDAS / SLA
// ---------------------------------------------------------------------------
function abaDemandas(): (string | number)[][] {
  const header = [
    "ID", "Título", "Tipo", "Status", "Prioridade",
    "Cliente", "Proposta vinculada", "Responsável", "Criado por",
    "SLA prazo", "Transferida", "Criada em",
  ];
  const rows = demandas.map((d) => [
    d.id,
    d.titulo,
    d.tipo,
    d.status,
    d.prioridade,
    clienteNome(d.clienteId),
    d.propostaId ?? "",
    usuarioNome(d.responsavelId),
    usuarioNome(d.criadoPorId),
    fmt(d.slaPrazo),
    d.transferida ? "Sim" : "Não",
    fmt(d.criadaEm),
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 6 — TAREFAS
// ---------------------------------------------------------------------------
function abaTarefas(): (string | number)[][] {
  const header = [
    "ID", "Título", "Status", "Prioridade",
    "Usuário", "Cliente", "Proposta vinculada", "Prazo",
  ];
  const rows = tarefas.map((t) => [
    t.id,
    t.titulo,
    t.status,
    t.prioridade,
    usuarioNome(t.usuarioId),
    clienteNome(t.clienteId),
    t.propostaId ?? "",
    fmt(t.prazo),
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 7 — CONTAS A RECEBER
// ---------------------------------------------------------------------------
function abaContasReceber(): (string | number)[][] {
  const header = [
    "ID", "Descrição", "Status", "Natureza", "Produto",
    "Cliente", "Corretor", "Proposta", "Categoria", "Centro de custo",
    "Conta financeira", "Forma de pagamento",
    "Valor", "Valor pago", "Saldo",
    "Emissão", "Vencimento", "Liquidação",
    "Parcela atual", "Total parcelas",
  ];
  const rows = contasReceber.map((r) => {
    const saldo = r.valor - (r.valorPago ?? 0);
    return [
      r.id,
      r.descricao,
      r.status,
      r.natureza,
      r.produto ?? "",
      clienteNome(r.clienteId),
      usuarioNome(r.corretorId),
      r.propostaId ?? "",
      categoriaNome(r.categoriaId),
      centroCustoNome(r.centroCustoId),
      contaNome(r.contaId),
      r.forma ?? "",
      brl(r.valor),
      brl(r.valorPago),
      brl(saldo),
      fmt(r.emissao),
      fmt(r.vencimento),
      fmt(r.liquidacao),
      r.parcelamento?.parcelaAtual ?? "",
      r.parcelamento?.totalParcelas ?? "",
    ];
  });
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 8 — CONTAS A PAGAR
// ---------------------------------------------------------------------------
function abaContasPagar(): (string | number)[][] {
  const header = [
    "ID", "Descrição", "Status", "Natureza",
    "Fornecedor", "Beneficiário", "Categoria", "Centro de custo",
    "Conta financeira", "Forma de pagamento",
    "Valor", "Valor pago", "Saldo",
    "Emissão", "Vencimento", "Liquidação",
    "Parcela atual", "Total parcelas",
  ];
  const rows = contasPagar.map((p) => {
    const saldo = p.valor - (p.valorPago ?? 0);
    return [
      p.id,
      p.descricao,
      p.status,
      p.natureza,
      p.fornecedor ?? "",
      p.beneficiario ?? "",
      categoriaNome(p.categoriaId),
      centroCustoNome(p.centroCustoId),
      contaNome(p.contaId),
      p.forma ?? "",
      brl(p.valor),
      brl(p.valorPago),
      brl(saldo),
      fmt(p.emissao),
      fmt(p.vencimento),
      fmt(p.liquidacao),
      p.parcelamento?.parcelaAtual ?? "",
      p.parcelamento?.totalParcelas ?? "",
    ];
  });
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 9 — COMISSÕES
// ---------------------------------------------------------------------------
function abaComissoes(): (string | number)[][] {
  const header = [
    "ID", "Status", "Produto", "Banco",
    "Corretor", "Cliente", "Proposta",
    "Base de cálculo", "Percentual (%)", "Valor comissão",
    "Data prevista", "Data liberação", "Data pagamento",
    "Forma", "Bloqueada", "Motivo bloqueio",
  ];
  const rows = comissoes.map((c) => [
    c.id,
    c.status,
    c.produto,
    bancoNome(c.bancoId),
    usuarioNome(c.corretorId),
    clienteNome(c.clienteId),
    c.propostaId,
    brl(c.baseCalculo),
    pct(c.percentual),
    brl(c.valor),
    fmt(c.dataPrevista),
    fmt(c.dataLiberacao),
    fmt(c.dataPagamento),
    c.forma ?? "",
    c.bloqueada ? "Sim" : "Não",
    c.motivoBloqueio ?? "",
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 10 — RECORRÊNCIAS
// ---------------------------------------------------------------------------
function abaRecorrencias(): (string | number)[][] {
  const header = [
    "ID", "Descrição", "Tipo", "Status", "Frequência",
    "Dia vencimento", "Data inicial", "Indefinido",
    "Valor", "Valor variável",
    "Conta financeira", "Categoria",
    "Próxima geração", "Última geração",
  ];
  const rows = recorrencias.map((r) => [
    r.id,
    r.descricao,
    r.tipo === "pagar" ? "Pagar" : "Receber",
    r.status,
    r.frequencia,
    r.diaVencimento,
    fmt(r.dataInicial),
    r.indefinido ? "Sim" : "Não",
    brl(r.valor),
    r.valorVariavel ? "Sim" : "Não",
    contaNome(r.contaId),
    categoriaNome(r.categoriaId),
    fmt(r.proximaGeracao),
    fmt(r.ultimaGeracao),
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 11 — CONCILIAÇÃO BANCÁRIA
// ---------------------------------------------------------------------------
function abaConciliacao(): (string | number)[][] {
  const header = [
    "ID", "Data", "Conta", "Descrição", "Categoria",
    "Valor", "Status", "Origem",
  ];
  const rows = itensConciliacao.map((i) => [
    i.id,
    fmt(i.data),
    contaNome(i.contaId),
    i.descricao,
    categoriaNome(i.categoriaId),
    brl(i.valor),
    i.status,
    i.origem,
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 12 — CONTAS FINANCEIRAS
// ---------------------------------------------------------------------------
function abaContasFinanceiras(): (string | number)[][] {
  const header = ["ID", "Nome", "Banco", "Agência", "Conta", "Saldo atual"];
  const rows = contas.map((c) => [
    c.id,
    c.nome,
    c.banco,
    c.agencia ?? "",
    c.conta ?? "",
    brl(c.saldoAtual),
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 13 — USUÁRIOS / EQUIPE
// ---------------------------------------------------------------------------
function abaUsuarios(): (string | number)[][] {
  const header = ["ID", "Nome", "E-mail", "Papel"];
  const rows = usuarios.map((u) => [u.id, u.nome, u.email, u.papel]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 14 — BANCOS PARCEIROS
// ---------------------------------------------------------------------------
function abaBancos(): (string | number)[][] {
  const header = ["ID", "Nome", "Sigla"];
  const rows = bancos.map((b) => [b.id, b.nome, b.sigla]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// 15 — CATEGORIAS
// ---------------------------------------------------------------------------
function abaCategorias(): (string | number)[][] {
  const header = ["ID", "Nome", "Tipo", "Centro de custo", "Ativa", "Cor"];
  const rows = categorias.map((c) => [
    c.id, c.nome, c.tipo, centroCustoNome(c.centroCustoId),
    c.ativa ? "Sim" : "Não", c.cor,
  ]);
  return [header, ...rows];
}

// ---------------------------------------------------------------------------
// RESUMO EXECUTIVO
// ---------------------------------------------------------------------------
function abaResumo(geradoEm: string): (string | number)[][] {
  const totalReceber = contasReceber.reduce((s, r) => s + r.valor, 0);
  const totalRecebido = contasReceber.filter((r) => r.status === "Recebido").reduce((s, r) => s + r.valor, 0);
  const totalPagar = contasPagar.reduce((s, r) => s + r.valor, 0);
  const totalPago = contasPagar.filter((p) => p.status === "Pago").reduce((s, r) => s + r.valor, 0);
  const totalComissoes = comissoes.reduce((s, c) => s + c.valor, 0);
  const comissoesPagas = comissoes.filter((c) => c.status === "Paga").reduce((s, c) => s + c.valor, 0);
  const saldoTotal = contas.reduce((s, c) => s + c.saldoAtual, 0);

  return [
    ["AGILLIZA — BACKUP COMPLETO DO SISTEMA"],
    ["Gerado em:", geradoEm],
    [""],
    ["MÓDULO", "TOTAL DE REGISTROS", "OBSERVAÇÃO"],
    ["Clientes", clientes.length, ""],
    ["Simulações", simulacoes.length, "Incluindo arquivadas"],
    ["Propostas", propostas.length, "Incluindo finalizadas e reprovadas"],
    ["Demandas / SLA", demandas.length, "Incluindo concluídas"],
    ["Tarefas", tarefas.length, "Incluindo concluídas"],
    ["Contas a receber", contasReceber.length, ""],
    ["Contas a pagar", contasPagar.length, ""],
    ["Comissões", comissoes.length, ""],
    ["Recorrências", recorrencias.length, ""],
    ["Itens conciliação", itensConciliacao.length, ""],
    ["Contas financeiras", contas.length, ""],
    ["Usuários / Equipe", usuarios.length, ""],
    ["Bancos parceiros", bancos.length, ""],
    [""],
    ["FINANCEIRO", "VALOR", ""],
    ["Saldo total contas", brl(saldoTotal), ""],
    ["Total a receber (em aberto)", brl(totalReceber - totalRecebido), ""],
    ["Total recebido", brl(totalRecebido), ""],
    ["Total a pagar (em aberto)", brl(totalPagar - totalPago), ""],
    ["Total pago", brl(totalPago), ""],
    ["Total comissões previstas", brl(totalComissoes), ""],
    ["Total comissões pagas", brl(comissoesPagas), ""],
  ];
}

// ---------------------------------------------------------------------------
// FUNÇÃO PRINCIPAL — gera e baixa o arquivo
// ---------------------------------------------------------------------------
export function gerarBackupXLSX(): void {
  const agora = new Date();
  const geradoEm = agora.toLocaleString("pt-BR");
  const dataArquivo = agora.toISOString().slice(0, 10).replace(/-/g, "");
  const nomeArquivo = `agilliza-backup-${dataArquivo}.xlsx`;

  const wb = XLSX.utils.book_new();

  const abas: { nome: string; dados: (string | number)[][] }[] = [
    { nome: "📊 Resumo", dados: abaResumo(geradoEm) },
    { nome: "👥 Clientes", dados: abaClientes() },
    { nome: "🔢 Simulações", dados: abaSimulacoes() },
    { nome: "📋 Propostas", dados: abaPropostas() },
    { nome: "🔄 Hist. Propostas", dados: abaHistoricoPropostas() },
    { nome: "🎯 Demandas SLA", dados: abaDemandas() },
    { nome: "✅ Tarefas", dados: abaTarefas() },
    { nome: "💚 Contas a Receber", dados: abaContasReceber() },
    { nome: "💸 Contas a Pagar", dados: abaContasPagar() },
    { nome: "🤝 Comissões", dados: abaComissoes() },
    { nome: "🔁 Recorrências", dados: abaRecorrencias() },
    { nome: "🏦 Conciliação", dados: abaConciliacao() },
    { nome: "🏧 Contas Financeiras", dados: abaContasFinanceiras() },
    { nome: "👤 Equipe", dados: abaUsuarios() },
    { nome: "🏛 Bancos Parceiros", dados: abaBancos() },
    { nome: "🏷 Categorias", dados: abaCategorias() },
  ];

  for (const { nome, dados } of abas) {
    const ws = XLSX.utils.aoa_to_sheet(dados);

    // Largura automática das colunas (estimada pelo conteúdo)
    const colWidths: { wch: number }[] = [];
    for (const row of dados.slice(0, 3)) {
      row.forEach((cell, ci) => {
        const len = String(cell).length + 2;
        if (!colWidths[ci] || colWidths[ci].wch < len) {
          colWidths[ci] = { wch: Math.min(len, 50) };
        }
      });
    }
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, nome);
  }

  XLSX.writeFile(wb, nomeArquivo);
}

// ---------------------------------------------------------------------------
// Metadados do backup para exibição na UI
// ---------------------------------------------------------------------------
export interface BackupMetadata {
  geradoEm: string;
  nomeArquivo: string;
  modulos: { nome: string; registros: number }[];
  totais: {
    saldoContas: number;
    totalReceber: number;
    totalPagar: number;
    totalComissoes: number;
  };
}

export function getBackupMetadata(): BackupMetadata {
  const agora = new Date();
  const dataArquivo = agora.toISOString().slice(0, 10).replace(/-/g, "");

  return {
    geradoEm: agora.toLocaleString("pt-BR"),
    nomeArquivo: `agilliza-backup-${dataArquivo}.xlsx`,
    modulos: [
      { nome: "Clientes", registros: clientes.length },
      { nome: "Simulações", registros: simulacoes.length },
      { nome: "Propostas (Kanban)", registros: propostas.length },
      { nome: "Histórico de propostas", registros: propostas.reduce((s, p) => s + (p.historico?.length ?? 0), 0) },
      { nome: "Demandas / SLA", registros: demandas.length },
      { nome: "Tarefas", registros: tarefas.length },
      { nome: "Contas a receber", registros: contasReceber.length },
      { nome: "Contas a pagar", registros: contasPagar.length },
      { nome: "Comissões", registros: comissoes.length },
      { nome: "Recorrências", registros: recorrencias.length },
      { nome: "Conciliação bancária", registros: itensConciliacao.length },
      { nome: "Contas financeiras", registros: contas.length },
      { nome: "Usuários / Equipe", registros: usuarios.length },
      { nome: "Bancos parceiros", registros: bancos.length },
      { nome: "Categorias financeiras", registros: categorias.length },
    ],
    totais: {
      saldoContas: contas.reduce((s, c) => s + c.saldoAtual, 0),
      totalReceber: contasReceber.filter((r) => r.status !== "Recebido").reduce((s, r) => s + r.valor, 0),
      totalPagar: contasPagar.filter((p) => p.status !== "Pago").reduce((s, r) => s + r.valor, 0),
      totalComissoes: comissoes.reduce((s, c) => s + c.valor, 0),
    },
  };
}
