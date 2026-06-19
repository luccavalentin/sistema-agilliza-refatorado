// Propostas — Kanban com 10 etapas (Cadastro básico → Contrato emitido).
// Suporta drag-and-drop nativo, filtros, busca, drawer de detalhes com
// checklist, chat interno e timeline de documentos.

import { useMemo, useState, type DragEvent } from "react";
import {
  AlertTriangle, ArrowLeftRight, CheckCircle2, Clock,
  FileText, MessageSquare, Paperclip, Search, X,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bancoById, clienteById, propostas as propostasMock,
  usuarioById, usuarios,
} from "@/lib/operacional/mock-data";
import { formatBRL, formatData } from "@/lib/operacional/formatters";
import { ETAPAS_PROPOSTA, type EtapaProposta, type Prioridade, type Proposta } from "@/lib/operacional/types";
import { PopoutChat } from "@/components/operacional/popout-chat";

const prioridadeStyle: Record<Prioridade, string> = {
  "Baixa": "bg-slate-100 text-slate-700",
  "Média": "bg-blue-100 text-blue-700",
  "Alta": "bg-amber-100 text-amber-800",
  "Urgente": "bg-orange-100 text-orange-800",
  "Crítica": "bg-red-100 text-red-700",
};

function diasParaSLA(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function slaBadge(iso: string) {
  const d = diasParaSLA(iso);
  if (d < 0) return { label: `${Math.abs(d)}d vencido`, cls: "bg-red-100 text-red-700" };
  if (d <= 2) return { label: `${d}d restantes`, cls: "bg-amber-100 text-amber-800" };
  return { label: `${d}d restantes`, cls: "bg-emerald-100 text-emerald-700" };
}

type Escopo = "correspondente" | "corretor";

export function PropostasKanban({
  escopo,
  usuarioAtualId = "u-cor-1",
}: {
  escopo: Escopo;
  usuarioAtualId?: string;
}) {
  const [data, setData] = useState<Proposta[]>(propostasMock);
  const [busca, setBusca] = useState("");
  const [filtroBanco, setFiltroBanco] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const restritoCorretor = escopo === "corretor";

  const filtradas = useMemo(() => {
    return data.filter((p) => {
      if (restritoCorretor && p.corretorId !== usuarioAtualId && p.responsavelId !== usuarioAtualId)
        return false;
      if (filtroBanco && p.bancoId !== filtroBanco) return false;
      if (filtroPrioridade && p.prioridade !== filtroPrioridade) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const cli = clienteById(p.clienteId);
        if (!(
          p.numero.toLowerCase().includes(q) ||
          cli?.nome.toLowerCase().includes(q) ||
          cli?.cpf?.includes(q)
        )) return false;
      }
      return true;
    });
  }, [data, busca, filtroBanco, filtroPrioridade, restritoCorretor, usuarioAtualId]);

  const colunas = useMemo(() => {
    const map = new Map<EtapaProposta, Proposta[]>();
    ETAPAS_PROPOSTA.forEach((e) => map.set(e, []));
    filtradas.forEach((p) => map.get(p.etapa)?.push(p));
    return map;
  }, [filtradas]);

  function moverPara(etapa: EtapaProposta) {
    if (!dragId) return;
    setData((prev) => prev.map((p) => (p.id === dragId ? { ...p, etapa, atualizadaEm: new Date().toISOString() } : p)));
    setDragId(null);
  }

  const detalhe = detalheId ? data.find((p) => p.id === detalheId) ?? null : null;
  const bancosUnicos = useMemo(() => {
    const ids = Array.from(new Set(data.map((p) => p.bancoId)));
    return ids.map((id) => bancoById(id)!).filter(Boolean);
  }, [data]);

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`OPERACIONAL · ${escopo === "correspondente" ? "CORRESPONDENTE" : "CORRETOR"}`}
        title="Propostas — Kanban Operacional"
        subtitle="Acompanhe propostas pelas 10 etapas do funil. Arraste cartões entre colunas para atualizar a etapa."
        right={
          <Badge variant="secondary" className="text-xs">
            {filtradas.length} de {data.length} propostas
          </Badge>
        }
      />

      <section className="rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente ou CPF…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filtroBanco}
            onChange={(e) => setFiltroBanco(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="">Todos os bancos</option>
            {bancosUnicos.map((b) => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="">Todas as prioridades</option>
            {(["Crítica", "Urgente", "Alta", "Média", "Baixa"] as Prioridade[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(busca || filtroBanco || filtroPrioridade) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setBusca(""); setFiltroBanco(""); setFiltroPrioridade(""); }}
            >
              Limpar
            </Button>
          )}
        </div>
      </section>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-3">
          {ETAPAS_PROPOSTA.map((etapa) => {
            const itens = colunas.get(etapa) ?? [];
            const valorTotal = itens.reduce((s, p) => s + p.valor, 0);
            return (
              <div
                key={etapa}
                onDragOver={(e: DragEvent) => e.preventDefault()}
                onDrop={() => moverPara(etapa)}
                className="flex w-[280px] flex-col rounded-lg border border-border bg-muted/30"
              >
                <div className="border-b border-border bg-background/60 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-graphite">
                      {etapa}
                    </h3>
                    <Badge variant="secondary" className="h-5 text-[10px]">
                      {itens.length}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatBRL(valorTotal)}
                  </p>
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {itens.length === 0 && (
                    <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
                      Solte cartões aqui
                    </p>
                  )}
                  {itens.map((p) => {
                    const cli = clienteById(p.clienteId);
                    const banco = bancoById(p.bancoId);
                    const sla = slaBadge(p.slaPrazo);
                    const responsavel = usuarioById(p.responsavelId);
                    return (
                      <article
                        key={p.id}
                        draggable
                        onDragStart={() => setDragId(p.id)}
                        onClick={() => setDetalheId(p.id)}
                        className="cursor-grab rounded-md border border-border bg-card p-2.5 shadow-sm transition hover:border-brand/40 hover:shadow active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-graphite">
                              {cli?.nome ?? "—"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{p.numero}</p>
                          </div>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${prioridadeStyle[p.prioridade]}`}>
                            {p.prioridade}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="font-medium text-graphite">{formatBRL(p.valor)}</span>
                          <span className="text-muted-foreground">{banco?.sigla}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${sla.cls}`}>
                            <Clock className="h-2.5 w-2.5" /> {sla.label}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {p.pendencias > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-amber-700">
                                <AlertTriangle className="h-3 w-3" /> {p.pendencias}
                              </span>
                            )}
                            {p.mensagensNaoLidas > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-brand">
                                <MessageSquare className="h-3 w-3" /> {p.mensagensNaoLidas}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-0.5">
                              <Paperclip className="h-3 w-3" /> {p.documentos}
                            </span>
                          </div>
                        </div>
                        {responsavel && (
                          <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
                            Resp.: {responsavel.nome}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detalhe && (
        <PropostaDetalhe
          proposta={detalhe}
          onClose={() => setDetalheId(null)}
          onMover={(etapa) => {
            setData((prev) => prev.map((p) => (p.id === detalhe.id ? { ...p, etapa } : p)));
          }}
        />
      )}
    </div>
  );
}

function PropostaDetalhe({
  proposta,
  onClose,
  onMover,
}: {
  proposta: Proposta;
  onClose: () => void;
  onMover: (e: EtapaProposta) => void;
}) {
  const cli = clienteById(proposta.clienteId);
  const banco = bancoById(proposta.bancoId);
  const responsavel = usuarioById(proposta.responsavelId);
  const corretor = usuarioById(proposta.corretorId);
  const sla = slaBadge(proposta.slaPrazo);
  const [aba, setAba] = useState<"checklist" | "chat" | "documentos" | "historico">("checklist");

  const checklist = [
    { label: "Cadastro básico do cliente", done: true },
    { label: "Simulação vinculada", done: !!proposta.simulacaoId },
    { label: "Aprovação inicial", done: proposta.status === "Aprovada" || proposta.etapa !== "Aprovação" },
    { label: "Cadastro completo (renda, conjuge, imóvel)", done: ["Cadastro completo","Documentação completa","Formulários","Enviado para o banco","Vistoria agendada","Análise jurídica","Contrato emitido"].includes(proposta.etapa) },
    { label: "Documentação completa", done: proposta.pendencias === 0 },
    { label: "Formulários assinados", done: ["Formulários","Enviado para o banco","Vistoria agendada","Análise jurídica","Contrato emitido"].includes(proposta.etapa) },
    { label: "Enviado para o banco", done: ["Enviado para o banco","Vistoria agendada","Análise jurídica","Contrato emitido"].includes(proposta.etapa) },
    { label: "Vistoria agendada", done: ["Vistoria agendada","Análise jurídica","Contrato emitido"].includes(proposta.etapa) },
    { label: "Análise jurídica", done: ["Análise jurídica","Contrato emitido"].includes(proposta.etapa) },
    { label: "Contrato emitido", done: proposta.etapa === "Contrato emitido" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[640px] flex-col overflow-hidden bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Proposta · {proposta.numero}
              </p>
              <h2 className="mt-1 text-xl font-bold text-graphite">{cli?.nome}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {proposta.produto} · {banco?.nome} · {formatBRL(proposta.valor)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{proposta.etapa}</Badge>
            <Badge variant="outline">{proposta.status}</Badge>
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${prioridadeStyle[proposta.prioridade]}`}>
              {proposta.prioridade}
            </span>
            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${sla.cls}`}>
              <Clock className="h-3 w-3" /> {sla.label}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <p className="text-muted-foreground">Responsável</p>
              <p className="font-medium text-graphite">{responsavel?.nome ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Corretor</p>
              <p className="font-medium text-graphite">{corretor?.nome ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Criada em</p>
              <p className="font-medium text-graphite">{formatData(proposta.criadaEm)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">SLA</p>
              <p className="font-medium text-graphite">{formatData(proposta.slaPrazo)}</p>
            </div>
          </div>
        </header>

        <nav className="flex gap-1 border-b border-border px-3 pt-2">
          {[
            { id: "checklist", label: "Checklist", icon: CheckCircle2 },
            { id: "chat", label: "Chat interno", icon: MessageSquare },
            { id: "documentos", label: "Documentos", icon: FileText },
            { id: "historico", label: "Histórico", icon: ArrowLeftRight },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id as typeof aba)}
              className={`inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-medium transition ${
                aba === t.id ? "bg-card text-graphite border border-b-0 border-border" : "text-muted-foreground hover:text-graphite"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-5">
          {aba === "checklist" && (
            <ul className="space-y-2">
              {checklist.map((c, i) => (
                <li key={i} className="flex items-start gap-2 rounded-md border border-border bg-card p-2.5">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 ${c.done ? "text-emerald-600" : "text-muted-foreground/40"}`}
                  />
                  <span className={`text-xs ${c.done ? "text-graphite" : "text-muted-foreground"}`}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {aba === "chat" && (
            <PopoutChat
              titulo={`Chat interno — ${proposta.codigo ?? proposta.id}`}
              storageKey={`proposta-${proposta.id}`}
              mensagens={[
                { autor: usuarios[0].nome, texto: "Documentação do imóvel pendente — solicitar matrícula atualizada.", quando: "há 2h" },
                { autor: usuarios[2].nome, texto: "Cliente confirmou envio do comprovante de renda hoje.", quando: "há 1h" },
                { autor: usuarios[5].nome, texto: "Análise jurídica iniciada. Retorno previsto em 3 dias úteis.", quando: "há 25min" },
              ]}
            />
          )}
          {aba === "documentos" && (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {[
                "RG e CPF do titular", "Comprovante de renda", "Comprovante de residência",
                "Matrícula do imóvel", "IPTU", "Declaração de IR",
                "Certidão de casamento", "Extrato bancário (3 meses)",
              ].slice(0, proposta.documentos).map((d, i) => (
                <li key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{d}</span>
                  </div>
                  <Badge variant={i < proposta.documentos - proposta.pendencias ? "secondary" : "outline"}>
                    {i < proposta.documentos - proposta.pendencias ? "Recebido" : "Pendente"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {aba === "historico" && (
            <ol className="space-y-3">
              {proposta.historico.map((h) => (
                <li key={h.id} className="rounded-md border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-graphite">{h.acao}</p>
                    <span className="text-[10px] text-muted-foreground">{formatData(h.data)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    por {usuarioById(h.usuarioId)?.nome}
                  </p>
                </li>
              ))}
              {proposta.transferencias.map((t) => (
                <li key={t.id} className="rounded-md border border-border bg-card p-3">
                  <p className="text-xs font-semibold text-graphite">Transferência</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {usuarioById(t.origemUsuarioId)?.nome} → {usuarioById(t.destinoUsuarioId)?.nome}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Motivo: {t.motivo}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <footer className="border-t border-border bg-muted/30 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mover para etapa
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ETAPAS_PROPOSTA.map((e) => (
              <button
                key={e}
                onClick={() => onMover(e)}
                disabled={e === proposta.etapa}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                  e === proposta.etapa
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card hover:border-brand/40"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </footer>
      </aside>
    </div>
  );
}
