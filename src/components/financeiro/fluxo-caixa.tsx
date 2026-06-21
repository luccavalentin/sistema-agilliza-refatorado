// Fluxo de Caixa
import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { Download, Filter, TrendingUp } from "lucide-react";
import { PanelHeader, Panel, KpiCard } from "@/components/dashboards/primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
} from "@/components/dashboards/detail-dialog";
import { Button } from "@/components/ui/button";
import { categoriaById } from "@/lib/financeiro/mock-data";
import { useReceber, usePagar } from "@/data/hooks";
import { formatBRL } from "@/lib/operacional/formatters";

const TOKENS = {
  brand: "#000f9f", success: "#15803d", direction: "#f5333f",
  warning: "#d97706", info: "#2563eb", brandSoft: "#4a55c4", muted: "#6b7280", grid: "#e5e7eb",
};

const visualizacoes = ["Diário", "Semanal", "Mensal", "Trimestral", "Anual"];

export function FluxoCaixaView({ escopo }: { escopo: "correspondente" | "corretor" }) {
  return (
    <DashboardDetailProvider>
      <FluxoCaixaInner escopo={escopo} />
    </DashboardDetailProvider>
  );
}

function FluxoCaixaInner({ escopo }: { escopo: "correspondente" | "corretor" }) {
  const { open } = useDashboardDetail();
  const drill = (title: string, value: string) =>
    open({
      title,
      subtitle: `Fluxo de Caixa · ${escopo === "correspondente" ? "Correspondente" : "Corretor"}`,
      period: "Últimos 12 meses",
      kpis: [
        { label: title, value },
        { label: "Visualização", value: "Mensal" },
        { label: "Escopo", value: escopo === "correspondente" ? "Ecossistema" : "Meus dados" },
        { label: "Registros", value: "24" },
      ],
      rows: buildMockRows(24),
    });
  const [vis, setVis] = useState("Mensal");
  const recDados = escopo === "corretor" ? contasReceber.filter(r => r.corretorId === "u-cor-1") : contasReceber;
  const pagDados = escopo === "corretor" ? contasPagar.slice(0, 6) : contasPagar;

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const dados = useMemo(() => meses.map((m, i) => {
    const entradasPrev = 200_000 + i * 15_000;
    const entradasReal = 185_000 + i * 13_000 - (i % 4) * 8000;
    const saidasPrev = 130_000 + i * 9_000;
    const saidasReal = 125_000 + i * 8_500;
    const saldoInicial = 280_000 + i * 12_000;
    return {
      mes: m,
      entradasPrev, entradasReal,
      saidasPrev: -saidasPrev, saidasReal: -saidasReal,
      saldoPrevisto: saldoInicial + (entradasPrev - saidasPrev),
      saldoRealizado: saldoInicial + (entradasReal - saidasReal),
      resultado: entradasReal - saidasReal,
    };
  }), []);

  const totalEntradasPrev = dados.reduce((s, d) => s + d.entradasPrev, 0);
  const totalEntradasReal = dados.reduce((s, d) => s + d.entradasReal, 0);
  const totalSaidasPrev = dados.reduce((s, d) => s + Math.abs(d.saidasPrev), 0);
  const totalSaidasReal = dados.reduce((s, d) => s + Math.abs(d.saidasReal), 0);

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title="Fluxo de Caixa"
        subtitle="Entradas, saídas, saldos previstos e realizados ao longo do tempo."
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              {visualizacoes.map(v => (
                <button key={v} onClick={() => setVis(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${vis === v ? "bg-brand text-white" : "text-muted-foreground hover:text-graphite"}`}>
                  {v}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filtros</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Entradas Previstas" value={formatBRL(totalEntradasPrev)} accent={TOKENS.brand} onClick={() => drill("Entradas Previstas", formatBRL(totalEntradasPrev))} />
        <KpiCard label="Entradas Realizadas" value={formatBRL(totalEntradasReal)} accent={TOKENS.success} onClick={() => drill("Entradas Realizadas", formatBRL(totalEntradasReal))} />
        <KpiCard label="Saídas Previstas" value={formatBRL(totalSaidasPrev)} accent={TOKENS.warning} onClick={() => drill("Saídas Previstas", formatBRL(totalSaidasPrev))} />
        <KpiCard label="Saídas Realizadas" value={formatBRL(totalSaidasReal)} accent={TOKENS.direction} onClick={() => drill("Saídas Realizadas", formatBRL(totalSaidasReal))} />
      </div>

      <Panel title="Saldo Previsto x Realizado" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dados}>
            <defs>
              <linearGradient id="sP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TOKENS.brand} stopOpacity={0.3} />
                <stop offset="100%" stopColor={TOKENS.brand} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TOKENS.success} stopOpacity={0.3} />
                <stop offset="100%" stopColor={TOKENS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: TOKENS.muted }} />
            <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="saldoPrevisto" stroke={TOKENS.brand} fill="url(#sP)" strokeWidth={2} name="Saldo Previsto" />
            <Area type="monotone" dataKey="saldoRealizado" stroke={TOKENS.success} fill="url(#sR)" strokeWidth={2} name="Saldo Realizado" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Entradas x Saídas por Período" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dados} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: TOKENS.muted }} />
            <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatBRL(Math.abs(v))} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="entradasReal" fill={TOKENS.success} name="Entradas" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saidasReal" fill={TOKENS.direction} name="Saídas" radius={[0, 0, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Projeção dos Próximos Meses" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dados.slice(-6).concat(meses.slice(0, 3).map((m, i) => ({
            mes: m + "*", entradasPrev: 250_000 + i * 12_000, entradasReal: 0,
            saidasPrev: -150_000 - i * 6_000, saidasReal: 0,
            saldoPrevisto: 480_000 + i * 30_000, saldoRealizado: 0, resultado: 0,
          })))}>
            <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: TOKENS.muted }} />
            <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
            <Area type="monotone" dataKey="saldoPrevisto" stroke={TOKENS.brandSoft} fill={TOKENS.brandSoft} fillOpacity={0.2} name="Projeção" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-muted-foreground mt-2">* meses projetados</p>
      </Panel>
    </div>
  );
}
