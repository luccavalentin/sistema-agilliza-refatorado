// Repositórios: encapsulam mutações com efeitos cruzados entre módulos.
// Aprovar uma proposta → gera comissão, lançamento a receber e notificação.

import { useDB, newId, isoNow, findCliente, findBanco } from "./store";
import { daysAhead } from "./anchor";
import type { EtapaProposta, Proposta, StatusProposta } from "@/lib/operacional/types";
import type { Comissao, Lancamento } from "@/lib/financeiro/types";
import type { Notificacao } from "./store";

// ---------- Notificações ----------
export function pushNotificacao(n: Omit<Notificacao, "id" | "criadoEm" | "lida">) {
  const novo: Notificacao = {
    ...n,
    id: newId("not"),
    criadoEm: isoNow(),
    lida: false,
  };
  useDB.setState((s) => ({ notificacoes: [novo, ...s.notificacoes] }));
}

export function marcarNotificacaoLida(id: string) {
  useDB.setState((s) => ({
    notificacoes: s.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n)),
  }));
}
export function marcarTodasLidas() {
  useDB.setState((s) => ({ notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })) }));
}
export function removerNotificacao(id: string) {
  useDB.setState((s) => ({ notificacoes: s.notificacoes.filter((n) => n.id !== id) }));
}
export function limparNotificacoes() {
  useDB.setState({ notificacoes: [] });
}

// ---------- Propostas ----------
export function moverProposta(id: string, etapa: EtapaProposta, usuarioId = "u-corr-1") {
  const state = useDB.getState();
  const p = state.propostas.find((x) => x.id === id);
  if (!p) return;
  useDB.setState({
    propostas: state.propostas.map((x) =>
      x.id === id
        ? {
            ...x,
            etapa,
            atualizadaEm: isoNow(),
            historico: [
              ...x.historico,
              { id: newId("ph"), data: isoNow(), usuarioId, acao: `Movida para ${etapa}` },
            ],
          }
        : x,
    ),
  });
  pushNotificacao({
    categoria: "proposta",
    nivel: "info",
    titulo: `Proposta ${p.numero} avançou`,
    descricao: `Nova etapa: ${etapa}`,
  });
}

export function aprovarProposta(id: string, usuarioId = "u-corr-1") {
  const state = useDB.getState();
  const p = state.propostas.find((x) => x.id === id);
  if (!p) return;

  const status: StatusProposta = "Aprovada";
  const pct = p.produto === "Home Equity" ? 0.012 : 0.008;
  const valorComissao = Math.round(p.valor * pct);

  // 1. atualiza proposta
  const propostas = state.propostas.map((x) =>
    x.id === id
      ? {
          ...x,
          status,
          etapa: "Contrato emitido" as EtapaProposta,
          atualizadaEm: isoNow(),
          historico: [
            ...x.historico,
            { id: newId("ph"), data: isoNow(), usuarioId, acao: "Proposta aprovada pelo banco" },
          ],
        }
      : x,
  );

  // 2. cria comissão prevista
  const novaComissao: Comissao = {
    id: newId("com"),
    corretorId: p.corretorId ?? usuarioId,
    clienteId: p.clienteId,
    propostaId: p.id,
    produto: p.produto,
    bancoId: p.bancoId,
    baseCalculo: p.valor,
    percentual: pct * 100,
    valor: valorComissao,
    status: "Prevista",
    dataPrevista: daysAhead(15),
    bloqueada: false,
  };

  // 3. cria lançamento a receber
  const novoLancamento: Lancamento = {
    id: newId("rec"),
    descricao: `Comissão Banco — Proposta ${p.numero}`,
    tipo: "receber",
    natureza: "Esporádico",
    clienteId: p.clienteId,
    propostaId: p.id,
    corretorId: p.corretorId,
    produto: p.produto,
    categoriaId: "cat-r-comissao-banco",
    centroCustoId: p.produto === "Home Equity" ? "cc-he" : "cc-fi",
    valor: valorComissao,
    emissao: isoNow(),
    vencimento: daysAhead(15),
    status: "Em aberto",
    forma: "Pix",
    contaId: "ct-itau",
    criadoPor: usuarioId,
    criadoEm: isoNow(),
  };

  useDB.setState({
    propostas,
    comissoes: [novaComissao, ...state.comissoes],
    lancamentos: [novoLancamento, ...state.lancamentos],
  });

  const cli = findCliente(p.clienteId);
  const banco = findBanco(p.bancoId);
  pushNotificacao({
    categoria: "proposta",
    nivel: "success",
    titulo: `Proposta ${p.numero} aprovada`,
    descricao: `${cli?.nome ?? "Cliente"} — ${banco?.nome ?? ""}. Comissão prevista R$ ${valorComissao.toLocaleString("pt-BR")}.`,
  });
}

export function reprovarProposta(id: string, motivo = "Reprovada pelo banco", usuarioId = "u-corr-1") {
  const state = useDB.getState();
  const p = state.propostas.find((x) => x.id === id);
  if (!p) return;
  useDB.setState({
    propostas: state.propostas.map((x) =>
      x.id === id
        ? {
            ...x,
            status: "Reprovada" as StatusProposta,
            atualizadaEm: isoNow(),
            historico: [
              ...x.historico,
              { id: newId("ph"), data: isoNow(), usuarioId, acao: motivo },
            ],
          }
        : x,
    ),
  });
  pushNotificacao({
    categoria: "proposta",
    nivel: "warning",
    titulo: `Proposta ${p.numero} reprovada`,
    descricao: motivo,
  });
}

// ---------- Lançamentos ----------
export function marcarLancamentoPago(id: string) {
  useDB.setState((s) => ({
    lancamentos: s.lancamentos.map((l) =>
      l.id === id
        ? {
            ...l,
            status: l.tipo === "pagar" ? ("Pago" as const) : ("Recebido" as const),
            valorPago: l.valor,
            liquidacao: isoNow(),
          }
        : l,
    ),
  }));
}

export function adicionarLancamento(l: Omit<Lancamento, "id" | "criadoEm" | "criadoPor">, usuarioId = "u-corr-1") {
  const novo: Lancamento = {
    ...l,
    id: newId(l.tipo === "receber" ? "rec" : "pag"),
    criadoEm: isoNow(),
    criadoPor: usuarioId,
  };
  useDB.setState((s) => ({ lancamentos: [novo, ...s.lancamentos] }));
  return novo;
}

// ---------- Comissões ----------
export function marcarComissaoPaga(id: string) {
  useDB.setState((s) => ({
    comissoes: s.comissoes.map((c) =>
      c.id === id ? { ...c, status: "Paga", dataPagamento: isoNow(), forma: "Pix" } : c,
    ),
  }));
}

// ---------- Reset utilities ----------
export function resetDemo() {
  useDB.getState().reset();
  try {
    localStorage.removeItem("gestcred.db.v1");
  } catch {}
  useDB.getState().reset();
}

export function limparTudo() {
  useDB.getState().clear();
}
