// Mock data do módulo Financeiro — vinculado ao ecossistema operacional
import type {
  Categoria, CentroCusto, ContaFinanceira, Lancamento, Comissao,
  Recorrencia, ItemConciliacao, StatusReceber, StatusPagar, StatusComissao,
  FormaPagamento, Frequencia,
} from "./types";
import { propostas, clientes, bancos, usuarios } from "@/lib/operacional/mock-data";
import { ANCHOR_NOW, DAY_MS } from "@/data/anchor";

const now = ANCHOR_NOW;
const day = DAY_MS;
const dAhead = (n: number) => new Date(now + n * day).toISOString();
const dAgo = (n: number) => new Date(now - n * day).toISOString();
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

export const centrosCusto: CentroCusto[] = [
  { id: "cc-op", nome: "Operacional" },
  { id: "cc-com", nome: "Comercial" },
  { id: "cc-bo", nome: "Backoffice" },
  { id: "cc-mkt", nome: "Marketing" },
  { id: "cc-adm", nome: "Administrativo" },
  { id: "cc-tec", nome: "Tecnologia" },
  { id: "cc-cor", nome: "Corretores" },
  { id: "cc-imob", nome: "Imobiliárias" },
  { id: "cc-fi", nome: "Financiamento Imobiliário" },
  { id: "cc-he", nome: "Home Equity" },
];

export const categorias: Categoria[] = [
  { id: "cat-r-comissao-banco", nome: "Comissão Bancária", tipo: "Receita", cor: "#15803d", ativa: true, centroCustoId: "cc-com" },
  { id: "cat-r-taxa-cliente", nome: "Taxa do Cliente", tipo: "Receita", cor: "#0ea5e9", ativa: true, centroCustoId: "cc-com" },
  { id: "cat-r-bonus", nome: "Bônus / Performance", tipo: "Receita", cor: "#84cc16", ativa: true, centroCustoId: "cc-com" },
  { id: "cat-d-comissao-cor", nome: "Comissão de Corretor", tipo: "Comissão", cor: "#d97706", ativa: true, centroCustoId: "cc-cor" },
  { id: "cat-d-comissao-imob", nome: "Comissão de Imobiliária", tipo: "Comissão", cor: "#f59e0b", ativa: true, centroCustoId: "cc-imob" },
  { id: "cat-d-folha", nome: "Folha de Pagamento", tipo: "Administrativo", cor: "#6366f1", ativa: true, centroCustoId: "cc-adm" },
  { id: "cat-d-aluguel", nome: "Aluguel", tipo: "Administrativo", cor: "#64748b", ativa: true, centroCustoId: "cc-adm" },
  { id: "cat-d-software", nome: "Software / SaaS", tipo: "Tecnologia", cor: "#8b5cf6", ativa: true, centroCustoId: "cc-tec" },
  { id: "cat-d-mkt", nome: "Mídia / Anúncios", tipo: "Marketing", cor: "#ec4899", ativa: true, centroCustoId: "cc-mkt" },
  { id: "cat-d-imposto", nome: "Impostos", tipo: "Imposto", cor: "#f5333f", ativa: true, centroCustoId: "cc-adm" },
  { id: "cat-d-banco", nome: "Tarifas Bancárias", tipo: "Bancário", cor: "#000f9f", ativa: true, centroCustoId: "cc-adm" },
];

export const contas: ContaFinanceira[] = [
  { id: "ct-itau", nome: "Itaú Conta PJ", banco: "Itaú", agencia: "1234", conta: "56789-0", saldoAtual: 482_350 },
  { id: "ct-bb", nome: "Banco do Brasil PJ", banco: "BB", agencia: "0001", conta: "12345-6", saldoAtual: 187_900 },
  { id: "ct-inter", nome: "Inter Empresa", banco: "Inter", agencia: "0001", conta: "98765-4", saldoAtual: 95_420 },
  { id: "ct-cofre", nome: "Cofre / Caixa Interna", banco: "Caixa Interna", saldoAtual: 12_500 },
];

const statusR: StatusReceber[] = ["Em aberto", "Recebido", "Recebido parcialmente", "Vencido", "Em negociação"];
const statusP: StatusPagar[] = ["Em aberto", "Pago", "Pago parcialmente", "Vencido", "Agendado", "Em aprovação"];
const formas: FormaPagamento[] = ["Pix", "Boleto", "Transferência", "Cartão", "TED/DOC", "Débito automático"];

// --- Contas a Receber ---
export const contasReceber: Lancamento[] = propostas.slice(0, 30).map((p, i) => {
  const venc = i % 3 === 0 ? dAgo(3 + (i % 12)) : dAhead(i * 3);
  const isVencido = new Date(venc).getTime() < now;
  let status: StatusReceber = pick(statusR, i);
  if (i % 5 === 0) status = "Recebido";
  if (i % 7 === 0) status = "Recebido parcialmente";
  if (isVencido && status === "Em aberto") status = "Vencido";
  const valor = 4_500 + (i % 8) * 1_350;
  const natureza = i % 6 === 0 ? "Parcelado" : i % 4 === 0 ? "Recorrente" : "Esporádico";
  return {
    id: `rec-${i + 1}`,
    descricao: `Comissão Banco — Proposta ${p.numero}`,
    tipo: "receber",
    natureza,
    clienteId: p.clienteId,
    propostaId: p.id,
    corretorId: p.corretorId,
    produto: p.produto,
    categoriaId: i % 4 === 0 ? "cat-r-taxa-cliente" : "cat-r-comissao-banco",
    centroCustoId: p.produto === "Home Equity" ? "cc-he" : "cc-fi",
    valor,
    valorPago: status === "Recebido" ? valor : status === "Recebido parcialmente" ? Math.round(valor * 0.5) : undefined,
    emissao: dAgo(20 + i),
    vencimento: venc,
    liquidacao: status === "Recebido" || status === "Recebido parcialmente" ? dAgo(i % 10) : undefined,
    status,
    forma: pick(formas, i),
    contaId: pick(contas, i).id,
    parcelamento: natureza === "Parcelado" ? {
      totalParcelas: 6, parcelaAtual: (i % 6) + 1, valorTotal: valor * 6, valorParcela: valor,
      primeiroVencimento: dAgo(60), frequencia: "Mensal", diaVencimento: 10, grupoId: `grp-rec-${i}`,
    } : undefined,
    criadoPor: "u-corr-1",
    criadoEm: dAgo(20 + i),
  } as Lancamento;
});

// --- Contas a Pagar ---
const despesasFixas = [
  { d: "Folha de Pagamento", c: "cat-d-folha", v: 78_400, cc: "cc-adm" },
  { d: "Aluguel sede", c: "cat-d-aluguel", v: 12_800, cc: "cc-adm" },
  { d: "Plataforma CRM", c: "cat-d-software", v: 3_490, cc: "cc-tec" },
  { d: "Google Ads", c: "cat-d-mkt", v: 9_200, cc: "cc-mkt" },
  { d: "Tarifas bancárias", c: "cat-d-banco", v: 1_350, cc: "cc-adm" },
  { d: "DAS / Impostos", c: "cat-d-imposto", v: 22_100, cc: "cc-adm" },
  { d: "Energia + Internet", c: "cat-d-aluguel", v: 2_800, cc: "cc-adm" },
  { d: "Treinamento equipe", c: "cat-d-folha", v: 4_500, cc: "cc-com" },
];

export const contasPagar: Lancamento[] = Array.from({ length: 28 }, (_, i) => {
  const base = despesasFixas[i % despesasFixas.length];
  const venc = i % 4 === 0 ? dAgo(2 + (i % 8)) : dAhead(i * 2);
  const isVencido = new Date(venc).getTime() < now;
  let status: StatusPagar = pick(statusP, i);
  if (isVencido && status === "Em aberto") status = "Vencido";
  const natureza = ["Folha de Pagamento", "Aluguel sede", "Plataforma CRM", "Energia + Internet", "Google Ads"].some(n => base.d.includes(n))
    ? "Recorrente"
    : i % 5 === 0 ? "Parcelado" : "Esporádico";
  return {
    id: `pag-${i + 1}`,
    descricao: `${base.d} ${i + 1}`,
    tipo: "pagar",
    natureza,
    fornecedor: ["Imobiliária Central", "Construtech S.A.", "Fornecedor X", "Tech Solutions", "Marketing Pro"][i % 5],
    beneficiario: pick(usuarios, i).nome,
    categoriaId: base.c,
    centroCustoId: base.cc,
    valor: base.v + (i % 6) * 150,
    valorPago: status === "Pago" ? base.v : status === "Pago parcialmente" ? Math.round(base.v * 0.4) : undefined,
    emissao: dAgo(15 + i),
    vencimento: venc,
    liquidacao: status === "Pago" || status === "Pago parcialmente" ? dAgo(i % 8) : undefined,
    status,
    forma: pick(formas, i + 1),
    contaId: pick(contas, i).id,
    recorrencia: natureza === "Recorrente" ? {
      frequencia: "Mensal", diaVencimento: 10, dataInicio: dAgo(180),
      indefinido: true, valorFixo: !base.d.includes("Energia") && !base.d.includes("Ads"),
      permitirAlteracao: true, gerarFuturosAuto: true, mesesPreGerar: 12, status: "Ativa",
    } : undefined,
    parcelamento: natureza === "Parcelado" ? {
      totalParcelas: 6, parcelaAtual: (i % 6) + 1, valorTotal: base.v * 6, valorParcela: base.v,
      primeiroVencimento: dAgo(120), frequencia: "Mensal", diaVencimento: 10, grupoId: `grp-pag-${i}`,
    } : undefined,
    criadoPor: "u-corr-1",
    criadoEm: dAgo(15 + i),
  } as Lancamento;
});

// --- Comissões ---
const statusCom: StatusComissao[] = ["Prevista", "Aguardando aprovação", "Liberada", "Pendente", "Bloqueada", "Paga"];
export const comissoes: Comissao[] = propostas.slice(0, 35).map((p, i) => {
  const status = pick(statusCom, i);
  const base = p.valor;
  const pct = p.produto === "Home Equity" ? 0.012 : 0.008;
  return {
    id: `com-${i + 1}`,
    corretorId: p.corretorId ?? "u-cor-1",
    clienteId: p.clienteId,
    propostaId: p.id,
    produto: p.produto,
    bancoId: p.bancoId,
    baseCalculo: base,
    percentual: pct * 100,
    valor: Math.round(base * pct),
    status,
    dataPrevista: dAhead((i % 30) - 10),
    dataLiberacao: status === "Liberada" || status === "Paga" ? dAgo(i % 5) : undefined,
    dataPagamento: status === "Paga" ? dAgo(i % 3) : undefined,
    forma: status === "Paga" ? "Pix" : undefined,
    bloqueada: status === "Bloqueada",
    motivoBloqueio: status === "Bloqueada" ? "Aguardando confirmação do banco" : undefined,
  };
});

// --- Recorrências ---
const freq: Frequencia[] = ["Mensal", "Trimestral", "Anual", "Semanal"];
export const recorrencias: Recorrencia[] = [
  { id: "rc-1", descricao: "Folha de Pagamento", tipo: "pagar", frequencia: "Mensal", diaVencimento: 5, dataInicial: dAgo(180), indefinido: true, valor: 78_400, valorVariavel: true, status: "Ativa", proximaGeracao: dAhead(5), ultimaGeracao: dAgo(25), categoriaId: "cat-d-folha", contaId: "ct-itau" },
  { id: "rc-2", descricao: "Aluguel sede", tipo: "pagar", frequencia: "Mensal", diaVencimento: 10, dataInicial: dAgo(365), indefinido: true, valor: 12_800, valorVariavel: false, status: "Ativa", proximaGeracao: dAhead(10), ultimaGeracao: dAgo(20), categoriaId: "cat-d-aluguel", contaId: "ct-itau" },
  { id: "rc-3", descricao: "CRM SaaS", tipo: "pagar", frequencia: "Mensal", diaVencimento: 15, dataInicial: dAgo(90), indefinido: true, valor: 3_490, valorVariavel: false, status: "Ativa", proximaGeracao: dAhead(15), categoriaId: "cat-d-software", contaId: "ct-bb" },
  { id: "rc-4", descricao: "Mensalidade imobiliária parceira", tipo: "receber", frequencia: "Mensal", diaVencimento: 20, dataInicial: dAgo(60), indefinido: true, valor: 2_500, valorVariavel: false, status: "Ativa", proximaGeracao: dAhead(20), categoriaId: "cat-r-taxa-cliente", contaId: "ct-itau" },
  { id: "rc-5", descricao: "DAS Trimestral", tipo: "pagar", frequencia: "Trimestral", diaVencimento: 20, dataInicial: dAgo(180), indefinido: true, valor: 22_100, valorVariavel: true, status: "Ativa", proximaGeracao: dAhead(45), categoriaId: "cat-d-imposto", contaId: "ct-itau" },
  { id: "rc-6", descricao: "Google Ads", tipo: "pagar", frequencia: "Mensal", diaVencimento: 1, dataInicial: dAgo(120), indefinido: true, valor: 9_200, valorVariavel: true, status: "Pausada", proximaGeracao: dAhead(1), categoriaId: "cat-d-mkt", contaId: "ct-bb" },
];

// --- Conciliação ---
export const itensConciliacao: ItemConciliacao[] = Array.from({ length: 24 }, (_, i) => {
  const conta = pick(contas, i);
  const isReceita = i % 2 === 0;
  const statusList: ItemConciliacao["status"][] = ["Conciliado", "Não conciliado", "Divergente", "Em revisão"];
  const status = pick(statusList, i);
  return {
    id: `conc-${i + 1}`,
    contaId: conta.id,
    data: dAgo(i + 1),
    valor: isReceita ? 4_500 + i * 320 : -(2_200 + i * 180),
    descricao: isReceita ? `Crédito ${conta.banco} ${i + 1}` : `Débito ${conta.banco} ${i + 1}`,
    categoriaId: isReceita ? "cat-r-comissao-banco" : "cat-d-banco",
    status,
    origem: i % 3 === 0 ? "Sistema" : "Extrato",
  };
});

// --- Helpers ---
export const categoriaById = (id: string) => categorias.find((c) => c.id === id);
export const centroCustoById = (id?: string) => centrosCusto.find((c) => c.id === id);
export const contaById = (id: string) => contas.find((c) => c.id === id);
export { propostas, clientes, bancos, usuarios };
