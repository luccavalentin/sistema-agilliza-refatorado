// Minhas Tarefas — lista pessoal com filtros por status e prioridade,
// agrupamento por prazo (hoje, atrasadas, próximas), check rápido.

import { useMemo, useState } from "react";
import { CheckSquare, Clock, Plus, Square } from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clienteById, propostas, tarefas as tarefasMock, usuarioById,
} from "@/lib/operacional/mock-data";
import { formatData } from "@/lib/operacional/formatters";
import type { Prioridade, StatusTarefa, Tarefa } from "@/lib/operacional/types";
import { useGlobalSearch } from "@/components/portal/global-search";

const prioridadeStyle: Record<Prioridade, string> = {
  "Baixa": "bg-slate-100 text-slate-700",
  "Média": "bg-blue-100 text-blue-700",
  "Alta": "bg-amber-100 text-amber-800",
  "Urgente": "bg-orange-100 text-orange-800",
  "Crítica": "bg-red-100 text-red-700",
};

function dias(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (d < 0) return { grupo: "Atrasadas", label: `${Math.abs(d)}d atrasada`, tone: "text-red-700" };
  if (d === 0) return { grupo: "Hoje", label: "Hoje", tone: "text-amber-700" };
  if (d <= 7) return { grupo: "Esta semana", label: `Em ${d}d`, tone: "text-emerald-700" };
  return { grupo: "Próximas", label: formatData(iso), tone: "text-muted-foreground" };
}

const ORDEM_GRUPOS = ["Atrasadas", "Hoje", "Esta semana", "Próximas"];

export function MinhasTarefas({
  escopo,
  usuarioAtualId = "u-cor-1",
}: {
  escopo: "correspondente" | "corretor";
  usuarioAtualId?: string;
}) {
  const [data, setData] = useState<Tarefa[]>(tarefasMock);
  const [busca, setBusca] = useState("");
  const globalQ = useGlobalSearch();
  const [filtroStatus, setFiltroStatus] = useState<string>("ativas");
  const [filtroPrior, setFiltroPrior] = useState<string>("");

  // Quando for correspondente, mostra todas. Corretor vê só as suas.
  const minhas = useMemo(() => {
    const q = (busca || globalQ).toLowerCase();
    const base = escopo === "corretor"
      ? data.filter((t) => t.usuarioId === usuarioAtualId)
      : data;
    return base.filter((t) => {
      if (filtroStatus === "ativas" && t.status === "Concluída") return false;
      if (filtroStatus === "concluidas" && t.status !== "Concluída") return false;
      if (filtroPrior && t.prioridade !== filtroPrior) return false;
      if (q && !t.titulo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, busca, globalQ, filtroStatus, filtroPrior, escopo, usuarioAtualId]);

  const agrupadas = useMemo(() => {
    const map = new Map<string, Tarefa[]>();
    ORDEM_GRUPOS.forEach((g) => map.set(g, []));
    minhas.forEach((t) => {
      const { grupo } = dias(t.prazo);
      map.get(grupo)?.push(t);
    });
    return map;
  }, [minhas]);

  function toggleConcluida(id: string) {
    setData((prev) => prev.map((t) =>
      t.id === id ? { ...t, status: t.status === "Concluída" ? "A fazer" : "Concluída" } : t
    ));
  }

  function mudarStatus(id: string, status: StatusTarefa) {
    setData((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  const totais = {
    atrasadas: minhas.filter((t) => dias(t.prazo).grupo === "Atrasadas" && t.status !== "Concluída").length,
    hoje: minhas.filter((t) => dias(t.prazo).grupo === "Hoje" && t.status !== "Concluída").length,
    semana: minhas.filter((t) => dias(t.prazo).grupo === "Esta semana" && t.status !== "Concluída").length,
    concluidas: minhas.filter((t) => t.status === "Concluída").length,
  };

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`OPERACIONAL · ${escopo === "correspondente" ? "CORRESPONDENTE" : "CORRETOR"}`}
        title="Minhas Tarefas"
        subtitle="Gestão pessoal de tarefas com agrupamento por prazo, prioridade e vínculo com clientes/propostas."
        right={
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Nova tarefa
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Atrasadas" value={totais.atrasadas} tone="red" />
        <Metric label="Hoje" value={totais.hoje} tone="amber" />
        <Metric label="Esta semana" value={totais.semana} tone="emerald" />
        <Metric label="Concluídas" value={totais.concluidas} tone="blue" />
      </div>

      <section className="rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar tarefa…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="min-w-[240px] flex-1"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="ativas">Ativas</option>
            <option value="todas">Todas</option>
            <option value="concluidas">Concluídas</option>
          </select>
          <select
            value={filtroPrior}
            onChange={(e) => setFiltroPrior(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="">Todas as prioridades</option>
            {(["Crítica","Urgente","Alta","Média","Baixa"] as Prioridade[]).map((p) =>
              <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </section>

      <div className="space-y-5">
        {ORDEM_GRUPOS.map((grupo) => {
          const itens = agrupadas.get(grupo) ?? [];
          if (itens.length === 0) return null;
          return (
            <section key={grupo}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {grupo}
                <Badge variant="secondary" className="h-5 text-[10px]">{itens.length}</Badge>
              </h3>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {itens.map((t) => {
                  const d = dias(t.prazo);
                  const cli = clienteById(t.clienteId);
                  const prop = propostas.find((p) => p.id === t.propostaId);
                  const concluida = t.status === "Concluída";
                  return (
                    <li key={t.id} className="flex items-center gap-3 p-3 transition hover:bg-muted/30">
                      <button
                        onClick={() => toggleConcluida(t.id)}
                        className="text-muted-foreground hover:text-brand"
                        aria-label="Marcar tarefa"
                      >
                        {concluida
                          ? <CheckSquare className="h-5 w-5 text-emerald-600" />
                          : <Square className="h-5 w-5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium ${concluida ? "text-muted-foreground line-through" : "text-graphite"}`}>
                          {t.titulo}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {[cli?.nome, prop?.numero].filter(Boolean).join(" · ") || "Sem vínculo"}
                          {escopo === "correspondente" && (
                            <> · <span>{usuarioById(t.usuarioId)?.nome}</span></>
                          )}
                        </p>
                      </div>
                      <span className={`hidden text-[11px] font-medium sm:inline ${d.tone}`}>
                        <Clock className="mr-1 inline h-3 w-3" /> {d.label}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${prioridadeStyle[t.prioridade]}`}>
                        {t.prioridade}
                      </span>
                      <select
                        value={t.status}
                        onChange={(e) => mudarStatus(t.id, e.target.value as StatusTarefa)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-[11px]"
                      >
                        <option>A fazer</option>
                        <option>Em andamento</option>
                        <option>Aguardando</option>
                        <option>Concluída</option>
                      </select>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {minhas.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma tarefa encontrada com os filtros aplicados.
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "red"|"amber"|"emerald"|"blue" }) {
  const cls =
    tone === "red" ? "text-red-700" :
    tone === "amber" ? "text-amber-700" :
    tone === "emerald" ? "text-emerald-700" :
    tone === "blue" ? "text-brand" : "text-graphite";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${cls}`}>{value}</p>
    </div>
  );
}
