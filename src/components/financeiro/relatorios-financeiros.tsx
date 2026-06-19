// Relatórios Financeiros — visão executiva
import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Download, Filter, FileBarChart, TrendingUp, TrendingDown, Users, Building2, Wallet,
} from "lucide-react";
import { PanelHeader, Panel, KpiCard } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import {
  contasReceber, contasPagar, comissoes, categoriaById, bancos, propostas, usuarios, clientes,
} from "@/lib/financeiro/mock-data";
import { formatBRL } from "@/lib/operacional/formatters";

const TOKENS = {
  brand: "#000f9f", brandSoft: "#4a55c4",
  direction: "#f5333f", directionSoft: "#f8757e",
  success: "#15803d", successSoft: "#4ea870",
  warning: "#d97706", info: "#2563eb",
  graphite: "#1a1f2e", muted: "#6b7280", grid: "#e5e7eb",
};

const periodos = ["7 dias", "30 dias", "90 dias", "Ano"];

const RELATORIOS = [
  "Contas a receber por período", "Contas a pagar por período",
  "Receitas por categoria", "Despesas por categoria", "Resultado financeiro",
  "Fluxo de caixa", "Comissões por corretor", "Comissões pendentes",
  "Comissões pagas", "Inadimplência", "Recorrências ativas",
  "Lançamentos vencidos", "Lançamentos conciliados", "Lançamentos não conciliados",
  "Receita por produto", "Receita por banco", "Receita por cliente",
  "Receita por imobiliária", "Despesa por centro de custo", "Projeção financeira",
];

export function RelatoriosFinanceiros({ escopo }: { escopo: "correspondente" | "corretor" }) {
  const [periodo, setPeriodo] = useState("30 dias");
  const recDados = escopo === "corretor" ? contasReceber.filter(r => r.corretorId === "u-cor-1") : contasReceber;
  const pagDados = escopo === "corretor" ? contasPagar.slice(0, 6) : contasPagar;
  const comDados = escopo === "corretor" ? comissoes.filter(c => c.corretorId === "u-cor-1") : comissoes;

  const totalRec = recDados.reduce((s, r) => s + r.valor, 0);
  const totalPag = pagDados.reduce((s, p) => s + p.valor, 0);
  const totalCom = comDados.reduce((s, c) => s + c.valor, 0);
  const resultado = totalRec - totalPag;

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const evol = meses.map((m, i) => ({
    mes: m,
    receita: 165_000 + i * 12_000 + (i % 3) * 18_000,
    despesa: 110_000 + i * 7_500,
    comissoes: 24_000 + i * 1_800,
  }));

  const recCategoria = useMemo(() => {
    const map = new Map<string, number>();
    recDados.forEach(r => map.set(r.categoriaId, (map.get(r.categoriaId) ?? 0) + r.valor));
    return Array.from(map.entries()).map(([id, v]) => {
      const c = categoriaById(id);
      return { name: c?.nome ?? id, value: v, color: c?.cor ?? TOKENS.brand };
    });
  }, [recDados]);

  const despCategoria = useMemo(() => {
    const map = new Map<string, number>();
    pagDados.forEach(p => map.set(p.categoriaId, (map.get(p.categoriaId) ?? 0) + p.valor));
    return Array.from(map.entries()).map(([id, v]) => {
      const c = categoriaById(id);
      return { nome: c?.nome ?? id, valor: v, cor: c?.cor ?? TOKENS.direction };
    }).sort((a, b) => b.valor - a.valor);
  }, [pagDados]);

  const comCorretor = useMemo(() => usuarios.filter(u => u.papel === "corretor").map(u => ({
    nome: u.nome.split(" ")[0],
    pagas: comissoes.filter(c => c.corretorId === u.id && c.status === "Paga").reduce((s, c) => s + c.valor, 0),
    pendentes: comissoes.filter(c => c.corretorId === u.id && c.status !== "Paga").reduce((s, c) => s + c.valor, 0),
  })), []);

  const recBanco = bancos.map((b, i) => ({
    nome: b.sigla,
    valor: recDados.filter(r => propostas.find(p => p.id === r.propostaId)?.bancoId === b.id).reduce((s, r) => s + r.valor, 0),
    cor: [TOKENS.brand, TOKENS.direction, TOKENS.success, TOKENS.warning, TOKENS.info, TOKENS.brandSoft][i % 6],
  })).filter(b => b.valor > 0);

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title="Relatórios Financeiros e Métricas"
        subtitle="Análises executivas, gráficos e exportações de toda a operação financeira."
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              {periodos.map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${periodo === p ? "bg-brand text-white" : "text-muted-foreground hover:text-graphite"}`}>{p}</button>
              ))}
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filtros</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Receita Total" value={formatBRL(totalRec)} accent={TOKENS.success} icon={TrendingUp} />
        <KpiCard label="Despesa Total" value={formatBRL(totalPag)} accent={TOKENS.direction} icon={TrendingDown} />
        <KpiCard label="Resultado" value={formatBRL(resultado)} accent={resultado >= 0 ? TOKENS.brand : TOKENS.direction} icon={Wallet} caption={`Margem ${totalRec > 0 ? ((resultado / totalRec) * 100).toFixed(1) : 0}%`} />
        <KpiCard label="Comissões" value={formatBRL(totalCom)} accent={TOKENS.info} icon={Users} />
      </div>

      <Panel title="Evolução Financeira" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={evol}>
            <defs>
              <linearGradient id="rR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TOKENS.success} stopOpacity={0.35} />
                <stop offset="100%" stopColor={TOKENS.success} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TOKENS.direction} stopOpacity={0.35} />
                <stop offset="100%" stopColor={TOKENS.direction} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: TOKENS.muted }} />
            <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="receita" stroke={TOKENS.success} fill="url(#rR)" strokeWidth={2} name="Receita" />
            <Area type="monotone" dataKey="despesa" stroke={TOKENS.direction} fill="url(#rD)" strokeWidth={2} name="Despesa" />
            <Line type="monotone" dataKey="comissoes" stroke={TOKENS.info} strokeWidth={2} name="Comissões" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Receita por Categoria" icon={FileBarChart}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={recCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {recCategoria.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Despesa por Categoria" icon={TrendingDown}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={despCategoria.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
              <XAxis type="number" tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 10, fill: TOKENS.muted }} width={140} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {despCategoria.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Receita por Banco" icon={Building2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={recBanco}>
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
              <XAxis dataKey="nome" tick={{ fontSize: 11, fill: TOKENS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {recBanco.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {escopo === "correspondente" && (
          <Panel title="Comissões por Corretor" icon={Users}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comCorretor}>
                <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: TOKENS.muted }} />
                <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pendentes" fill={TOKENS.warning} name="Pendentes" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="pagas" fill={TOKENS.success} name="Pagas" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}
      </div>

      <Panel title="Relatórios disponíveis" icon={FileBarChart}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RELATORIOS.map(r => (
            <button key={r} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-left text-sm font-medium text-graphite hover:border-brand/40 hover:bg-secondary/50">
              <span>{r}</span>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
