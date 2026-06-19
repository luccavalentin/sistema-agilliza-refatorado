// Relatórios e Métricas Operacionais — dashboard executivo
// com KPIs destacados e gráficos Recharts profissionais.

import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Download, Filter,
  Target, TrendingUp, Users, Wallet,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bancoById, demandas, propostas, simulacoes, tarefas, usuarios,
} from "@/lib/operacional/mock-data";
import { formatBRL } from "@/lib/operacional/formatters";
import { ETAPAS_PROPOSTA } from "@/lib/operacional/types";

type Escopo = "correspondente" | "corretor";

const periodos = ["7 dias", "30 dias", "90 dias", "Ano"];

// Paleta institucional — tokens do sistema
const TOKENS = {
  brand: "#000f9f",
  brandSoft: "#4a55c4",
  direction: "#f5333f",
  directionSoft: "#f8757e",
  success: "#15803d",
  successSoft: "#4ea870",
  warning: "#d97706",
  info: "#2563eb",
  graphite: "#1a1f2e",
  muted: "#6b7280",
  grid: "#e5e7eb",
};
const PALETA = [
  TOKENS.brand, TOKENS.direction, TOKENS.success, TOKENS.warning,
  TOKENS.info, TOKENS.brandSoft, TOKENS.directionSoft, TOKENS.successSoft,
];

export function RelatoriosOperacionais({ escopo }: { escopo: Escopo }) {
  const [periodo, setPeriodo] = useState("30 dias");
  const usuarioAtualId = escopo === "corretor" ? "u-cor-1" : "u-corr-1";

  const props = useMemo(() => (
    escopo === "corretor"
      ? propostas.filter((p) => p.corretorId === usuarioAtualId || p.responsavelId === usuarioAtualId)
      : propostas
  ), [escopo, usuarioAtualId]);

  const sims = useMemo(() => (
    escopo === "corretor"
      ? simulacoes.filter((s) => s.corretorId === usuarioAtualId || s.usuarioId === usuarioAtualId)
      : simulacoes
  ), [escopo, usuarioAtualId]);

  const dems = useMemo(() => (
    escopo === "corretor"
      ? demandas.filter((d) => d.responsavelId === usuarioAtualId || d.participantesIds.includes(usuarioAtualId))
      : demandas
  ), [escopo, usuarioAtualId]);

  // --- KPIs ---
  const totalProp = props.length;
  const totalSim = sims.length;
  const aprovadas = props.filter((p) => p.status === "Aprovada" || p.status === "Finalizada" || p.status === "Contrato emitido").length;
  const conversao = totalSim ? Math.round((totalProp / totalSim) * 100) : 0;
  const taxaAprov = totalProp ? Math.round((aprovadas / totalProp) * 100) : 0;
  const volume = props.reduce((a, p) => a + p.valor, 0);
  const slaVenc = props.filter((p) => new Date(p.slaPrazo).getTime() < Date.now()).length;
  const demConc = dems.filter((d) => d.status === "Concluída").length;
  const tarConc = tarefas.filter((t) => t.status === "Concluída").length;
  const transf = props.filter((p) => p.transferida).length;

  // --- Series ---
  // Evolução (12 meses sintéticos baseados em índice)
  const evolucao = useMemo(() => {
    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return meses.map((m, i) => ({
      mes: m,
      simulacoes: Math.max(2, Math.round((sims.length / 12) * (0.6 + (i % 5) * 0.18))),
      propostas: Math.max(1, Math.round((props.length / 12) * (0.5 + (i % 4) * 0.22))),
      aprovadas: Math.max(0, Math.round((aprovadas / 12) * (0.4 + (i % 6) * 0.2))),
    }));
  }, [sims.length, props.length, aprovadas]);

  // Funil por etapa
  const funil = useMemo(() => ETAPAS_PROPOSTA.map((e, i) => ({
    etapa: e,
    valor: props.filter((p) => p.etapa === e).length,
    fill: PALETA[i % PALETA.length],
  })), [props]);

  // Por banco
  const porBanco = useMemo(() => {
    const ids = Array.from(new Set(props.map((p) => p.bancoId)));
    return ids.map((bid, i) => ({
      banco: bancoById(bid)?.sigla ?? bid,
      propostas: props.filter((p) => p.bancoId === bid).length,
      aprovadas: props.filter((p) => p.bancoId === bid && p.status === "Aprovada").length,
      volume: props.filter((p) => p.bancoId === bid).reduce((a, p) => a + p.valor, 0),
      fill: PALETA[i % PALETA.length],
    }));
  }, [props]);

  // Produto
  const porProduto = useMemo(() => {
    const tipos = ["Financiamento Imobiliário", "Home Equity"] as const;
    return tipos.map((t, i) => ({
      name: t,
      value: props.filter((p) => p.produto === t).length,
      fill: i === 0 ? TOKENS.brand : TOKENS.direction,
    }));
  }, [props]);

  // Produtividade por usuário
  const porUsuario = useMemo(() => (
    usuarios
      .filter((u) => u.papel !== "cliente")
      .map((u) => ({
        nome: u.nome.split(" ")[0],
        simulacoes: simulacoes.filter((s) => s.usuarioId === u.id).length,
        propostas: propostas.filter((p) => p.responsavelId === u.id || p.corretorId === u.id).length,
        demandas: demandas.filter((d) => d.responsavelId === u.id).length,
      }))
      .sort((a, b) => b.propostas + b.simulacoes - (a.propostas + a.simulacoes))
      .slice(0, 6)
  ), []);

  // SLA por etapa (dias médios simulados)
  const slaEtapa = useMemo(() => ETAPAS_PROPOSTA.map((e, i) => ({
    etapa: e.length > 14 ? e.slice(0, 12) + "…" : e,
    dias: 2 + ((i * 3) % 10),
  })), []);

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Operacional · Inteligência"
        title="Relatórios e Métricas Operacionais"
        subtitle={`Dashboard executivo — visão ${escopo === "correspondente" ? "geral da operação" : "individual do corretor"}.`}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              {periodos.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    periodo === p ? "bg-graphite text-white" : "text-muted-foreground hover:text-graphite"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-3.5 w-3.5" /> Filtros
            </Button>
            <Button size="sm" className="gap-1">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
          </div>
        }
      />

      {/* KPIs executivos */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Volume em propostas"
          valor={formatBRL(volume)}
          delta="+12,4%"
          positivo
          icon={<Wallet className="h-4 w-4" />}
          gradient={`linear-gradient(135deg, ${TOKENS.brand}, ${TOKENS.brandSoft})`}
        />
        <KpiCard
          label="Taxa de conversão"
          valor={`${conversao}%`}
          delta="+3,1%"
          positivo
          icon={<TrendingUp className="h-4 w-4" />}
          gradient={`linear-gradient(135deg, ${TOKENS.info}, ${TOKENS.brand})`}
          sub={`${totalSim} sim. → ${totalProp} prop.`}
        />
        <KpiCard
          label="Taxa de aprovação"
          valor={`${taxaAprov}%`}
          delta="+5,8%"
          positivo
          icon={<Target className="h-4 w-4" />}
          gradient={`linear-gradient(135deg, ${TOKENS.success}, ${TOKENS.successSoft})`}
          sub={`${aprovadas} aprovadas`}
        />
        <KpiCard
          label="SLA vencido"
          valor={`${slaVenc}`}
          delta="-2"
          positivo
          icon={<BarChart3 className="h-4 w-4" />}
          gradient={`linear-gradient(135deg, ${TOKENS.direction}, ${TOKENS.warning})`}
          sub={`${transf} transferências`}
        />
      </section>

      {/* Linha do tempo: evolução */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-graphite">Evolução operacional</h2>
            <p className="text-xs text-muted-foreground">Simulações, propostas e aprovações ao longo do ano</p>
          </div>
          <Legenda items={[
            { cor: "#000f9f", label: "Simulações" },
            { cor: "#f5333f", label: "Propostas" },
            { cor: "#15803d", label: "Aprovadas" },
          ]} />
        </header>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucao} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000f9f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#000f9f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5333f" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f5333f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15803d" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="mes" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="simulacoes" stroke="#000f9f" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="propostas" stroke="#f5333f" strokeWidth={2} fill="url(#g2)" />
              <Area type="monotone" dataKey="aprovadas" stroke="#15803d" strokeWidth={2} fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Funil */}
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-graphite">Funil de propostas por etapa</h2>
              <p className="text-xs text-muted-foreground">Distribuição ao longo das 10 etapas</p>
            </div>
            <Badge variant="secondary">{props.length} propostas</Badge>
          </header>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funil} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="etapa" type="category" stroke="#1a1f2e" fontSize={11} tickLine={false} axisLine={false} width={150} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                  {funil.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Produto donut */}
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="mb-4">
            <h2 className="text-sm font-semibold text-graphite">Mix por produto</h2>
            <p className="text-xs text-muted-foreground">Financiamento × Home Equity</p>
          </header>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porProduto}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {porProduto.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {porProduto.map((p) => (
              <li key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.fill }} />
                  {p.name}
                </span>
                <span className="font-semibold text-graphite">{p.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bancos */}
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="mb-4">
            <h2 className="text-sm font-semibold text-graphite">Performance por banco</h2>
            <p className="text-xs text-muted-foreground">Total de propostas e aprovações</p>
          </header>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porBanco} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="banco" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="propostas" name="Propostas" fill="#000f9f" radius={[6, 6, 0, 0]} />
                <Bar dataKey="aprovadas" name="Aprovadas" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* SLA por etapa */}
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="mb-4">
            <h2 className="text-sm font-semibold text-graphite">SLA médio por etapa</h2>
            <p className="text-xs text-muted-foreground">Dias úteis médios em cada etapa</p>
          </header>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slaEtapa} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="etapa" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="dias" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: "#d97706" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Produtividade */}
      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold text-graphite">Produtividade por usuário</h2>
          </div>
          <span className="text-xs text-muted-foreground">Top 6 · {demConc + tarConc} entregas no período</span>
        </header>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porUsuario} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="nome" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="simulacoes" name="Simulações" stackId="a" fill="#000f9f" />
              <Bar dataKey="propostas" name="Propostas" stackId="a" fill="#f5333f" />
              <Bar dataKey="demandas" name="Demandas" stackId="a" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  padding: "8px 10px",
  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
};

function KpiCard({
  label, valor, delta, positivo, icon, gradient, sub,
}: {
  label: string;
  valor: string;
  delta?: string;
  positivo?: boolean;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: gradient }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-graphite">{valor}</p>
            {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-lg text-white shadow-sm" style={{ background: gradient }}>
            {icon}
          </div>
        </div>
        {delta && (
          <div className="mt-3 flex items-center gap-1 text-[11px]">
            {positivo ? (
              <ArrowUpRight className="h-3 w-3" style={{ color: TOKENS.success }} />
            ) : (
              <ArrowDownRight className="h-3 w-3" style={{ color: TOKENS.direction }} />
            )}
            <span className="font-semibold" style={{ color: positivo ? TOKENS.success : TOKENS.direction }}>{delta}</span>
            <span className="text-muted-foreground">vs período anterior</span>
          </div>
        )}
      </div>
    </article>
  );
}

function Legenda({ items }: { items: { cor: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: i.cor }} />
          {i.label}
        </div>
      ))}
    </div>
  );
}
