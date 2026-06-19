import {
  Users2,
  CheckCircle2,
  XCircle,
  Activity,
  HandCoins,
  Clock,
  TrendingUp,
  PieChart,
  Building2,
  FileWarning,
  ShieldAlert,
  Layers,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import {
  PanelHeader,
  FilterBar,
  KpiCard,
  Panel,
  MultiBarChart,
  HBarList,
  Donut,
  Funnel,
  AlertList,
  MonitorBlocks,
} from "./primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
  type DetailContext,
} from "./detail-dialog";

const COLOR = {
  brand: "var(--brand)",
  direction: "var(--direction)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
};

const TOP_BANCOS = [
  { label: "Caixa", meta: "18 propostas · R$ 13M", color: "var(--brand)" },
  { label: "Itaú", meta: "14 propostas · R$ 10M", color: "var(--warning)" },
  { label: "Bradesco", meta: "11 propostas · R$ 8M", color: "var(--direction)" },
  { label: "Santander", meta: "9 propostas · R$ 6M", color: "var(--info)" },
];

function Inner() {
  const { open } = useDashboardDetail();
  const detail = (
    title: string,
    kpis: DetailContext["kpis"],
    count = 12,
    hint?: { banco?: string; status?: string },
  ) =>
    open({
      title,
      subtitle: "Minha carteira — Corretor",
      period: "Últimos 30 dias",
      kpis,
      topGroupLabel: "Principais bancos da carteira",
      top: TOP_BANCOS,
      rows: buildMockRows(count, hint),
    });

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Visão Geral · Corretor"
        title="Painel de Monitoramento"
        subtitle="Indicadores da sua carteira: clientes, simulações, propostas e SLA. Escopo restrito às suas operações."
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <ShieldAlert className="h-3.5 w-3.5" />
            Escopo · minha carteira
          </span>
        }
      />

      <FilterBar
        filters={[
          { label: "Período", value: "Últimos 30 dias" },
          { label: "Produto", value: "Todos" },
          { label: "Banco", value: "Todos" },
          { label: "Status", value: "Todos" },
          { label: "Cliente", value: "Todos" },
        ]}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Minhas simulações" value="58" accent={COLOR.brand} icon={Users2}
          footer={{ label: "Volume simulado", value: "R$ 41.220.000" }}
          onClick={() => detail("Minhas simulações", [
            { label: "Total", value: "58" }, { label: "Média/dia", value: "1,9" },
            { label: "Ticket médio", value: "R$ 710.689" }, { label: "Volume", value: "R$ 41.220.000" },
          ], 18)}
        />
        <KpiCard label="Minhas aprovações" value="22" accent={COLOR.success} icon={CheckCircle2}
          caption="38% sobre minhas simulações"
          footer={{ label: "Valor aprovado", value: "R$ 15.640.000" }}
          onClick={() => detail("Minhas aprovações", [
            { label: "Total", value: "22" }, { label: "Conversão", value: "38%" },
            { label: "Ticket médio", value: "R$ 711.000" }, { label: "Volume", value: "R$ 15.640.000" },
          ], 12, { status: "Aprovada" })}
        />
        <KpiCard label="Minhas reprovações" value="11" accent={COLOR.direction} icon={XCircle}
          caption="19% sobre minhas simulações"
          footer={{ label: "Valor reprovado", value: "R$ 7.860.000" }}
          onClick={() => detail("Minhas reprovações", [
            { label: "Total", value: "11" }, { label: "Taxa", value: "19%" },
            { label: "Ticket médio", value: "R$ 714.545" }, { label: "Volume", value: "R$ 7.860.000" },
          ], 8, { status: "Reprovada" })}
        />
        <KpiCard label="Em andamento" value="14" accent={COLOR.info} icon={Activity}
          footer={{ label: "Valor em andamento", value: "R$ 9.940.000" }}
          onClick={() => detail("Em andamento", [
            { label: "Total", value: "14" }, { label: "Tempo médio", value: "8 dias" },
            { label: "Ticket médio", value: "R$ 710.000" }, { label: "Volume", value: "R$ 9.940.000" },
          ], 10, { status: "Em análise" })}
        />
        <KpiCard label="Em tratativas" value="7" accent={COLOR.warning} icon={HandCoins}
          footer={{ label: "Valor em tratativas", value: "R$ 4.860.000" }}
          onClick={() => detail("Em tratativas", [
            { label: "Total", value: "7" }, { label: "Sem ação > 7d", value: "3" },
            { label: "Ticket médio", value: "R$ 694.286" }, { label: "Volume", value: "R$ 4.860.000" },
          ], 7, { status: "Tratativa" })}
        />
        <KpiCard label="Não sequenciadas" value="4" accent="#6b7280" icon={Clock}
          caption="7% sobre minhas simulações"
          onClick={() => detail("Não sequenciadas", [
            { label: "Total", value: "4" }, { label: "Sem ação > 5d", value: "2" },
            { label: "Ticket médio", value: "—" }, { label: "Período", value: "30 dias" },
          ], 4)}
        />
        <KpiCard label="Pendências documentais" value="9" accent={COLOR.warning} icon={FileWarning}
          caption="Distribuídas em 6 clientes"
          onClick={() => detail("Pendências documentais", [
            { label: "Pendências", value: "9" }, { label: "Clientes", value: "6" },
            { label: "Críticas", value: "3" }, { label: "Período", value: "30 dias" },
          ], 9, { status: "Pendência docs" })}
        />
        <KpiCard label="Clientes ativos" value="36" accent={COLOR.brand} icon={UserCheck}
          caption="12 follow-ups pendentes"
          onClick={() => detail("Clientes ativos", [
            { label: "Total", value: "36" }, { label: "Follow-ups", value: "12" },
            { label: "Novos no mês", value: "8" }, { label: "Em proposta", value: "21" },
          ], 16)}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Minha evolução mensal" icon={TrendingUp} className="lg:col-span-2"
          onClick={() => detail("Minha evolução mensal", [
            { label: "Crescimento", value: "+22%" }, { label: "Melhor mês", value: "Jul · 58" },
            { label: "Média/mês", value: "40" }, { label: "Volume 7m", value: "R$ 280M" },
          ], 20)}
        >
          <MultiBarChart
            data={[
              { label: "Jan", values: [22, 8, 4, 2] }, { label: "Fev", values: [28, 11, 5, 3] },
              { label: "Mar", values: [35, 14, 6, 4] }, { label: "Abr", values: [40, 16, 7, 4] },
              { label: "Mai", values: [46, 18, 8, 5] }, { label: "Jun", values: [52, 20, 10, 6] },
              { label: "Jul", values: [58, 22, 11, 7] },
            ]}
            series={[
              { color: COLOR.brand, label: "Simulações" }, { color: COLOR.success, label: "Aprovações" },
              { color: COLOR.direction, label: "Reprovações" }, { color: COLOR.warning, label: "Tratativas" },
            ]}
            onBarClick={(p, s, v) => detail(`${s} · ${p}`, [
              { label: "Mês", value: p }, { label: "Série", value: s },
              { label: "Total", value: String(v) }, { label: "Volume estimado", value: `R$ ${(v * 710000).toLocaleString("pt-BR")}` },
            ], Math.min(v, 14))}
          />
        </Panel>
        <Panel title="Distribuição da carteira" icon={PieChart}>
          <Donut
            centerLabel="Minhas propostas"
            centerValue="58"
            segments={[
              { value: 22, color: COLOR.success, label: "Aprovadas" },
              { value: 11, color: COLOR.direction, label: "Reprovadas" },
              { value: 14, color: COLOR.info, label: "Andamento" },
              { value: 7, color: COLOR.warning, label: "Tratativas" },
              { value: 4, color: "#6b7280", label: "Não seq." },
            ]}
            onSegmentClick={(label, v) => detail(`Status · ${label}`, [
              { label: "Quantidade", value: String(v) }, { label: "% do total", value: `${Math.round((v / 58) * 100)}%` },
              { label: "Ticket médio", value: "R$ 710.000" }, { label: "Volume", value: `R$ ${(v * 710000).toLocaleString("pt-BR")}` },
            ], Math.min(v, 14), { status: label })}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Funil da minha carteira" icon={Layers} className="lg:col-span-2">
          <Funnel
            steps={[
              { label: "Simulações", value: 58, color: COLOR.brand },
              { label: "Análise bancária", value: 41, color: COLOR.info },
              { label: "Em tratativas", value: 30, color: COLOR.warning },
              { label: "Aprovadas", value: 22, color: COLOR.success },
              { label: "Formalizadas", value: 15, color: "#0a0a4a" },
            ]}
            onStepClick={(label, v) => detail(`Funil · ${label}`, [
              { label: "Quantidade", value: String(v) }, { label: "Conversão", value: `${Math.round((v / 58) * 100)}%` },
              { label: "Ticket médio", value: "R$ 710.000" }, { label: "Volume", value: `R$ ${(v * 710000).toLocaleString("pt-BR")}` },
            ], Math.min(v, 14))}
          />
        </Panel>
        <Panel title="Imobiliário × Home Equity" icon={Building2}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Imobiliário", value: 38, sub: "R$ 27M" },
              { label: "Home Equity", value: 20, sub: "R$ 14M" },
            ]}
            onRowClick={(label, v, sub) => detail(`Produto · ${label}`, [
              { label: "Propostas", value: String(v) }, { label: "Volume", value: sub ?? "" },
              { label: "Ticket médio", value: "R$ 710.000" }, { label: "Aprovação", value: "38%" },
            ], 12)}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Meu volume por banco">
          <HBarList accent={COLOR.brand}
            rows={[
              { label: "Caixa Econômica", value: 18, sub: "R$ 13M" },
              { label: "Itaú", value: 14, sub: "R$ 10M" },
              { label: "Bradesco", value: 11, sub: "R$ 8M" },
              { label: "Santander", value: 9, sub: "R$ 6M" },
              { label: "Inter", value: 6, sub: "R$ 4M" },
            ]}
            onRowClick={(label, v, sub) => detail(`Volume · ${label}`, [
              { label: "Propostas", value: String(v) }, { label: "Volume", value: sub ?? "" },
              { label: "Banco", value: label }, { label: "Ticket médio", value: "R$ 710.000" },
            ], 12, { banco: label })}
          />
        </Panel>
        <Panel title="Minhas aprovações por banco">
          <HBarList accent={COLOR.success}
            rows={[
              { label: "Caixa Econômica", value: 8 }, { label: "Itaú", value: 5 },
              { label: "Bradesco", value: 4 }, { label: "Santander", value: 3 }, { label: "Inter", value: 2 },
            ]}
            onRowClick={(label, v) => detail(`Aprovações · ${label}`, [
              { label: "Aprovações", value: String(v) }, { label: "Banco", value: label },
              { label: "Taxa", value: "38%" }, { label: "Volume", value: `R$ ${(v * 710000).toLocaleString("pt-BR")}` },
            ], v, { banco: label, status: "Aprovada" })}
          />
        </Panel>
        <Panel title="Minhas reprovações por banco">
          <HBarList accent={COLOR.direction}
            rows={[
              { label: "Bradesco", value: 4 }, { label: "Santander", value: 3 },
              { label: "Itaú", value: 2 }, { label: "Caixa Econômica", value: 1 }, { label: "Inter", value: 1 },
            ]}
            onRowClick={(label, v) => detail(`Reprovações · ${label}`, [
              { label: "Reprovações", value: String(v) }, { label: "Banco", value: label },
              { label: "Ticket médio", value: "R$ 710.000" }, { label: "Volume", value: `R$ ${(v * 710000).toLocaleString("pt-BR")}` },
            ], v, { banco: label, status: "Reprovada" })}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Blocos de monitoramento" icon={ClipboardList}>
          <MonitorBlocks
            blocks={[
              { l: "Aguardando retorno bancário", v: "9", c: COLOR.info },
              { l: "Com pendência documental", v: "6", c: COLOR.warning },
              { l: "Não sequenciadas", v: "4", c: "#6b7280" },
              { l: "Tratativas sem atualização", v: "3", c: COLOR.warning },
              { l: "Próximas do SLA", v: "2", c: COLOR.direction },
              { l: "Vencidas", v: "1", c: COLOR.direction },
              { l: "Clientes aguardando contato", v: "8", c: COLOR.info },
              { l: "Aprovações recentes", v: "5", c: COLOR.success },
            ]}
            onBlockClick={(label, value) => detail(label, [
              { label: "Quantidade", value }, { label: "Período", value: "30 dias" },
              { label: "Status", value: label }, { label: "Responsável", value: "Eu" },
            ], Math.max(4, Number(value)))}
          />
        </Panel>
        <Panel title="Alertas operacionais" icon={ShieldAlert}>
          <AlertList
            items={[
              { tone: "critical", title: "1 proposta vencida no SLA", meta: "Cliente: J. Pereira · Bradesco" },
              { tone: "critical", title: "2 aprovações aguardando sua ação", meta: "Confirmar envio de contrato" },
              { tone: "warning", title: "6 documentos pendentes", meta: "6 clientes · 3 com prazo crítico" },
              { tone: "warning", title: "8 clientes sem atualização > 5 dias", meta: "Agendar follow-up" },
              { tone: "info", title: "9 retornos bancários atrasados", meta: "Cobrar acompanhamento" },
              { tone: "info", title: "3 propostas paradas em tratativa", meta: "Sem movimentação há 7+ dias" },
            ]}
            onItemClick={(title) => detail(title, [
              { label: "Período", value: "30 dias" }, { label: "Origem", value: "Alerta" },
              { label: "Status", value: "Pendente" }, { label: "Responsável", value: "Eu" },
            ], 10)}
          />
        </Panel>
      </div>

      <Panel title="Movimentações recentes" icon={Activity}
        onClick={() => detail("Movimentações recentes", [
          { label: "Movimentações", value: "5" }, { label: "Últimas 24h", value: "2" },
          { label: "Volume", value: "R$ 2,37M" }, { label: "Clientes", value: "5" },
        ], 15)}
      >
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Cliente</th>
                <th className="px-3 py-2 font-semibold">Produto</th>
                <th className="px-3 py-2 font-semibold">Banco</th>
                <th className="px-3 py-2 font-semibold">Valor</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Atualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {[
                { c: "João Pereira", p: "Imobiliário", b: "Caixa", v: "R$ 680k", s: "Aprovada", t: "há 2h", st: "success" },
                { c: "Marta Lima", p: "Home Equity", b: "Itaú", v: "R$ 420k", s: "Em análise", t: "há 5h", st: "info" },
                { c: "Carlos Antunes", p: "Imobiliário", b: "Bradesco", v: "R$ 540k", s: "Pendência", t: "ontem", st: "warning" },
                { c: "Aline Costa", p: "Home Equity", b: "Santander", v: "R$ 320k", s: "Reprovada", t: "ontem", st: "direction" },
                { c: "Pedro Henrique", p: "Imobiliário", b: "Inter", v: "R$ 410k", s: "Tratativa", t: "2 dias", st: "warning" },
              ].map((r) => (
                <tr key={r.c} className="cursor-pointer hover:bg-secondary/60"
                  onClick={() => detail(`Cliente · ${r.c}`, [
                    { label: "Produto", value: r.p }, { label: "Banco", value: r.b },
                    { label: "Valor", value: r.v }, { label: "Status", value: r.s },
                  ], 8, { banco: r.b })}
                >
                  <td className="px-3 py-2 font-semibold text-graphite">{r.c}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.p}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.b}</td>
                  <td className="px-3 py-2 font-bold text-graphite">{r.v}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: `var(--${r.st})`, background: `color-mix(in oklab, var(--${r.st}) 12%, transparent)` }}>
                      {r.s}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{r.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function CorretorDashboard() {
  return (
    <DashboardDetailProvider>
      <Inner />
    </DashboardDetailProvider>
  );
}
