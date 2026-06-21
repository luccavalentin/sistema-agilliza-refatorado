import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Printer, Download, FileSpreadsheet, Search, ArrowRight, X, ChevronUp, ChevronDown,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Filter, RotateCcw,
  Eye, Paperclip, MessageSquare, UserCircle2, FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export type DetailRow = {
  data: string;
  cliente: string;
  banco: string;
  status: string;
  statusTone?: "success" | "warning" | "info" | "direction" | "brand";
  usuario: string;
  valor: string;
};

export type DetailContext = {
  title: string;
  subtitle?: string;
  period?: string;
  kpis: { label: string; value: string }[];
  topGroupLabel?: string;
  top?: { label: string; meta: string; color: string }[];
  rows: DetailRow[];
};

type Ctx = { open: (c: DetailContext) => void };
const DetailCtx = createContext<Ctx | null>(null);

export function useDashboardDetail() {
  const ctx = useContext(DetailCtx);
  if (!ctx) throw new Error("useDashboardDetail must be used within <DashboardDetailProvider>");
  return ctx;
}

const TONE: Record<string, string> = {
  success: "#15803d",
  warning: "#d97706",
  info: "#2563eb",
  direction: "#f5333f",
  brand: "#000f9f",
};

// ============================== Helpers ==============================

function parseValor(s: string): number {
  const n = Number(s.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function parseData(s: string): number {
  const [d, m, y] = s.split("/").map(Number);
  if (!d || !m || !y) return 0;
  return new Date(y, m - 1, d).getTime();
}

function downloadCSV(filename: string, rows: DetailRow[]) {
  const header = ["Data", "Cliente", "Banco", "Status", "Usuário", "Valor"];
  const lines = [header, ...rows.map((r) => [r.data, r.cliente, r.banco, r.status, r.usuario, r.valor])]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\ufeff" + lines], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  toast.success("Excel exportado", { description: `${rows.length} registros baixados.` });
}

function exportPDF(ctx: DetailContext, rows: DetailRow[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(0, 15, 159);
  doc.rect(0, 0, w, 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(ctx.title, 32, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (ctx.subtitle) doc.text(ctx.subtitle, 32, 44);
  doc.text(
    `Período: ${ctx.period ?? "—"}    Registros: ${rows.length}    Emitido: ${new Date().toLocaleString("pt-BR")}`,
    32, 72,
  );
  doc.setTextColor(20, 20, 20);

  // KPIs
  let y = 92;
  const cardW = (w - 64 - 24) / 4;
  ctx.kpis.slice(0, 8).forEach((k, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 32 + col * (cardW + 8);
    const yy = y + row * 58;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yy, cardW, 50, 4, 4, "FD");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label.toUpperCase(), x + 10, yy + 16);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(k.value, x + 10, yy + 38);
    doc.setFont("helvetica", "normal");
  });
  y += Math.ceil(Math.min(ctx.kpis.length, 8) / 4) * 58 + 8;

  // Table
  autoTable(doc, {
    startY: y,
    head: [["Data", "Cliente", "Banco", "Status", "Usuário", "Valor"]],
    body: rows.map((r) => [r.data, r.cliente, r.banco, r.status, r.usuario, r.valor]),
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [250, 251, 253] },
    margin: { left: 32, right: 32 },
    columnStyles: { 5: { halign: "right", fontStyle: "bold" } },
  });

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${pages}`, w - 80, doc.internal.pageSize.getHeight() - 16);
  }

  doc.save(`${ctx.title.replace(/[^\w\s-]/g, "")}.pdf`);
  toast.success("PDF gerado", { description: `${rows.length} registros incluídos.` });
}

function exportRecordPDF(row: DetailRow) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(0, 15, 159);
  doc.rect(0, 0, w, 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(row.cliente, 32, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${row.banco} · ${row.data} · Resp. ${row.usuario}`, 32, 44);
  doc.setTextColor(20, 20, 20);

  autoTable(doc, {
    startY: 80,
    head: [["Campo", "Valor"]],
    body: [
      ["Data", row.data],
      ["Cliente", row.cliente],
      ["Banco", row.banco],
      ["Status", row.status],
      ["Usuário responsável", row.usuario],
      ["Valor", row.valor],
      ["Produto", "Financiamento Imobiliário"],
      ["Origem", "Indicação corretor"],
      ["Telefone", "(11) 99876-5432"],
      ["E-mail", row.cliente.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com"],
    ],
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    margin: { left: 32, right: 32 },
  });

  doc.save(`registro-${row.cliente.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  toast.success("PDF do registro gerado");
}

// ============================== Provider ==============================

type SortKey = keyof Pick<DetailRow, "data" | "cliente" | "banco" | "status" | "usuario" | "valor">;
type SortDir = "asc" | "desc";

type Filters = {
  banco: string;
  status: string;
  usuario: string;
  dataIni: string; // yyyy-mm-dd
  dataFim: string;
  valorMin: string;
  valorMax: string;
};
const FILTERS_INIT: Filters = {
  banco: "", status: "", usuario: "", dataIni: "", dataFim: "", valorMin: "", valorMax: "",
};

export function DashboardDetailProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<DetailContext[]>([]);
  const [record, setRecord] = useState<DetailRow | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(FILTERS_INIT);
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("data");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const printRef = useRef<HTMLDivElement | null>(null);
  const ctx = stack[stack.length - 1] ?? null;

  const resetView = () => {
    setSearch(""); setFilters(FILTERS_INIT); setSortKey("data"); setSortDir("desc"); setPage(1);
  };

  const push = (c: DetailContext) => { resetView(); setRecord(null); setStack((s) => [...s, c]); };
  const back = () => { if (record) { setRecord(null); return; } resetView(); setStack((s) => s.slice(0, -1)); };
  const close = () => { setStack([]); setRecord(null); resetView(); };

  const value = useMemo<Ctx>(() => ({
    open: (c) => { resetView(); setRecord(null); setStack([c]); },
  }), []);

  const bancos = useMemo(() => Array.from(new Set(ctx?.rows.map((r) => r.banco) ?? [])).sort(), [ctx]);
  const statuses = useMemo(() => Array.from(new Set(ctx?.rows.map((r) => r.status) ?? [])).sort(), [ctx]);
  const usuarios = useMemo(() => Array.from(new Set(ctx?.rows.map((r) => r.usuario) ?? [])).sort(), [ctx]);

  const filteredSorted = useMemo(() => {
    if (!ctx) return [];
    const s = search.toLowerCase();
    const vMin = filters.valorMin ? parseValor(filters.valorMin) : -Infinity;
    const vMax = filters.valorMax ? parseValor(filters.valorMax) : Infinity;
    const dIni = filters.dataIni ? new Date(filters.dataIni).getTime() : -Infinity;
    const dFim = filters.dataFim ? new Date(filters.dataFim).getTime() + 86400000 : Infinity;
    const out = ctx.rows.filter((r) => {
      if (s && ![r.cliente, r.banco, r.status, r.usuario, r.data, r.valor].some((v) => v.toLowerCase().includes(s))) return false;
      if (filters.banco && r.banco !== filters.banco) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.usuario && r.usuario !== filters.usuario) return false;
      const v = parseValor(r.valor);
      if (v < vMin || v > vMax) return false;
      const t = parseData(r.data);
      if (t < dIni || t > dFim) return false;
      return true;
    });
    out.sort((a, b) => {
      let av: number | string = a[sortKey];
      let bv: number | string = b[sortKey];
      if (sortKey === "valor") { av = parseValor(a.valor); bv = parseValor(b.valor); }
      else if (sortKey === "data") { av = parseData(a.data); bv = parseData(b.data); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [ctx, search, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const drillFromKpi = (label: string, val: string) => {
    push({
      title: `${label} — Detalhamento`,
      subtitle: ctx?.title,
      period: ctx?.period,
      kpis: [
        { label, value: val },
        { label: "Origem", value: ctx?.title ?? "—" },
        { label: "Período", value: ctx?.period ?? "—" },
        { label: "Registros", value: String(ctx?.rows.length ?? 0) },
      ],
      rows: buildMockRows(28),
    });
  };
  const drillFromTop = (label: string, meta: string) => {
    push({
      title: `${label} — Detalhamento`,
      subtitle: ctx?.title,
      period: ctx?.period,
      kpis: [
        { label: "Item", value: label },
        { label: "Resumo", value: meta },
        { label: "Período", value: ctx?.period ?? "—" },
        { label: "Registros", value: "28" },
      ],
      rows: buildMockRows(28, { banco: label }),
    });
  };

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <DetailCtx.Provider value={value}>
      {children}
      <Dialog open={!!ctx} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-6xl gap-0 p-0">
          {ctx && (
            <div className="flex max-h-[90vh] flex-col">
              <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  {(stack.length > 1 || record) && (
                    <button type="button" onClick={back}
                      className="rounded-md border border-input bg-background px-2 py-1 text-[11px] font-semibold text-graphite hover:border-brand/40">
                      ← Voltar
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-graphite">
                      {record ? `${record.cliente} — Registro` : ctx.title}
                    </h2>
                    {ctx.subtitle && <p className="text-xs text-muted-foreground">{ctx.subtitle}</p>}
                  </div>
                </div>
                <button type="button" onClick={close}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div ref={printRef} className="space-y-4 overflow-y-auto px-6 py-4">
                {record ? (
                  <RecordDetail row={record}
                    onSeeMore={() => drillFromKpi(record.cliente, record.valor)} />
                ) : (
                  <>
                    <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-xs">
                      <div>
                        <span className="font-semibold uppercase tracking-wider text-muted-foreground">Período</span>{" "}
                        <span className="font-semibold text-graphite">{ctx.period ?? "Últimos 30 dias"}</span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-graphite">{filteredSorted.length}</span> de {ctx.rows.length} registros
                      </div>
                    </section>

                    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {ctx.kpis.map((k) => (
                        <button type="button" key={k.label}
                          onClick={() => drillFromKpi(k.label, k.value)}
                          className="rounded-md border border-border bg-card p-3 text-left hover:border-brand/40 hover:shadow-sm">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</span>
                          <b className="mt-1 block text-lg font-bold text-graphite">{k.value}</b>
                        </button>
                      ))}
                    </section>

                    {ctx.top && ctx.top.length > 0 && (
                      <section className="rounded-md border border-border bg-card p-4">
                        <p className="mb-2 text-xs font-bold text-graphite">{ctx.topGroupLabel ?? "Destaques"}</p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {ctx.top.map((t) => (
                            <button type="button" key={t.label}
                              onClick={() => drillFromTop(t.label, t.meta)}
                              style={{ borderTopColor: t.color }}
                              className="flex items-center justify-between gap-2 rounded-md border border-border border-t-[3px] bg-background p-3 text-left hover:border-brand/40 hover:shadow-sm">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-graphite">{t.label}</p>
                                <p className="truncate text-[11px] text-muted-foreground">{t.meta}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="flex flex-wrap items-center justify-between gap-2">
                      <label className="relative min-w-[220px] flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                          placeholder="Buscar no detalhamento"
                          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs" />
                      </label>
                      <div className="flex flex-wrap gap-2 print:hidden">
                        <button type="button" onClick={() => setShowFilters((s) => !s)}
                          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold ${
                            showFilters || activeFilterCount > 0
                              ? "border-brand/60 bg-brand/5 text-brand"
                              : "border-input bg-background text-graphite hover:border-brand/40"
                          }`}>
                          <Filter className="h-3.5 w-3.5" /> Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                        </button>
                        <button type="button" onClick={() => window.print()}
                          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40">
                          <Printer className="h-3.5 w-3.5" /> Imprimir
                        </button>
                        <button type="button" onClick={() => exportPDF(ctx, filteredSorted)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90">
                          <Download className="h-3.5 w-3.5" /> Baixar PDF
                        </button>
                        <button type="button" onClick={() => downloadCSV(`${ctx.title}.csv`, filteredSorted)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40">
                          <FileSpreadsheet className="h-3.5 w-3.5" /> Baixar Excel
                        </button>
                      </div>
                    </section>

                    {showFilters && (
                      <section className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FilterField label="Banco">
                          <select value={filters.banco}
                            onChange={(e) => { setFilters((f) => ({ ...f, banco: e.target.value })); setPage(1); }}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                            <option value="">Todos</option>
                            {bancos.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </FilterField>
                        <FilterField label="Status">
                          <select value={filters.status}
                            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                            <option value="">Todos</option>
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </FilterField>
                        <FilterField label="Usuário">
                          <select value={filters.usuario}
                            onChange={(e) => { setFilters((f) => ({ ...f, usuario: e.target.value })); setPage(1); }}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                            <option value="">Todos</option>
                            {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </FilterField>
                        <FilterField label="Data de">
                          <input type="date" value={filters.dataIni}
                            onChange={(e) => { setFilters((f) => ({ ...f, dataIni: e.target.value })); setPage(1); }}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" />
                        </FilterField>
                        <FilterField label="Data até">
                          <input type="date" value={filters.dataFim}
                            onChange={(e) => { setFilters((f) => ({ ...f, dataFim: e.target.value })); setPage(1); }}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" />
                        </FilterField>
                        <FilterField label="Valor mín. (R$)">
                          <input value={filters.valorMin}
                            onChange={(e) => { setFilters((f) => ({ ...f, valorMin: e.target.value })); setPage(1); }}
                            placeholder="0,00" inputMode="decimal"
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" />
                        </FilterField>
                        <FilterField label="Valor máx. (R$)">
                          <input value={filters.valorMax}
                            onChange={(e) => { setFilters((f) => ({ ...f, valorMax: e.target.value })); setPage(1); }}
                            placeholder="999.999,99" inputMode="decimal"
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" />
                        </FilterField>
                        <div className="flex items-end">
                          <button type="button" onClick={() => { setFilters(FILTERS_INIT); setPage(1); }}
                            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2 text-xs font-semibold text-graphite hover:border-brand/40">
                            <RotateCcw className="h-3 w-3" /> Limpar filtros
                          </button>
                        </div>
                      </section>
                    )}

                    <section className="overflow-hidden rounded-md border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <SortHeader k="data" label="Data" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <SortHeader k="cliente" label="Cliente" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <SortHeader k="banco" label="Banco" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <SortHeader k="status" label="Status" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <SortHeader k="usuario" label="Usuário" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                            <SortHeader k="valor" label="Valor" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
                            <th className="px-3 py-2 text-right font-semibold print:hidden">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {pageRows.map((r, i) => (
                            <tr key={i} onClick={() => setRecord(r)}
                              className="cursor-pointer hover:bg-secondary/60">
                              <td className="px-3 py-2 text-muted-foreground">{r.data}</td>
                              <td className="px-3 py-2 font-semibold text-graphite">{r.cliente}</td>
                              <td className="px-3 py-2 text-muted-foreground">{r.banco}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                  style={{
                                    color: TONE[r.statusTone ?? "info"],
                                    background: `color-mix(in oklab, ${TONE[r.statusTone ?? "info"]} 12%, transparent)`,
                                  }}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{r.usuario}</td>
                              <td className="px-3 py-2 text-right font-bold text-graphite">{r.valor}</td>
                              <td className="px-3 py-2 text-right print:hidden">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
                                  Ver <ArrowRight className="h-3 w-3" />
                                </span>
                              </td>
                            </tr>
                          ))}
                          {pageRows.length === 0 && (
                            <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                              Nenhum registro encontrado.
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </section>

                    <Pagination
                      page={safePage} totalPages={totalPages} pageSize={pageSize}
                      total={filteredSorted.length}
                      onPage={(p) => setPage(p)}
                      onPageSize={(s) => { setPageSize(s); setPage(1); }}
                    />
                  </>
                )}
              </div>

              <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-3">
                {(stack.length > 1 || record) && (
                  <button type="button" onClick={back}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40">
                    ← Voltar
                  </button>
                )}
                <button type="button" onClick={close}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40">
                  Fechar
                </button>
              </footer>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DetailCtx.Provider>
  );
}

// ============================== Subcomponents ==============================

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SortHeader({
  k, label, sortKey, sortDir, onClick, align,
}: {
  k: SortKey; label: string; sortKey: SortKey; sortDir: SortDir;
  onClick: (k: SortKey) => void; align?: "right";
}) {
  const active = sortKey === k;
  return (
    <th className={`px-3 py-2 font-semibold ${align === "right" ? "text-right" : ""}`}>
      <button type="button" onClick={() => onClick(k)}
        className={`inline-flex items-center gap-1 hover:text-graphite ${active ? "text-graphite" : ""}`}>
        {label}
        {active && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

function Pagination({
  page, totalPages, pageSize, total, onPage, onPageSize,
}: {
  page: number; totalPages: number; pageSize: number; total: number;
  onPage: (p: number) => void; onPageSize: (s: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <section className="flex flex-wrap items-center justify-between gap-2 text-[11px] print:hidden">
      <div className="text-muted-foreground">
        Mostrando <b className="text-graphite">{start}–{end}</b> de <b className="text-graphite">{total}</b>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">Por página</span>
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background">
          <PgBtn disabled={page <= 1} onClick={() => onPage(1)}><ChevronsLeft className="h-3.5 w-3.5" /></PgBtn>
          <PgBtn disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-3.5 w-3.5" /></PgBtn>
          <span className="px-2 font-semibold text-graphite">{page} / {totalPages}</span>
          <PgBtn disabled={page >= totalPages} onClick={() => onPage(page + 1)}><ChevronRight className="h-3.5 w-3.5" /></PgBtn>
          <PgBtn disabled={page >= totalPages} onClick={() => onPage(totalPages)}><ChevronsRight className="h-3.5 w-3.5" /></PgBtn>
        </div>
      </div>
    </section>
  );
}
function PgBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...p} className="px-1.5 py-1 text-muted-foreground hover:text-graphite disabled:opacity-30">{children}</button>;
}

function RecordDetail({ row, onSeeMore }: { row: DetailRow; onSeeMore: () => void }) {
  const tone = TONE[row.statusTone ?? "info"];
  const fields: { label: string; value: string }[] = [
    { label: "Data", value: row.data },
    { label: "Cliente", value: row.cliente },
    { label: "Banco", value: row.banco },
    { label: "Status", value: row.status },
    { label: "Usuário responsável", value: row.usuario },
    { label: "Valor", value: row.valor },
    { label: "Produto", value: "Financiamento Imobiliário" },
    { label: "Origem", value: "Indicação corretor" },
    { label: "Cidade / UF", value: "São Paulo — SP" },
    { label: "Telefone", value: "(11) 99876-5432" },
    { label: "E-mail", value: row.cliente.toLowerCase().replace(/\s+/g, ".") + "@exemplo.com" },
    { label: "Última atualização", value: row.data + " · 14:32" },
  ];
  const timeline = [
    { t: "Cadastro criado", d: `Cliente ${row.cliente} cadastrado por ${row.usuario}.`, w: "há 18 dias" },
    { t: "Simulação realizada", d: `Simulação no banco ${row.banco} no valor de ${row.valor}.`, w: "há 12 dias" },
    { t: "Documentação enviada", d: "RG, comprovante de renda e residência.", w: "há 8 dias" },
    { t: "Proposta enviada ao banco", d: `Encaminhada ao ${row.banco} para análise.`, w: "há 5 dias" },
    { t: "Status atualizado", d: `Status atual: ${row.status}.`, w: row.data },
  ];
  const fileInput = useRef<HTMLInputElement | null>(null);

  const actions: { l: string; icon: typeof Eye; onClick: () => void; primary?: boolean }[] = [
    { l: "Abrir proposta", icon: FileText, primary: true, onClick: () => toast.info("Abrindo proposta", { description: `Proposta de ${row.cliente}.` }) },
    { l: "Abrir no CRM", icon: UserCircle2, onClick: () => toast.info("Abrindo cliente no CRM", { description: row.cliente }) },
    { l: "Anexar documento", icon: Paperclip, onClick: () => fileInput.current?.click() },
    { l: "Registrar tratativa", icon: MessageSquare, onClick: () => toast.success("Tratativa registrada", { description: `Tratativa adicionada ao registro de ${row.cliente}.` }) },
    { l: "Imprimir registro", icon: Printer, onClick: () => window.print() },
    { l: "Baixar PDF", icon: Download, onClick: () => exportRecordPDF(row) },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Registro</p>
            <h3 className="text-lg font-bold text-graphite">{row.cliente}</h3>
            <p className="text-xs text-muted-foreground">{row.banco} · {row.data} · resp. {row.usuario}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: tone, background: `color-mix(in oklab, ${tone} 12%, transparent)` }}>
              {row.status}
            </span>
            <span className="rounded-md border border-border bg-background px-3 py-1 text-sm font-bold text-graphite">{row.valor}</span>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2 print:hidden">
        <input ref={fileInput} type="file" hidden onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) toast.success("Documento anexado", { description: `${f.name} (${Math.ceil(f.size / 1024)} KB) vinculado a ${row.cliente}.` });
          e.target.value = "";
        }} />
        {actions.map((a) => (
          <button key={a.l} type="button" onClick={a.onClick}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${
              a.primary
                ? "bg-brand text-white hover:opacity-90"
                : "border border-input bg-background text-graphite hover:border-brand/40"
            }`}>
            <a.icon className="h-3.5 w-3.5" /> {a.l}
          </button>
        ))}
      </section>

      <section className="grid gap-2 rounded-md border border-border bg-card p-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between gap-3 border-b border-border py-1.5 text-xs last:border-0">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="text-right font-semibold text-graphite">{f.value}</span>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-border bg-card p-4">
        <p className="mb-3 text-xs font-bold text-graphite">Histórico do registro</p>
        <ul className="space-y-3">
          {timeline.map((u) => (
            <li key={u.t} className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-graphite">{u.t}</p>
                  <span className="text-[10px] text-muted-foreground">{u.w}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{u.d}</p>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onSeeMore}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:opacity-90">
          Ver registros relacionados <ArrowRight className="h-3 w-3" />
        </button>
      </section>
    </div>
  );
}

// ============================== Mock builder ==============================

const NAMES = [
  "Gustavo Lima", "Juliana Rocha", "Tiago Ferreira", "Beatriz Almeida", "Rafael Souza",
  "Camila Duarte", "Bruno Tavares", "Ana Beatriz", "Mariana Lopes", "João Pereira",
  "Marta Lima", "Carlos Antunes", "Aline Costa", "Pedro Henrique", "Fernanda Reis",
];
const BANCOS = ["Bradesco", "Itaú", "Caixa", "Santander", "Inter"];
const STATUSES: { l: string; t: DetailRow["statusTone"] }[] = [
  { l: "Aprovada", t: "success" },
  { l: "Pendência docs", t: "warning" },
  { l: "Em análise", t: "info" },
  { l: "Reprovada", t: "direction" },
  { l: "Tratativa", t: "warning" },
];

export function buildMockRows(count: number, hint?: { banco?: string; status?: string }): DetailRow[] {
  const out: DetailRow[] = [];
  for (let i = 0; i < count; i++) {
    const banco = hint?.banco ?? BANCOS[i % BANCOS.length];
    const status = hint?.status
      ? { l: hint.status, t: "info" as const }
      : STATUSES[i % STATUSES.length];
    const name = NAMES[i % NAMES.length];
    const d = new Date();
    d.setDate(d.getDate() - i);
    const data = d.toLocaleDateString("pt-BR");
    const valor = 320000 + ((i * 53) % 12) * 35000;
    out.push({
      data, cliente: name, banco,
      status: status.l, statusTone: status.t,
      usuario: i % 3 === 0 ? "Administrador Demo" : i % 3 === 1 ? "Mariana Lopes" : "Rafael Souza",
      valor: `R$ ${valor.toLocaleString("pt-BR")}`,
    });
  }
  return out;
}
