/**
 * Contas a Pagar — Módulo financeiro do correspondente.
 */
import { useMemo, useState } from "react";
import {
  ArrowUpCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Download, Filter, Plus, Search,
  AlertTriangle, MoreHorizontal, TrendingUp,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { contasPagar } from "@/lib/financeiro/mock-data";
import { formatBRL } from "@/lib/operacional/formatters";
import type { Lancamento } from "@/lib/financeiro/types";

type StatusFiltro = "todos" | "aberto" | "pago" | "vencido" | "parcial" | "agendado";

const PAGE_SIZE = 8;

function statusTone(s: string) {
  if (s === "Pago") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "Vencido") return "bg-red-50 text-red-700 border-red-200";
  if (s === "Pago parcialmente" || s === "Parcial") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "Agendado") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "Em aprovação") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function ContasPagar() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const lancamentos: Lancamento[] = useMemo(() =>
    [...contasPagar].sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()),
    [],
  );

  const filtrados = useMemo(() => lancamentos.filter((l) => {
    const q = busca.toLowerCase();
    const matchBusca = !busca || l.descricao.toLowerCase().includes(q) ||
      l.fornecedor?.toLowerCase().includes(q) || l.categoriaId?.toLowerCase().includes(q);
    const matchStatus = statusFiltro === "todos" ||
      (statusFiltro === "aberto" && l.status === "Em aberto") ||
      (statusFiltro === "pago" && l.status === "Pago") ||
      (statusFiltro === "vencido" && l.status === "Vencido") ||
      (statusFiltro === "parcial" && l.status === "Pago parcialmente") ||
      (statusFiltro === "agendado" && l.status === "Agendado");
    return matchBusca && matchStatus;
  }), [lancamentos, busca, statusFiltro]);

  const totalPags = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pag = Math.min(pagina, totalPags);
  const visiveis = filtrados.slice((pag - 1) * PAGE_SIZE, pag * PAGE_SIZE);

  const totalAberto = lancamentos.filter((l) => l.status === "Em aberto").reduce((a, b) => a + b.valor, 0);
  const totalVencido = lancamentos.filter((l) => l.status === "Vencido").reduce((a, b) => a + b.valor, 0);
  const totalPagoMes = lancamentos.filter((l) => l.status === "Pago" && new Date(l.vencimento).getMonth() === new Date().getMonth()).reduce((a, b) => a + b.valor, 0);
  const totalGeral = lancamentos.reduce((a, b) => a + b.valor, 0);

  function toggleSel(id: string) {
    setSelecionados((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="FINANCEIRO"
        title="Contas a Pagar"
        subtitle="Gerencie todas as despesas, contas de consumo e saídas do correspondente."
        right={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-brand-foreground hover:bg-brand/90">
              <Plus className="h-3.5 w-3.5" />
              Novo lançamento
            </button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total geral", value: formatBRL(totalGeral), accent: "#001bbf", icon: TrendingUp },
          { label: "Em aberto", value: formatBRL(totalAberto), accent: "#ff8a00", icon: Clock },
          { label: "Vencidos", value: formatBRL(totalVencido), accent: "#e02323", icon: AlertTriangle },
          { label: "Pagos (mês)", value: formatBRL(totalPagoMes), accent: "#00b35a", icon: CheckCircle2 },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="h-1 w-full" style={{ backgroundColor: k.accent }} />
              <div className="flex items-start justify-between p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
                  <p className="mt-1 text-lg font-bold text-graphite">{k.value}</p>
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-md border border-border bg-secondary" style={{ color: k.accent }}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por descrição, fornecedor ou categoria..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: "todos", label: "Todos" },
            { value: "aberto", label: "Em aberto" },
            { value: "pago", label: "Pagos" },
            { value: "vencido", label: "Vencidos" },
            { value: "parcial", label: "Parcial" },
            { value: "agendado", label: "Agendados" },
          ] as { value: StatusFiltro; label: string }[]).map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFiltro(s.value); setPagina(1); }}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                statusFiltro === s.value
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background text-graphite hover:border-brand/40",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="ml-auto text-[11px] font-semibold text-muted-foreground">
          {filtrados.length} lançamento{filtrados.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Tabela */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="w-8 px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[color:var(--brand)]"
                    onChange={(e) => {
                      if (e.target.checked) setSelecionados(new Set(visiveis.map((l) => l.id)));
                      else setSelecionados(new Set());
                    }}
                  />
                </th>
                {["Descrição", "Fornecedor / Beneficiário", "Categoria", "Vencimento", "Valor", "Status", "Conta", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhum lançamento de saída encontrado.
                  </td>
                </tr>
              )}
              {visiveis.map((l) => {
                const vencido = l.status === "Vencido" || (l.status === "Em aberto" && new Date(l.vencimento) < new Date());
                return (
                  <tr key={l.id} className={`group hover:bg-secondary/30 ${selecionados.has(l.id) ? "bg-brand/5" : ""}`}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(l.id)}
                        onChange={() => toggleSel(l.id)}
                        className="h-3.5 w-3.5 accent-[color:var(--brand)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-red-50 text-red-700">
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                        </div>
                        <p className="font-semibold text-graphite">{l.descricao}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.fornecedor ?? l.beneficiario ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.categoriaId ?? "—"}</td>
                    <td className={`px-4 py-3 font-semibold ${vencido ? "text-red-600" : "text-graphite"}`}>
                      {new Date(l.vencimento).toLocaleDateString("pt-BR")}
                      {vencido && l.status === "Em aberto" && (
                        <span className="ml-1 text-[10px] text-red-600">(vencido)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-red-700">{formatBRL(l.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[11px]">{l.contaId ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100">
                          Pagar
                        </button>
                        <button className="rounded border border-border px-2 py-1 text-[10px] font-semibold text-graphite hover:border-brand/40">
                          Editar
                        </button>
                        <button className="rounded p-1 text-muted-foreground hover:text-graphite">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {selecionados.size > 0 && (
              <span className="font-semibold text-brand">{selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}</span>
            )}
            <span>{filtrados.length > 0 ? `${(pag - 1) * PAGE_SIZE + 1}–${Math.min(pag * PAGE_SIZE, filtrados.length)} de ${filtrados.length}` : "0 resultados"}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagina(Math.max(1, pag - 1))} disabled={pag === 1} className="rounded p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPags) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPagina(p)}
                className={`min-w-[28px] rounded px-2 py-1 text-[11px] font-semibold ${p === pag ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >{p}</button>
            ))}
            <button onClick={() => setPagina(Math.min(totalPags, pag + 1))} disabled={pag === totalPags} className="rounded p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
