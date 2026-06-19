import {
  Users2,
  UserPlus,
  Activity,
  Calculator,
  CheckCircle2,
  XCircle,
  FileWarning,
  Clock,
  TrendingUp,
  Layers,
  PieChart,
  Building2,
  UserCheck,
  MapPin,
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
} from "@/components/dashboards/primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
} from "@/components/dashboards/detail-dialog";

const COLOR = {
  brand: "var(--brand)",
  direction: "var(--direction)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
};

export type CrmScope = "correspondente" | "corretor";

export function CrmDashboard({ scope }: { scope: CrmScope }) {
  return (
    <DashboardDetailProvider>
      <CrmDashboardInner scope={scope} />
    </DashboardDetailProvider>
  );
}

function CrmDashboardInner({ scope }: { scope: CrmScope }) {
  const { open } = useDashboardDetail();
  const drill = (
    title: string,
    value: string,
    count = 16,
    extra?: { banco?: string; status?: string },
  ) =>
    open({
      title,
      subtitle: `CRM · ${scope === "correspondente" ? "Correspondente" : "Corretor"}`,
      period: "Últimos 30 dias",
      kpis: [
        { label: title, value },
        { label: "Período", value: "30 dias" },
        { label: "Escopo", value: scope === "correspondente" ? "Ecossistema" : "Minha carteira" },
        { label: "Registros", value: String(count) },
      ],
      rows: buildMockRows(count, extra),
    });
  const isCorr = scope === "correspondente";
  const totalClientes = isCorr ? "1.284" : "186";
  const novosMes = isCorr ? "142" : "21";
  const ativos = isCorr ? "918" : "134";
  const simulacao = isCorr ? "612" : "94";
  const proposta = isCorr ? "284" : "41";
  const aprovados = isCorr ? "181" : "26";
  const reprovados = isCorr ? "87" : "12";
  const semMov = isCorr ? "146" : "18";
  const pendDoc = isCorr ? "203" : "29";

  const filters = isCorr
    ? [
        { label: "Período", value: "Últimos 30 dias" },
        { label: "Origem", value: "Todas" },
        { label: "Imobiliária", value: "Todas" },
        { label: "Corretor", value: "Todos" },
        { label: "Analista", value: "Todos" },
        { label: "Backoffice", value: "Todos" },
        { label: "Comercial", value: "Todos" },
        { label: "Status", value: "Todos" },
        { label: "Produto", value: "Todos" },
        { label: "Cidade", value: "Todas" },
        { label: "UF", value: "Todas" },
      ]
    : [
        { label: "Período", value: "Últimos 30 dias" },
        { label: "Origem", value: "Todas" },
        { label: "Status", value: "Todos" },
        { label: "Produto", value: "Todos" },
        { label: "Cidade", value: "Todas" },
        { label: "UF", value: "Todas" },
      ];

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow={`CRM de Clientes · ${isCorr ? "Correspondente" : "Corretor"}`}
        title="Dashboard de Clientes"
        subtitle={
          isCorr
            ? "Visão consolidada de toda a base de clientes do ecossistema, vínculos operacionais e conversão."
            : "Visão da sua carteira: clientes vinculados a você, vínculos operacionais e conversão."
        }
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            {isCorr ? "Escopo total" : "Minha carteira"}
          </span>
        }
      />

      <FilterBar filters={filters} />

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard label={isCorr ? "Total de clientes" : "Meus clientes"} value={totalClientes} accent={COLOR.brand} icon={Users2} caption="Base ativa cadastrada" />
        <KpiCard label="Cadastrados no mês" value={novosMes} accent={COLOR.info} icon={UserPlus} caption="+18% vs. mês anterior" />
        <KpiCard label="Clientes ativos" value={ativos} accent={COLOR.success} icon={Activity} caption="Em alguma etapa em curso" />
        <KpiCard label="Com simulação" value={simulacao} accent={COLOR.brand} icon={Calculator} caption="Taxa de conversão 47.6%" />
        <KpiCard label="Em aprovação" value={proposta} accent={COLOR.warning} icon={Layers} caption="Proposta enviada ao banco" />
        <KpiCard label="Aprovados" value={aprovados} accent={COLOR.success} icon={CheckCircle2} caption="14.1% da base" />
        <KpiCard label="Reprovados" value={reprovados} accent={COLOR.direction} icon={XCircle} caption="6.7% da base" />
        <KpiCard label="Sem movimentação" value={semMov} accent="#6b7280" icon={Clock} caption="> 15 dias sem atualização" />
        <KpiCard label="Documentação pendente" value={pendDoc} accent={COLOR.warning} icon={FileWarning} caption="Distribuídos por categoria" />
        <KpiCard
          label="Conversão Cadastro→Simulação"
          value="47.6%"
          accent={COLOR.brand}
          icon={TrendingUp}
          footer={{ label: "Meta", value: "55%" }}
        />
        <KpiCard
          label="Conversão Cadastro→Aprovação"
          value="14.1%"
          accent={COLOR.success}
          icon={TrendingUp}
          footer={{ label: "Meta", value: "20%" }}
        />
        <KpiCard
          label="Ticket médio aprovado"
          value="R$ 692 mil"
          accent={COLOR.info}
          icon={Building2}
          footer={{ label: "Volume aprovado", value: isCorr ? "R$ 125M" : "R$ 18M" }}
        />
      </section>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução de clientes cadastrados" icon={TrendingUp} className="lg:col-span-2">
          <MultiBarChart
            data={[
              { label: "Jan", values: [78, 41, 12] },
              { label: "Fev", values: [92, 48, 14] },
              { label: "Mar", values: [110, 56, 18] },
              { label: "Abr", values: [98, 52, 16] },
              { label: "Mai", values: [124, 64, 22] },
              { label: "Jun", values: [138, 72, 24] },
              { label: "Jul", values: [142, 78, 26] },
            ]}
            series={[
              { color: COLOR.brand, label: "Cadastrados" },
              { color: COLOR.info, label: "Com simulação" },
              { color: COLOR.success, label: "Aprovados" },
            ]}
          />
        </Panel>
        <Panel title="Clientes por status" icon={PieChart}>
          <Donut
            centerLabel="Total"
            centerValue={totalClientes}
            segments={[
              { value: 918, color: COLOR.success, label: "Ativos" },
              { value: 181, color: COLOR.brand, label: "Aprovados" },
              { value: 87, color: COLOR.direction, label: "Reprovados" },
              { value: 146, color: "#6b7280", label: "Sem mov." },
              { value: 203, color: COLOR.warning, label: "Pend. doc." },
            ]}
          />
        </Panel>
      </div>

      {/* Funnel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Funil do cliente" icon={Layers} className="lg:col-span-2">
          <Funnel
            steps={[
              { label: "Cadastrado", value: isCorr ? 1284 : 186, color: COLOR.brand },
              { label: "Documentação iniciada", value: isCorr ? 980 : 142, color: "#0a0a4a" },
              { label: "Simulação criada", value: isCorr ? 612 : 94, color: COLOR.info },
              { label: "Proposta enviada", value: isCorr ? 412 : 60, color: COLOR.warning },
              { label: "Em análise", value: isCorr ? 284 : 41, color: "#a16207" },
              { label: "Aprovado", value: isCorr ? 181 : 26, color: COLOR.success },
              { label: "Reprovado", value: isCorr ? 87 : 12, color: COLOR.direction },
            ]}
          />
        </Panel>
        <Panel title="Produto de interesse" icon={Building2}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Financiamento Imobiliário", value: 824, sub: isCorr ? "824" : "118" },
              { label: "Home Equity", value: 460, sub: isCorr ? "460" : "68" },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <p className="font-semibold text-muted-foreground">Ticket Imob.</p>
              <p className="font-bold text-graphite">R$ 678 mil</p>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <p className="font-semibold text-muted-foreground">Ticket HE</p>
              <p className="font-bold text-graphite">R$ 708 mil</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Distribuição por vínculos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Clientes por origem" icon={Layers}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Indicação corretor", value: 412 },
              { label: "Site / formulário", value: 286 },
              { label: "Parceiro imobiliária", value: 241 },
              { label: "Marketing pago", value: 184 },
              { label: "Indicação cliente", value: 96 },
              { label: "Outros", value: 65 },
            ]}
          />
        </Panel>
        {isCorr ? (
          <Panel title="Clientes por corretor" icon={UserCheck}>
            <HBarList
              accent={COLOR.info}
              rows={[
                { label: "Mariana Lopes", value: 184 },
                { label: "Rafael Souza", value: 142 },
                { label: "Camila Duarte", value: 118 },
                { label: "Bruno Tavares", value: 96 },
                { label: "Ana Beatriz", value: 74 },
              ]}
            />
          </Panel>
        ) : (
          <Panel title="Clientes por produto" icon={Building2}>
            <HBarList
              accent={COLOR.info}
              rows={[
                { label: "Imob. Novo", value: 64 },
                { label: "Imob. Usado", value: 54 },
                { label: "Home Equity", value: 68 },
              ]}
            />
          </Panel>
        )}
        {isCorr ? (
          <Panel title="Clientes por imobiliária" icon={Building2}>
            <HBarList
              accent={COLOR.success}
              rows={[
                { label: "Prime Imóveis", value: 248 },
                { label: "Lopes Capital", value: 186 },
                { label: "RE/MAX Centro", value: 142 },
                { label: "Auxiliadora", value: 118 },
                { label: "Independentes", value: 96 },
              ]}
            />
          </Panel>
        ) : (
          <Panel title="Clientes por status" icon={Activity}>
            <HBarList
              accent={COLOR.success}
              rows={[
                { label: "Ativos", value: 134 },
                { label: "Aprovados", value: 26 },
                { label: "Reprovados", value: 12 },
                { label: "Sem mov.", value: 14 },
              ]}
            />
          </Panel>
        )}
      </div>

      {/* Geografia + pendências */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Clientes por cidade / UF" icon={MapPin}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "São Paulo — SP", value: 412 },
              { label: "Campinas — SP", value: 184 },
              { label: "Rio de Janeiro — RJ", value: 142 },
              { label: "Belo Horizonte — MG", value: 118 },
              { label: "Curitiba — PR", value: 96 },
              { label: "Porto Alegre — RS", value: 74 },
            ]}
          />
        </Panel>
        <Panel title="Pendências por tipo" icon={FileWarning}>
          <HBarList
            accent={COLOR.warning}
            rows={[
              { label: "Comprovante de renda", value: 84 },
              { label: "RG / CNH", value: 48 },
              { label: "Comprovante de endereço", value: 36 },
              { label: "Certidão de casamento", value: 22 },
              { label: "Matrícula do imóvel", value: 18 },
              { label: "IPTU / Escritura", value: 14 },
            ]}
          />
        </Panel>
        <Panel title="Sem movimentação por tempo" icon={Clock}>
          <HBarList
            accent="#6b7280"
            rows={[
              { label: "0 — 7 dias", value: 62 },
              { label: "8 — 15 dias", value: 48 },
              { label: "16 — 30 dias", value: 22 },
              { label: "31 — 60 dias", value: 10 },
              { label: "> 60 dias", value: 4 },
            ]}
          />
        </Panel>
      </div>

      {/* Blocos de monitoramento */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Blocos de monitoramento" icon={FileWarning}>
          <ul className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { l: "Clientes recentes", v: "42", c: COLOR.brand },
              { l: "Sem responsável", v: "11", c: COLOR.direction },
              { l: "Sem documentação", v: "73", c: COLOR.warning },
              { l: "Pendência crítica", v: "9", c: COLOR.direction },
              { l: "Sem follow-up", v: "27", c: COLOR.warning },
              { l: "Aguardando simulação", v: "48", c: COLOR.info },
              { l: "Aguardando aprovação", v: "34", c: COLOR.warning },
              { l: "Cadastro incompleto", v: "16", c: "#6b7280" },
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

        <Panel title="Alertas do CRM" icon={FileWarning}>
          <AlertList
            items={[
              { tone: "critical", title: "11 clientes sem responsável vinculado", meta: "Atribuir corretor/analista" },
              { tone: "critical", title: "9 clientes com pendência crítica há +5 dias", meta: "Risco de perda de prazo" },
              { tone: "warning", title: "73 clientes com documentação pendente", meta: "Comprovante de renda concentra 46%" },
              { tone: "warning", title: "27 clientes sem follow-up", meta: "Última interação > 10 dias" },
              { tone: "info", title: "48 clientes aguardando simulação", meta: "Pronto para análise" },
              { tone: "info", title: "16 cadastros incompletos", meta: "Concluir antes de simular" },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
