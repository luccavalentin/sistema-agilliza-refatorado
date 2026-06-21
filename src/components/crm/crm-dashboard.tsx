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
import { useDashboardFilters, PERIODOS } from "@/hooks/use-dashboard-filters";

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
  const isCorr = scope === "correspondente";
  const { filters, set, reset } = useDashboardFilters();

  const drill = (
    title: string,
    value: string,
    count = 16,
    extra?: { banco?: string; status?: string },
  ) =>
    open({
      title,
      subtitle: `CRM · ${isCorr ? "Correspondente" : "Corretor"}`,
      period: filters.periodo,
      kpis: [
        { label: title, value },
        { label: "Período", value: filters.periodo },
        { label: "Escopo", value: isCorr ? "Ecossistema" : "Minha carteira" },
        { label: "Produto", value: filters.produto },
        { label: "Origem", value: filters.origem },
        { label: "Status", value: filters.status },
        ...(isCorr ? [
          { label: "Corretor", value: filters.corretor },
          { label: "Imobiliária", value: filters.imobiliaria },
          { label: "Analista", value: filters.analista },
        ] : []),
        { label: "Registros", value: String(count) },
      ],
      rows: buildMockRows(count, { banco: extra?.banco, status: extra?.status ?? (filters.status !== "Todos" ? filters.status : undefined) }),
    });
  const totalClientes = isCorr ? "1.284" : "186";
  const novosMes = isCorr ? "142" : "21";
  const ativos = isCorr ? "918" : "134";
  const simulacao = isCorr ? "612" : "94";
  const proposta = isCorr ? "284" : "41";
  const aprovados = isCorr ? "181" : "26";
  const reprovados = isCorr ? "87" : "12";
  const semMov = isCorr ? "146" : "18";
  const pendDoc = isCorr ? "203" : "29";

  const baseFilters = [
    { label: "Período", value: filters.periodo, options: PERIODOS, onChange: set("periodo") },
    { label: "Origem", value: filters.origem, options: ["Todas", "Indicação", "Site", "Imobiliária", "Anúncio", "Parceiro"], onChange: set("origem") },
    { label: "Status", value: filters.status, options: ["Todos", "Ativo", "Em simulação", "Em aprovação", "Aprovada", "Reprovada", "Pendência docs"], onChange: set("status") },
    { label: "Produto", value: filters.produto, options: ["Todos", "Financiamento Imobiliário", "Home Equity"], onChange: set("produto") },
    { label: "Cidade", value: filters.cidade, options: ["Todas", "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre"], onChange: set("cidade") },
    { label: "UF", value: filters.uf, options: ["Todas", "SP", "RJ", "MG", "PR", "RS", "SC"], onChange: set("uf") },
  ];
  const corrExtras = [
    { label: "Imobiliária", value: filters.imobiliaria, options: ["Todas", "Lopes", "Coelho da Fonseca", "RE/MAX", "Brasil Brokers"], onChange: set("imobiliaria") },
    { label: "Corretor", value: filters.corretor, options: ["Todos", "Rafael Lima", "Bianca Torres", "Henrique Sá"], onChange: set("corretor") },
    { label: "Analista", value: filters.analista, options: ["Todos", "Camila Reis", "Pedro Nogueira"], onChange: set("analista") },
    { label: "Backoffice", value: filters.backoffice, options: ["Todos", "Lara Mendes", "Felipe Castro"], onChange: set("backoffice") },
    { label: "Comercial", value: filters.comercial, options: ["Todos", "Marina Souza", "Diego Almeida"], onChange: set("comercial") },
  ];
  const filterItems = isCorr ? [...baseFilters, ...corrExtras] : baseFilters;

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow={`CRM de Clientes · ${isCorr ? "Correspondente" : "Corretor"}`}
        title="Dashboard de Clientes"
        subtitle={`${isCorr ? "Base consolidada do ecossistema" : "Sua carteira"} — ${filters.periodo} · Status: ${filters.status} · Produto: ${filters.produto} · Origem: ${filters.origem}.`}
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            {isCorr ? "Escopo total" : "Minha carteira"}
          </span>
        }
      />

      <FilterBar filters={filterItems} onReset={reset} />


      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard label={isCorr ? "Total de clientes" : "Meus clientes"} value={totalClientes} accent={COLOR.brand} icon={Users2} caption="Base ativa cadastrada" onClick={() => drill(isCorr ? "Total de clientes" : "Meus clientes", totalClientes, 24)} />
        <KpiCard label="Cadastrados no mês" value={novosMes} accent={COLOR.info} icon={UserPlus} caption="+18% vs. mês anterior" onClick={() => drill("Cadastrados no mês", novosMes, 18)} />
        <KpiCard label="Clientes ativos" value={ativos} accent={COLOR.success} icon={Activity} caption="Em alguma etapa em curso" onClick={() => drill("Clientes ativos", ativos, 20)} />
        <KpiCard label="Com simulação" value={simulacao} accent={COLOR.brand} icon={Calculator} caption="Taxa de conversão 47.6%" onClick={() => drill("Clientes com simulação", simulacao, 20)} />
        <KpiCard label="Em aprovação" value={proposta} accent={COLOR.warning} icon={Layers} caption="Proposta enviada ao banco" onClick={() => drill("Em aprovação", proposta, 16, { status: "Em análise" })} />
        <KpiCard label="Aprovados" value={aprovados} accent={COLOR.success} icon={CheckCircle2} caption="14.1% da base" onClick={() => drill("Aprovados", aprovados, 16, { status: "Aprovada" })} />
        <KpiCard label="Reprovados" value={reprovados} accent={COLOR.direction} icon={XCircle} caption="6.7% da base" onClick={() => drill("Reprovados", reprovados, 14, { status: "Reprovada" })} />
        <KpiCard label="Sem movimentação" value={semMov} accent="#6b7280" icon={Clock} caption="> 15 dias sem atualização" onClick={() => drill("Sem movimentação", semMov, 12)} />
        <KpiCard label="Documentação pendente" value={pendDoc} accent={COLOR.warning} icon={FileWarning} caption="Distribuídos por categoria" onClick={() => drill("Documentação pendente", pendDoc, 18, { status: "Pendência docs" })} />
        <KpiCard label="Conversão Cadastro→Simulação" value="47.6%" accent={COLOR.brand} icon={TrendingUp} footer={{ label: "Meta", value: "55%" }} onClick={() => drill("Conversão Cadastro→Simulação", "47.6%", 14)} />
        <KpiCard label="Conversão Cadastro→Aprovação" value="14.1%" accent={COLOR.success} icon={TrendingUp} footer={{ label: "Meta", value: "20%" }} onClick={() => drill("Conversão Cadastro→Aprovação", "14.1%", 14)} />
        <KpiCard label="Ticket médio aprovado" value="R$ 692 mil" accent={COLOR.info} icon={Building2} footer={{ label: "Volume aprovado", value: isCorr ? "R$ 125M" : "R$ 18M" }} onClick={() => drill("Ticket médio aprovado", "R$ 692 mil", 16, { status: "Aprovada" })} />
      </section>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução de clientes cadastrados" icon={TrendingUp} className="lg:col-span-2" onClick={() => drill("Evolução de clientes cadastrados", "7 meses", 24)}>
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
            onBarClick={(period, serieLabel, value) => drill(`${serieLabel} · ${period}`, String(value), 14)}
          />
        </Panel>
        <Panel title="Clientes por status" icon={PieChart} onClick={() => drill("Clientes por status", totalClientes, 18)}>
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
            onSegmentClick={(label, value) => drill(`Status · ${label}`, String(value), 14)}
          />
        </Panel>
      </div>

      {/* Funnel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Funil do cliente" icon={Layers} className="lg:col-span-2" onClick={() => drill("Funil do cliente", totalClientes, 20)}>
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
            onStepClick={(label, value) => drill(`Funil · ${label}`, String(value), 16)}
          />
        </Panel>
        <Panel title="Produto de interesse" icon={Building2} onClick={() => drill("Produto de interesse", "1.284", 16)}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Financiamento Imobiliário", value: 824, sub: isCorr ? "824" : "118" },
              { label: "Home Equity", value: 460, sub: isCorr ? "460" : "68" },
            ]}
            onRowClick={(label, value) => drill(`Produto · ${label}`, String(value), 14)}
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
        <Panel title="Clientes por origem" icon={Layers} onClick={() => drill("Clientes por origem", "Origem", 20)}>
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
            onRowClick={(label, value) => drill(`Origem · ${label}`, String(value), 14)}
          />
        </Panel>
        {isCorr ? (
          <Panel title="Clientes por corretor" icon={UserCheck} onClick={() => drill("Clientes por corretor", "Equipe", 20)}>
            <HBarList
              accent={COLOR.info}
              rows={[
                { label: "Mariana Lopes", value: 184 },
                { label: "Rafael Souza", value: 142 },
                { label: "Camila Duarte", value: 118 },
                { label: "Bruno Tavares", value: 96 },
                { label: "Ana Beatriz", value: 74 },
              ]}
              onRowClick={(label, value) => drill(`Corretor · ${label}`, String(value), 14)}
            />
          </Panel>
        ) : (
          <Panel title="Clientes por produto" icon={Building2} onClick={() => drill("Clientes por produto", "Produto", 16)}>
            <HBarList
              accent={COLOR.info}
              rows={[
                { label: "Imob. Novo", value: 64 },
                { label: "Imob. Usado", value: 54 },
                { label: "Home Equity", value: 68 },
              ]}
              onRowClick={(label, value) => drill(`Produto · ${label}`, String(value), 12)}
            />
          </Panel>
        )}
        {isCorr ? (
          <Panel title="Clientes por imobiliária" icon={Building2} onClick={() => drill("Clientes por imobiliária", "Parceiros", 18)}>
            <HBarList
              accent={COLOR.success}
              rows={[
                { label: "Prime Imóveis", value: 248 },
                { label: "Lopes Capital", value: 186 },
                { label: "RE/MAX Centro", value: 142 },
                { label: "Auxiliadora", value: 118 },
                { label: "Independentes", value: 96 },
              ]}
              onRowClick={(label, value) => drill(`Imobiliária · ${label}`, String(value), 14)}
            />
          </Panel>
        ) : (
          <Panel title="Clientes por status" icon={Activity} onClick={() => drill("Clientes por status", "Status", 16)}>
            <HBarList
              accent={COLOR.success}
              rows={[
                { label: "Ativos", value: 134 },
                { label: "Aprovados", value: 26 },
                { label: "Reprovados", value: 12 },
                { label: "Sem mov.", value: 14 },
              ]}
              onRowClick={(label, value) => drill(`Status · ${label}`, String(value), 12)}
            />
          </Panel>
        )}
      </div>

      {/* Geografia + pendências */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Clientes por cidade / UF" icon={MapPin} onClick={() => drill("Clientes por cidade / UF", "Geografia", 22)}>
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
            onRowClick={(label, value) => drill(`Cidade · ${label}`, String(value), 14)}
          />
        </Panel>
        <Panel title="Pendências por tipo" icon={FileWarning} onClick={() => drill("Pendências por tipo", pendDoc, 18, { status: "Pendência docs" })}>
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
            onRowClick={(label, value) => drill(`Pendência · ${label}`, String(value), 14, { status: "Pendência docs" })}
          />
        </Panel>
        <Panel title="Sem movimentação por tempo" icon={Clock} onClick={() => drill("Sem movimentação por tempo", semMov, 16)}>
          <HBarList
            accent="#6b7280"
            rows={[
              { label: "0 — 7 dias", value: 62 },
              { label: "8 — 15 dias", value: 48 },
              { label: "16 — 30 dias", value: 22 },
              { label: "31 — 60 dias", value: 10 },
              { label: "> 60 dias", value: 4 },
            ]}
            onRowClick={(label, value) => drill(`Sem movimentação · ${label}`, String(value), 12)}
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
              <li key={b.l}>
                <button
                  type="button"
                  onClick={() => drill(b.l, b.v, 14)}
                  className="w-full rounded-md border border-border bg-background p-3 text-left hover:border-brand/40"
                  style={{ borderLeftWidth: 3, borderLeftColor: b.c }}
                >
                  <p className="font-semibold text-muted-foreground">{b.l}</p>
                  <p className="mt-1 text-lg font-bold text-graphite">{b.v}</p>
                </button>
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
            onItemClick={(title) => drill(title, "Alerta", 12)}
          />
        </Panel>
      </div>
    </div>
  );
}
