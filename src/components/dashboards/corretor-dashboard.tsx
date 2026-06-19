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
} from "./primitives";

const COLOR = {
  brand: "var(--brand)",
  direction: "var(--direction)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
};

export function CorretorDashboard() {
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
        <KpiCard
          label="Minhas simulações"
          value="58"
          accent={COLOR.brand}
          icon={Users2}
          footer={{ label: "Volume simulado", value: "R$ 41.220.000" }}
        />
        <KpiCard
          label="Minhas aprovações"
          value="22"
          accent={COLOR.success}
          icon={CheckCircle2}
          caption="38% sobre minhas simulações"
          footer={{ label: "Valor aprovado", value: "R$ 15.640.000" }}
        />
        <KpiCard
          label="Minhas reprovações"
          value="11"
          accent={COLOR.direction}
          icon={XCircle}
          caption="19% sobre minhas simulações"
          footer={{ label: "Valor reprovado", value: "R$ 7.860.000" }}
        />
        <KpiCard
          label="Em andamento"
          value="14"
          accent={COLOR.info}
          icon={Activity}
          footer={{ label: "Valor em andamento", value: "R$ 9.940.000" }}
        />
        <KpiCard
          label="Em tratativas"
          value="7"
          accent={COLOR.warning}
          icon={HandCoins}
          footer={{ label: "Valor em tratativas", value: "R$ 4.860.000" }}
        />
        <KpiCard
          label="Não sequenciadas"
          value="4"
          accent="#6b7280"
          icon={Clock}
          caption="7% sobre minhas simulações"
        />
        <KpiCard
          label="Pendências documentais"
          value="9"
          accent={COLOR.warning}
          icon={FileWarning}
          caption="Distribuídas em 6 clientes"
        />
        <KpiCard
          label="Clientes ativos"
          value="36"
          accent={COLOR.brand}
          icon={UserCheck}
          caption="12 follow-ups pendentes"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Minha evolução mensal" icon={TrendingUp} className="lg:col-span-2">
          <MultiBarChart
            data={[
              { label: "Jan", values: [22, 8, 4, 2] },
              { label: "Fev", values: [28, 11, 5, 3] },
              { label: "Mar", values: [35, 14, 6, 4] },
              { label: "Abr", values: [40, 16, 7, 4] },
              { label: "Mai", values: [46, 18, 8, 5] },
              { label: "Jun", values: [52, 20, 10, 6] },
              { label: "Jul", values: [58, 22, 11, 7] },
            ]}
            series={[
              { color: COLOR.brand, label: "Simulações" },
              { color: COLOR.success, label: "Aprovações" },
              { color: COLOR.direction, label: "Reprovações" },
              { color: COLOR.warning, label: "Tratativas" },
            ]}
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
          />
        </Panel>
        <Panel title="Imobiliário × Home Equity" icon={Building2}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Imobiliário", value: 38, sub: "R$ 27M" },
              { label: "Home Equity", value: 20, sub: "R$ 14M" },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Meu volume por banco">
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Caixa Econômica", value: 18, sub: "R$ 13M" },
              { label: "Itaú", value: 14, sub: "R$ 10M" },
              { label: "Bradesco", value: 11, sub: "R$ 8M" },
              { label: "Santander", value: 9, sub: "R$ 6M" },
              { label: "Inter", value: 6, sub: "R$ 4M" },
            ]}
          />
        </Panel>
        <Panel title="Minhas aprovações por banco">
          <HBarList
            accent={COLOR.success}
            rows={[
              { label: "Caixa Econômica", value: 8 },
              { label: "Itaú", value: 5 },
              { label: "Bradesco", value: 4 },
              { label: "Santander", value: 3 },
              { label: "Inter", value: 2 },
            ]}
          />
        </Panel>
        <Panel title="Minhas reprovações por banco">
          <HBarList
            accent={COLOR.direction}
            rows={[
              { label: "Bradesco", value: 4 },
              { label: "Santander", value: 3 },
              { label: "Itaú", value: 2 },
              { label: "Caixa Econômica", value: 1 },
              { label: "Inter", value: 1 },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Blocos de monitoramento" icon={ClipboardList}>
          <ul className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { l: "Aguardando retorno bancário", v: "9", c: COLOR.info },
              { l: "Com pendência documental", v: "6", c: COLOR.warning },
              { l: "Não sequenciadas", v: "4", c: "#6b7280" },
              { l: "Tratativas sem atualização", v: "3", c: COLOR.warning },
              { l: "Próximas do SLA", v: "2", c: COLOR.direction },
              { l: "Vencidas", v: "1", c: COLOR.direction },
              { l: "Clientes aguardando contato", v: "8", c: COLOR.info },
              { l: "Aprovações recentes", v: "5", c: COLOR.success },
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
              { tone: "critical", title: "1 proposta vencida no SLA", meta: "Cliente: J. Pereira · Bradesco" },
              { tone: "critical", title: "2 aprovações aguardando sua ação", meta: "Confirmar envio de contrato" },
              { tone: "warning", title: "6 documentos pendentes", meta: "6 clientes · 3 com prazo crítico" },
              { tone: "warning", title: "8 clientes sem atualização > 5 dias", meta: "Agendar follow-up" },
              { tone: "info", title: "9 retornos bancários atrasados", meta: "Cobrar acompanhamento" },
              { tone: "info", title: "3 propostas paradas em tratativa", meta: "Sem movimentação há 7+ dias" },
            ]}
          />
        </Panel>
      </div>

      <Panel title="Movimentações recentes" icon={Activity}>
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
                <tr key={r.c} className="hover:bg-secondary/60">
                  <td className="px-3 py-2 font-semibold text-graphite">{r.c}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.p}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.b}</td>
                  <td className="px-3 py-2 font-bold text-graphite">{r.v}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: `var(--${r.st})`,
                        background: `color-mix(in oklab, var(--${r.st}) 12%, transparent)`,
                      }}
                    >
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
