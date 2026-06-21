/**
 * Atualização de Propostas do Corretor — visão em batch para o corretor.
 * O corretor vê suas propostas e pode atualizar etapas, solicitar docs ou enviar mensagens.
 * TODO: integrar com Supabase — tabela `propostas` filtrada por corretorId do usuário logado.
 */
import { useMemo, useState } from "react";
import {
  ArrowRight, Bell, CheckCircle2, ChevronDown, Clock,
  FileText, Loader2, MessageSquare, Search, Send,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { propostas, clientes, bancos } from "@/lib/operacional/mock-data";
import { formatBRL } from "@/lib/operacional/formatters";
import type { EtapaProposta } from "@/lib/operacional/types";
import { ETAPAS_PROPOSTA } from "@/lib/operacional/types";

const ETAPAS = ETAPAS_PROPOSTA;

const etapaCor: Record<string, { bg: string; text: string }> = {
  "Cadastro básico": { bg: "bg-slate-100", text: "text-slate-700" },
  "Simulação": { bg: "bg-blue-100", text: "text-blue-700" },
  "Aprovação": { bg: "bg-indigo-100", text: "text-indigo-700" },
  "Cadastro completo": { bg: "bg-amber-100", text: "text-amber-700" },
  "Documentação completa": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Formulários": { bg: "bg-teal-100", text: "text-teal-700" },
  "Enviado para o banco": { bg: "bg-cyan-100", text: "text-cyan-700" },
  "Vistoria agendada": { bg: "bg-purple-100", text: "text-purple-700" },
  "Análise jurídica": { bg: "bg-orange-100", text: "text-orange-700" },
  "Contrato emitido": { bg: "bg-green-100", text: "text-green-700" },
};

// Simulação: propostas do corretor logado = u-cor-1
const minhasPropostas = propostas.filter((p) => p.corretorId === "u-cor-1").slice(0, 15);

export function AtualizacaoPropostas() {
  const [busca, setBusca] = useState("");
  const [etapaFiltro, setEtapaFiltro] = useState<string>("todas");
  const [atualizando, setAtualizando] = useState<Record<string, boolean>>({});
  const [etapasLocais, setEtapasLocais] = useState<Record<string, EtapaProposta>>({});
  const [mensagensAbertas, setMensagensAbertas] = useState<Set<string>>(new Set());
  const [mensagens, setMensagens] = useState<Record<string, string>>({});

  const dados = useMemo(() => {
    return minhasPropostas.filter((p) => {
      const q = busca.toLowerCase();
      const cliente = clientes.find((c) => c.id === p.clienteId);
      const banco = bancos.find((b) => b.id === p.bancoId);
      const matchBusca = !busca ||
        p.numero.toLowerCase().includes(q) ||
        cliente?.nome?.toLowerCase().includes(q) ||
        banco?.nome?.toLowerCase().includes(q);
      const etapaAtual = etapasLocais[p.id] ?? p.etapa;
      const matchEtapa = etapaFiltro === "todas" || etapaAtual === etapaFiltro;
      return matchBusca && matchEtapa;
    });
  }, [busca, etapaFiltro, etapasLocais]);

  function simularAtualizacao(propId: string, novaEtapa: EtapaProposta) {
    setAtualizando((p) => ({ ...p, [propId]: true }));
    // TODO: chamar API / Supabase para atualizar etapa
    setTimeout(() => {
      setEtapasLocais((p) => ({ ...p, [propId]: novaEtapa }));
      setAtualizando((p) => ({ ...p, [propId]: false }));
    }, 900);
  }

  function toggleMensagem(propId: string) {
    setMensagensAbertas((prev) => {
      const n = new Set(prev);
      n.has(propId) ? n.delete(propId) : n.add(propId);
      return n;
    });
  }

  const totalPendencia = dados.filter((p) => (etapasLocais[p.id] ?? p.etapa) === "Documentação completa").length;
  const totalAprovada = dados.filter((p) => (etapasLocais[p.id] ?? p.etapa) === "Aprovação").length;
  const totalAtivas = dados.filter((p) => !(["Contrato emitido"] as EtapaProposta[]).includes(etapasLocais[p.id] ?? p.etapa)).length;

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="OPERACIONAL · CORRETOR"
        title="Atualização de Propostas"
        subtitle="Acompanhe o status de suas propostas, atualize etapas e comunique-se com o analista responsável."
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Propostas ativas", value: totalAtivas, accent: "#001bbf" },
          { label: "Pendências", value: totalPendencia, accent: "#ff8a00" },
          { label: "Aprovadas", value: totalAprovada, accent: "#00b35a" },
        ].map((k) => (
          <div key={k.label} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="h-1" style={{ backgroundColor: k.accent }} />
            <div className="p-4">
              <p className="text-2xl font-bold text-graphite">{k.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por número, cliente ou banco..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={etapaFiltro}
          onChange={(e) => setEtapaFiltro(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold text-graphite"
        >
          <option value="todas">Todas as etapas</option>
          {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <p className="ml-auto text-[11px] font-semibold text-muted-foreground">
          {dados.length} proposta{dados.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Lista de propostas */}
      <div className="space-y-3">
        {dados.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma proposta encontrada.</p>
          </div>
        )}

        {dados.map((prop) => {
          const cliente = clientes.find((c) => c.id === prop.clienteId);
          const banco = bancos.find((b) => b.id === prop.bancoId);
          const etapaAtual = etapasLocais[prop.id] ?? prop.etapa;
          const corEtapa = etapaCor[etapaAtual ?? "Solicitado"];
          const isAtualizando = atualizando[prop.id] ?? false;
          const msgAberta = mensagensAbertas.has(prop.id);

          return (
            <div key={prop.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand">{prop.numero}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${corEtapa.bg} ${corEtapa.text}`}>
                      {etapaAtual}
                    </span>
                    {isAtualizando && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-graphite">
                    {cliente?.nome ?? "Cliente não encontrado"}
                    {banco && <span className="ml-2 text-xs font-normal text-muted-foreground">— {banco.nome}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{prop.produto}</p>
                  {prop.valor && <p className="text-sm font-bold text-graphite">{formatBRL(prop.valor)}</p>}
                </div>
              </div>

              {/* Controles */}
              <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                {/* Atualizar etapa */}
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mover para:
                  </label>
                  <div className="relative">
                    <select
                      disabled={isAtualizando}
                      value={etapaAtual ?? ""}
                      onChange={(e) => simularAtualizacao(prop.id, e.target.value as EtapaProposta)}
                      className="h-8 rounded-md border border-input bg-background pr-7 pl-3 text-xs font-semibold text-graphite outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                      {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <button
                    disabled={isAtualizando}
                    onClick={() => simularAtualizacao(prop.id, etapaAtual ?? "Em análise")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-[10px] font-semibold text-graphite hover:border-brand/40 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Confirmar
                  </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Solicitar documentos */}
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-[10px] font-semibold text-graphite hover:border-brand/40">
                    <FileText className="h-3 w-3" />
                    Solicitar docs
                  </button>
                  {/* Notificar cliente */}
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-[10px] font-semibold text-graphite hover:border-brand/40">
                    <Bell className="h-3 w-3" />
                    Notificar cliente
                  </button>
                  {/* Mensagem */}
                  <button
                    onClick={() => toggleMensagem(prop.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                      msgAberta ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background text-graphite hover:border-brand/40"
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Mensagem ao analista
                  </button>
                </div>
              </div>

              {/* Área de mensagem */}
              {msgAberta && (
                <div className="border-t border-border px-5 py-3">
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      placeholder="Digite sua mensagem ao analista responsável..."
                      value={mensagens[prop.id] ?? ""}
                      onChange={(e) => setMensagens((p) => ({ ...p, [prop.id]: e.target.value }))}
                      className="flex-1 rounded-md border border-input bg-background p-2 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 resize-none"
                    />
                    <button
                      onClick={() => {
                        // TODO: chamar API de mensagens
                        setMensagens((p) => ({ ...p, [prop.id]: "" }));
                        toggleMensagem(prop.id);
                      }}
                      disabled={!mensagens[prop.id]?.trim()}
                      className="self-end rounded-md bg-brand px-3 py-2 text-[10px] font-bold text-brand-foreground hover:bg-brand/90 disabled:bg-muted disabled:text-muted-foreground"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
