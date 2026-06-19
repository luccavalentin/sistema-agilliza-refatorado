import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Printer, Download, FileSpreadsheet, Search, ArrowRight, X } from "lucide-react";

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
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  direction: "var(--direction)",
  brand: "var(--brand)",
};

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
}

function printArea(node: HTMLElement | null, title: string) {
  if (!node) return;
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      *{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,sans-serif}
      body{margin:24px;color:#0b1220}
      h1{font-size:20px;margin:0 0 4px}
      h2{font-size:13px;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.08em;color:#64748b}
      .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
      .kpi{border:1px solid #e2e8f0;border-radius:8px;padding:10px}
      .kpi span{display:block;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}
      .kpi b{font-size:18px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
      th,td{border-bottom:1px solid #e2e8f0;padding:6px 8px;text-align:left}
      th{background:#f1f5f9;text-transform:uppercase;font-size:10px;letter-spacing:.06em;color:#475569}
      .top{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
      .top div{border:1px solid #e2e8f0;border-radius:8px;padding:8px;border-top:3px solid}
    </style></head><body>${node.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 250);
}

export function DashboardDetailProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<DetailContext[]>([]);
  const [record, setRecord] = useState<DetailRow | null>(null);
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);
  const ctx = stack[stack.length - 1] ?? null;

  const push = (c: DetailContext) => {
    setSearch("");
    setRecord(null);
    setStack((s) => [...s, c]);
  };
  const back = () => {
    if (record) { setRecord(null); return; }
    setStack((s) => s.slice(0, -1));
  };
  const close = () => { setStack([]); setRecord(null); };

  const value = useMemo<Ctx>(() => ({ open: (c) => { setStack([c]); setRecord(null); setSearch(""); } }), []);

  const filtered = ctx
    ? ctx.rows.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return [r.cliente, r.banco, r.status, r.usuario, r.data, r.valor].some((v) =>
          v.toLowerCase().includes(s),
        );
      })
    : [];

  // Drill helpers triggered from inside the dialog
  const drillFromKpi = (label: string, value: string) => {
    push({
      title: `${label} — Detalhamento`,
      subtitle: ctx?.title,
      period: ctx?.period,
      kpis: [
        { label, value },
        { label: "Origem", value: ctx?.title ?? "—" },
        { label: "Período", value: ctx?.period ?? "—" },
        { label: "Registros", value: String(ctx?.rows.length ?? 0) },
      ],
      rows: buildMockRows(14),
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
        { label: "Registros", value: "14" },
      ],
      rows: buildMockRows(14, { banco: label }),
    });
  };

  return (
    <DetailCtx.Provider value={value}>
      {children}
      <Dialog open={!!ctx} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-5xl gap-0 p-0">
          {ctx && (
            <div className="flex max-h-[88vh] flex-col">
              <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  {(stack.length > 1 || record) && (
                    <button
                      type="button"
                      onClick={back}
                      className="rounded-md border border-input bg-background px-2 py-1 text-[11px] font-semibold text-graphite hover:border-brand/40"
                    >
                      ← Voltar
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-graphite">
                      {record ? `${record.cliente} — Registro` : ctx.title}
                    </h2>
                    {ctx.subtitle && (
                      <p className="text-xs text-muted-foreground">{ctx.subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div ref={printRef} className="space-y-4 overflow-y-auto px-6 py-4">
                <h1 style={{ display: "none" }}>{record ? record.cliente : ctx.title}</h1>

                {record ? (
                  <RecordDetail row={record} onSeeMore={() => drillFromKpi(record.cliente, record.valor)} />
                ) : (
                  <>
                    <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-xs">
                      <div>
                        <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                          Período
                        </span>{" "}
                        <span className="font-semibold text-graphite">
                          {ctx.period ?? "Últimos 30 dias"}
                        </span>
                      </div>
                    </section>

                    <section className="kpis grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {ctx.kpis.map((k) => (
                        <button
                          type="button"
                          key={k.label}
                          onClick={() => drillFromKpi(k.label, k.value)}
                          className="kpi rounded-md border border-border bg-card p-3 text-left hover:border-brand/40 hover:shadow-sm"
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {k.label}
                          </span>
                          <b className="mt-1 block text-lg font-bold text-graphite">{k.value}</b>
                        </button>
                      ))}
                    </section>

                    {ctx.top && ctx.top.length > 0 && (
                      <section className="rounded-md border border-border bg-card p-4">
                        <p className="mb-2 text-xs font-bold text-graphite">
                          {ctx.topGroupLabel ?? "Destaques"}
                        </p>
                        <div className="top grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {ctx.top.map((t) => (
                            <button
                              type="button"
                              key={t.label}
                              onClick={() => drillFromTop(t.label, t.meta)}
                              style={{ borderTopColor: t.color }}
                              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3 text-left hover:border-brand/40 hover:shadow-sm"
                            >
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
                      <label className="relative flex-1 min-w-[220px]">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar no detalhamento"
                          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs"
                        />
                      </label>
                      <div className="flex gap-2 print:hidden">
                        <button
                          type="button"
                          onClick={() => printArea(printRef.current, ctx.title)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40"
                        >
                          <Printer className="h-3.5 w-3.5" /> Imprimir
                        </button>
                        <button
                          type="button"
                          onClick={() => printArea(printRef.current, ctx.title)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                        >
                          <Download className="h-3.5 w-3.5" /> Baixar PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadCSV(`${ctx.title}.csv`, filtered)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" /> Baixar Excel
                        </button>
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-md border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Data</th>
                            <th className="px-3 py-2 font-semibold">Cliente</th>
                            <th className="px-3 py-2 font-semibold">Banco</th>
                            <th className="px-3 py-2 font-semibold">Status</th>
                            <th className="px-3 py-2 font-semibold">Usuário</th>
                            <th className="px-3 py-2 text-right font-semibold">Valor</th>
                            <th className="px-3 py-2 text-right font-semibold print:hidden">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {filtered.map((r, i) => (
                            <tr
                              key={i}
                              onClick={() => setRecord(r)}
                              className="cursor-pointer hover:bg-secondary/60"
                            >
                              <td className="px-3 py-2 text-muted-foreground">{r.data}</td>
                              <td className="px-3 py-2 font-semibold text-graphite">{r.cliente}</td>
                              <td className="px-3 py-2 text-muted-foreground">{r.banco}</td>
                              <td className="px-3 py-2">
                                <span
                                  className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                  style={{
                                    color: TONE[r.statusTone ?? "info"],
                                    background: `color-mix(in oklab, ${TONE[r.statusTone ?? "info"]} 12%, transparent)`,
                                  }}
                                >
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
                          {filtered.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                                Nenhum registro encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </section>
                  </>
                )}
              </div>

              <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-3">
                {(stack.length > 1 || record) && (
                  <button
                    type="button"
                    onClick={back}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40"
                  >
                    ← Voltar
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40"
                >
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
  const timeline: { t: string; d: string; w: string }[] = [
    { t: "Cadastro criado", d: `Cliente ${row.cliente} cadastrado por ${row.usuario}.`, w: "há 18 dias" },
    { t: "Simulação realizada", d: `Simulação no banco ${row.banco} no valor de ${row.valor}.`, w: "há 12 dias" },
    { t: "Documentação enviada", d: "RG, comprovante de renda e residência.", w: "há 8 dias" },
    { t: "Proposta enviada ao banco", d: `Encaminhada ao ${row.banco} para análise.`, w: "há 5 dias" },
    { t: "Status atualizado", d: `Status atual: ${row.status}.`, w: row.data },
  ];
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Registro
            </p>
            <h3 className="text-lg font-bold text-graphite">{row.cliente}</h3>
            <p className="text-xs text-muted-foreground">
              {row.banco} · {row.data} · resp. {row.usuario}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: tone, background: `color-mix(in oklab, ${tone} 12%, transparent)` }}
            >
              {row.status}
            </span>
            <span className="rounded-md border border-border bg-background px-3 py-1 text-sm font-bold text-graphite">
              {row.valor}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-2 rounded-md border border-border bg-card p-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between gap-3 border-b border-border py-1.5 text-xs last:border-0"
          >
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
        <button
          type="button"
          onClick={onSeeMore}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:opacity-90"
        >
          Ver registros relacionados <ArrowRight className="h-3 w-3" />
        </button>
      </section>
    </div>
  );
}

// Helper to mint synthetic rows for any clicked context.
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
      ? { l: hint.status, t: ("info" as const) }
      : STATUSES[i % STATUSES.length];
    const name = NAMES[i % NAMES.length];
    const d = new Date();
    d.setDate(d.getDate() - i);
    const data = d.toLocaleDateString("pt-BR");
    const valor = 320000 + ((i * 53) % 12) * 35000;
    out.push({
      data,
      cliente: name,
      banco,
      status: status.l,
      statusTone: status.t,
      usuario: i % 3 === 0 ? "Administrador Demo" : i % 3 === 1 ? "Mariana Lopes" : "Rafael Souza",
      valor: `R$ ${valor.toLocaleString("pt-BR")}`,
    });
  }
  return out;
}
