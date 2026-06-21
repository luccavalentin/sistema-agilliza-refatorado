// Demandas & SLA — Kanban estilo Monday, com colunas por status,
// indicadores de SLA, prioridade, chat e drawer de detalhes.

import { useMemo, useState, type DragEvent } from "react";
import {
  AlertTriangle, Clock, MessageSquare, Plus, Search, User, X,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clienteById, demandas as demandasMock, usuarioById, usuarios,
} from "@/lib/operacional/mock-data";
import { formatData, formatDataHora } from "@/lib/operacional/formatters";
import type { Demanda, Prioridade, StatusDemanda } from "@/lib/operacional/types";
import { PopoutChat } from "@/components/operacional/popout-chat";
import { useGlobalSearch } from "@/components/portal/global-search";

const COLUNAS: StatusDemanda[] = [
  "Nova", "Aguardando aceite", "Em andamento",
  "Aguardando retorno", "Em revisão", "Concluída", "Reaberta",
];

const prioridadeStyle: Record<Prioridade, string> = {
  "Baixa": "bg-slate-100 text-slate-700",
  "Média": "bg-blue-100 text-blue-700",
  "Alta": "bg-amber-100 text-amber-800",
  "Urgente": "bg-orange-100 text-orange-800",
  "Crítica": "bg-red-100 text-red-700",
};

function diasParaSLA(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}
function slaBadge(iso: string) {
  const d = diasParaSLA(iso);
  if (d < 0) return { label: `${Math.abs(d)}d vencido`, cls: "bg-red-100 text-red-700" };
  if (d <= 2) return { label: `${d}d restantes`, cls: "bg-amber-100 text-amber-800" };
  return { label: `${d}d restantes`, cls: "bg-emerald-100 text-emerald-700" };
}

export function DemandasSLA({
  escopo,
  usuarioAtualId = "u-cor-1",
}: {
  escopo: "correspondente" | "corretor";
  usuarioAtualId?: string;
}) {
  const [data, setData] = useState<Demanda[]>(demandasMock);
  const [busca, setBusca] = useState("");
  const globalQ = useGlobalSearch();
  const [filtroPrior, setFiltroPrior] = useState<string>("");
  const [filtroResp, setFiltroResp] = useState<string>("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const restritoCorretor = escopo === "corretor";

  const filtradas = useMemo(() => {
    const q = (busca || globalQ).toLowerCase();
    return data.filter((d) => {
      if (restritoCorretor && d.responsavelId !== usuarioAtualId
        && d.criadoPorId !== usuarioAtualId
        && !d.participantesIds.includes(usuarioAtualId)) return false;
      if (filtroPrior && d.prioridade !== filtroPrior) return false;
      if (filtroResp && d.responsavelId !== filtroResp) return false;
      if (q) {
        if (!(d.titulo.toLowerCase().includes(q) ||
              d.tipo.toLowerCase().includes(q) ||
              clienteById(d.clienteId)?.nome.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [data, busca, globalQ, filtroPrior, filtroResp, restritoCorretor, usuarioAtualId]);

  const colunas = useMemo(() => {
    const map = new Map<StatusDemanda, Demanda[]>();
    COLUNAS.forEach((c) => map.set(c, []));
    filtradas.forEach((d) => map.get(d.status)?.push(d));
    return map;
  }, [filtradas]);

  function moverPara(status: StatusDemanda) {
    if (!dragId) return;
    setData((p) => p.map((d) => (d.id === dragId ? { ...d, status } : d)));
    setDragId(null);
  }

  // métricas
  const vencidas = filtradas.filter((d) => diasParaSLA(d.slaPrazo) < 0 && d.status !== "Concluída").length;
  const noPrazo = filtradas.filter((d) => diasParaSLA(d.slaPrazo) >= 0 && d.status !== "Concluída").length;
  const concluidas = filtradas.filter((d) => d.status === "Concluída").length;

  const detalhe = detalheId ? data.find((d) => d.id === detalheId) ?? null : null;

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`OPERACIONAL · ${escopo === "correspondente" ? "CORRESPONDENTE" : "CORRETOR"}`}
        title="Demandas & SLA"
        subtitle="Quadro estilo Monday para gestão de demandas com SLA em tempo real, prioridade e chat."
        right={
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Nova demanda
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total" value={filtradas.length} />
        <MetricCard label="No prazo" value={noPrazo} tone="emerald" />
        <MetricCard label="Vencidas" value={vencidas} tone="red" />
        <MetricCard label="Concluídas" value={concluidas} tone="blue" />
      </div>

      <section className="rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, tipo ou cliente…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filtroPrior}
            onChange={(e) => setFiltroPrior(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="">Todas as prioridades</option>
            {(["Crítica","Urgente","Alta","Média","Baixa"] as Prioridade[]).map((p) =>
              <option key={p} value={p}>{p}</option>)}
          </select>
          {!restritoCorretor && (
            <select
              value={filtroResp}
              onChange={(e) => setFiltroResp(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="">Todos os responsáveis</option>
              {usuarios.filter((u) => u.papel !== "cliente").map((u) =>
                <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          )}
        </div>
      </section>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-3">
          {COLUNAS.map((status) => {
            const itens = colunas.get(status) ?? [];
            return (
              <div
                key={status}
                onDragOver={(e: DragEvent) => e.preventDefault()}
                onDrop={() => moverPara(status)}
                className="flex w-[280px] flex-col rounded-lg border border-border bg-muted/30"
              >
                <div className="border-b border-border bg-background/60 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-graphite">
                      {status}
                    </h3>
                    <Badge variant="secondary" className="h-5 text-[10px]">{itens.length}</Badge>
                  </div>
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {itens.length === 0 && (
                    <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
                      Solte aqui
                    </p>
                  )}
                  {itens.map((d) => {
                    const cli = clienteById(d.clienteId);
                    const resp = usuarioById(d.responsavelId);
                    const sla = slaBadge(d.slaPrazo);
                    return (
                      <article
                        key={d.id}
                        draggable
                        onDragStart={() => setDragId(d.id)}
                        onClick={() => setDetalheId(d.id)}
                        className="cursor-grab rounded-md border border-border bg-card p-2.5 shadow-sm transition hover:border-brand/40 hover:shadow active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-xs font-semibold text-graphite">{d.titulo}</p>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${prioridadeStyle[d.prioridade]}`}>
                            {d.prioridade}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">{d.tipo}</p>
                        {cli && <p className="mt-0.5 text-[10px] text-muted-foreground">{cli.nome}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${sla.cls}`}>
                            <Clock className="h-2.5 w-2.5" /> {sla.label}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            {d.mensagensNaoLidas > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-brand">
                                <MessageSquare className="h-3 w-3" /> {d.mensagensNaoLidas}
                              </span>
                            )}
                            {resp && (
                              <span className="inline-flex items-center gap-0.5">
                                <User className="h-3 w-3" /> {resp.nome.split(" ")[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detalhe && <DemandaDetalhe demanda={detalhe} onClose={() => setDetalheId(null)} />}
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone?: "emerald"|"red"|"blue" }) {
  const cls =
    tone === "emerald" ? "text-emerald-700" :
    tone === "red" ? "text-red-700" :
    tone === "blue" ? "text-brand" : "text-graphite";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${cls}`}>{value}</p>
    </div>
  );
}

function DemandaDetalhe({ demanda, onClose }: { demanda: Demanda; onClose: () => void }) {
  const cli = clienteById(demanda.clienteId);
  const resp = usuarioById(demanda.responsavelId);
  const criador = usuarioById(demanda.criadoPorId);
  const sla = slaBadge(demanda.slaPrazo);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Demanda · {demanda.id}
              </p>
              <h2 className="mt-1 text-lg font-bold text-graphite">{demanda.titulo}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{demanda.descricao}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{demanda.status}</Badge>
            <Badge variant="outline">{demanda.tipo}</Badge>
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${prioridadeStyle[demanda.prioridade]}`}>
              {demanda.prioridade}
            </span>
            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${sla.cls}`}>
              <Clock className="h-3 w-3" /> {sla.label}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
            <Info label="Responsável" value={resp?.nome ?? "—"} />
            <Info label="Criado por" value={criador?.nome ?? "—"} />
            <Info label="Cliente" value={cli?.nome ?? "—"} />
            <Info label="SLA" value={formatData(demanda.slaPrazo)} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <PopoutChat
            titulo={`Demanda — ${demanda.titulo}`}
            storageKey={`demanda-${demanda.id}`}
            mensagens={[
              criador && { autor: criador.nome, texto: demanda.descricao, quando: formatDataHora(demanda.criadaEm) },
              resp && { autor: resp.nome, texto: "Aceito e em andamento. Vou retornar até amanhã.", quando: "há 1h" },
              criador && { autor: criador.nome, texto: "Combinado, obrigado!", quando: "há 30min" },
            ].filter(Boolean) as { autor: string; texto: string; quando: string }[]}
          />
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-graphite">{value}</p>
    </div>
  );
}
