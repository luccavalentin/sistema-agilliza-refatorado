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
  UserCheck,
  ShieldAlert,
  FileWarning,
  Layers,
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
} from "./primitives";

const COLOR = {
  brand: "var(--brand)",
  direction: "var(--direction)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
};

export function CorrespondenteDashboard() {
  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Visão Geral · Correspondente"
        title="Painel de Monitoramento"
        subtitle="Visão executiva e operacional consolidada de todo o ecossistema: simulações, aprovações, bancos, corretores e SLA."
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <ShieldAlert className="h-3.5 w-3.5" />
            Escopo total do ecossistema
          </span>
        }
      />

      <FilterBar
        filters={[
          { label: "Período", value: "Últimos 30 dias" },
          { label: "Produto", value: "Todos" },
          { label: "Banco", value: "Todos" },
          { label: "Corretor", value: "Todos" },
          { label: "Status", value: "Todos" },
        ]}
      />

      {/* KPI grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <KpiCard
          label="Simulações"
          value="412"
          accent={COLOR.brand}
          icon={Users2}
          footer={{ label: "Volume simulado", value: "R$ 284.502.000" }}
          sub={[
            { k: "Aprovadas 44%", v: "181" },
            { k: "Reprovadas 21%", v: "87" },
            { k: "Andamento 14%", v: "58" },
            { k: "Tratativas 12%", v: "49" },
          ]}
        />
        <KpiCard
          label="Aprovações"
          value="181"
          accent={COLOR.success}
          icon={CheckCircle2}
          caption="44% sobre o volume simulado do mês"
          footer={{ label: "Valor aprovado", value: "R$ 125.180.000" }}
        />
        <KpiCard
          label="Reprovações"
          value="87"
          accent={COLOR.direction}
          icon={XCircle}
          caption="21% sobre o volume simulado do mês"
          footer={{ label: "Valor reprovado", value: "R$ 59.745.000" }}
        />
        <KpiCard
          label="Em andamento"
          value="58"
          accent={COLOR.info}
          icon={Activity}
          caption="14% sobre o volume simulado do mês"
          footer={{ label: "Valor em andamento", value: "R$ 41.220.000" }}
        />
        <KpiCard
          label="Em tratativas"
          value="49"
          accent={COLOR.warning}
          icon={HandCoins}
          caption="12% sobre o volume simulado do mês"
          footer={{ label: "Valor em tratativas", value: "R$ 33.860.000" }}
        />
        <KpiCard
          label="Não sequenciadas"
          value="37"
          accent="#6b7280"
          icon={Clock}
          caption="9% sobre o volume simulado do mês"
          footer={{ label: "Valor não sequenciado", value: "R$ 24.497.000" }}
        />
      </section>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução mensal" icon={TrendingUp} className="lg:col-span-2">
          <MultiBarChart
            data={[
              { label: "Jan", values: [220, 95, 50, 28] },
              { label: "Fev", values: [260, 110, 60, 32] },
              { label: "Mar", values: [310, 138, 70, 38] },
              { label: "Abr", values: [285, 124, 65, 35] },
              { label: "Mai", values: [340, 152, 75, 42] },
              { label: "Jun", values: [380, 170, 82, 45] },
              { label: "Jul", values: [412, 181, 87, 49] },
            ]}
            series={[
              { color: COLOR.brand, label: "Simulações" },
              { color: COLOR.success, label: "Aprovações" },
              { color: COLOR.direction, label: "Reprovações" },
              { color: COLOR.warning, label: "Tratativas" },
            ]}
          />
        </Panel>
        <Panel title="Distribuição por status" icon={PieChart}>
          <Donut
            centerLabel="Total"
            centerValue="412"
            segments={[
              { value: 181, color: COLOR.success, label: "Aprovadas" },
              { value: 87, color: COLOR.direction, label: "Reprovadas" },
              { value: 58, color: COLOR.info, label: "Andamento" },
              { value: 49, color: COLOR.warning, label: "Tratativas" },
              { value: 37, color: "#6b7280", label: "Não seq." },
            ]}
          />
        </Panel>
      </div>

      {/* Funnel + product comparison */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Funil operacional" icon={Layers} className="lg:col-span-2">
          <Funnel
            steps={[
              { label: "Simulações", value: 412, color: COLOR.brand },
              { label: "Análise bancária", value: 305, color: COLOR.info },
              { label: "Em tratativas", value: 230, color: COLOR.warning },
              { label: "Aprovadas", value: 181, color: COLOR.success },
              { label: "Formalizadas", value: 124, color: "#0a0a4a" },
            ]}
          />
        </Panel>
        <Panel title="Imobiliário × Home Equity" icon={Building2}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Financiamento Imobiliário", value: 268, sub: "R$ 182M" },
              { label: "Home Equity", value: 144, sub: "R$ 102M" },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <p className="font-semibold text-muted-foreground">Ticket médio Imob.</p>
              <p className="font-bold text-graphite">R$ 678 mil</p>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <p className="font-semibold text-muted-foreground">Ticket médio HE</p>
              <p className="font-bold text-graphite">R$ 708 mil</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Banks row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Volume por banco">
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Caixa Econômica", value: 132, sub: "R$ 92M" },
              { label: "Itaú", value: 96, sub: "R$ 67M" },
              { label: "Bradesco", value: 78, sub: "R$ 54M" },
              { label: "Santander", value: 64, sub: "R$ 43M" },
              { label: "Inter", value: 42, sub: "R$ 28M" },
            ]}
          />
        </Panel>
        <Panel title="Aprovações por banco">
          <HBarList
            accent={COLOR.success}
            rows={[
              { label: "Caixa Econômica", value: 64 },
              { label: "Itaú", value: 41 },
              { label: "Bradesco", value: 33 },
              { label: "Santander", value: 26 },
              { label: "Inter", value: 17 },
            ]}
          />
        </Panel>
        <Panel title="Reprovações por banco">
          <HBarList
            accent={COLOR.direction}
            rows={[
              { label: "Bradesco", value: 24 },
              { label: "Santander", value: 21 },
              { label: "Itaú", value: 18 },
              { label: "Caixa Econômica", value: 14 },
              { label: "Inter", value: 10 },
            ]}
          />
        </Panel>
      </div>

      {/* Brokers + bank SLA */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Top corretores · volume simulado" icon={UserCheck}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Mariana Lopes", value: 58, sub: "R$ 41M" },
              { label: "Rafael Souza", value: 47, sub: "R$ 33M" },
              { label: "Camila Duarte", value: 39, sub: "R$ 28M" },
              { label: "Bruno Tavares", value: 31, sub: "R$ 22M" },
              { label: "Ana Beatriz", value: 25, sub: "R$ 18M" },
            ]}
          />
        </Panel>
        <Panel title="Top corretores · volume aprovado" icon={UserCheck}>
          <HBarList
            accent={COLOR.success}
            rows={[
              { label: "Mariana Lopes", value: 28, sub: "R$ 19M" },
              { label: "Rafael Souza", value: 22, sub: "R$ 15M" },
              { label: "Camila Duarte", value: 18, sub: "R$ 12M" },
              { label: "Bruno Tavares", value: 14, sub: "R$ 10M" },
              { label: "Ana Beatriz", value: 11, sub: "R$ 8M" },
            ]}
          />
        </Panel>
        <Panel title="Tempo médio de retorno · banco" icon={Clock}>
          <HBarList
            accent={COLOR.warning}
            rows={[
              { label: "Santander", value: 9, sub: "9 dias" },
              { label: "Bradesco", value: 7, sub: "7 dias" },
              { label: "Itaú", value: 6, sub: "6 dias" },
              { label: "Caixa Econômica", value: 5, sub: "5 dias" },
              { label: "Inter", value: 3, sub: "3 dias" },
            ]}
          />
        </Panel>
      </div>

      {/* Monitoring blocks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Blocos de monitoramento" icon={FileWarning}>
          <ul className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { l: "Aguardando retorno bancário", v: "42", c: COLOR.info },
              { l: "Com pendência documental", v: "28", c: COLOR.warning },
              { l: "Não sequenciadas", v: "37", c: "#6b7280" },
              { l: "Tratativas sem atualização", v: "19", c: COLOR.warning },
              { l: "Próximas do SLA", v: "11", c: COLOR.direction },
              { l: "Vencidas", v: "6", c: COLOR.direction },
            ].map((b) => (
              <li
                key={b.l}
                className="rounded-md border border-border bg-background p-3"
                style={{ borderLeftWidth: 3, borderLeftColor: b.c }}
              >
                <p className="font-semibold text-muted-foreground">{b.l}</p>
                <p className="mt-1 text-lg font-bold text-graphite">{b.v}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Alertas operacionais" icon={ShieldAlert}>
          <AlertList
            items={[
              { tone: "critical", title: "6 propostas vencidas no SLA", meta: "Ação imediata · gestão" },
              { tone: "critical", title: "4 aprovações aguardando ação do correspondente", meta: "Há mais de 48h" },
              { tone: "warning", title: "11 propostas próximas do SLA", meta: "Vencem em 2 dias" },
              { tone: "warning", title: "28 documentos pendentes", meta: "Distribuídos entre 17 clientes" },
              { tone: "info", title: "19 retornos bancários atrasados", meta: "Bradesco e Santander concentram 73%" },
              { tone: "info", title: "23 simulações sem follow-up", meta: "Última atividade > 5 dias" },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
