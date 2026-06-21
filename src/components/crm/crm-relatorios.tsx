import { FileBarChart, Download, TrendingUp, Users2, Layers } from "lucide-react";
import {
  PanelHeader,
  FilterBar,
  KpiCard,
  Panel,
  MultiBarChart,
  HBarList,
  Donut,
} from "@/components/dashboards/primitives";
import type { CrmScope } from "./crm-dashboard";
import { useDashboardFilters, PERIODOS } from "@/hooks/use-dashboard-filters";

const COLOR = {
  brand: "var(--brand)",
  direction: "var(--direction)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
};

const reports = [
  "Clientes cadastrados por período",
  "Clientes por origem",
  "Clientes por corretor",
  "Clientes por imobiliária",
  "Clientes por analista",
  "Clientes por status",
  "Clientes por produto",
  "Clientes com documentação pendente",
  "Clientes sem movimentação",
  "Convertidos em simulação",
  "Convertidos em aprovação",
  "Clientes aprovados",
  "Clientes reprovados",
  "Vendedores cadastrados",
  "Imóveis cadastrados",
  "Imóveis por tipo",
  "Imóveis por cidade/UF",
  "Documentos pendentes por categoria",
  "Produtividade por responsável",
  "Conversão por corretor",
  "Conversão por origem",
  "Conversão por produto",
];

export function CrmRelatorios({ scope }: { scope: CrmScope }) {
  const isCorr = scope === "correspondente";
  const { filters, set, reset } = useDashboardFilters({ periodo: "90 dias" });
  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`CRM · ${isCorr ? "Correspondente" : "Corretor"}`}
        title="Relatórios"
        subtitle={`${isCorr ? "Relatórios completos do CRM" : "Relatórios da sua carteira"} — ${filters.periodo} · Produto ${filters.produto} · Origem ${filters.origem} · Status ${filters.status}.`}
        right={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:bg-brand-strong">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
        }
      />

      <FilterBar
        onReset={reset}
        filters={[
          { label: "Período", value: filters.periodo, options: PERIODOS, onChange: set("periodo") },
          { label: "Produto", value: filters.produto, options: ["Todos", "Financiamento Imobiliário", "Home Equity"], onChange: set("produto") },
          { label: "Origem", value: filters.origem, options: ["Todas", "Indicação", "Site", "Imobiliária", "Anúncio", "Parceiro"], onChange: set("origem") },
          ...(isCorr ? [
            { label: "Corretor", value: filters.corretor, options: ["Todos", "Rafael Lima", "Bianca Torres", "Henrique Sá"], onChange: set("corretor") },
            { label: "Imobiliária", value: filters.imobiliaria, options: ["Todas", "Lopes", "Coelho da Fonseca", "RE/MAX", "Brasil Brokers"], onChange: set("imobiliaria") },
          ] : []),
          { label: "Analista", value: filters.analista, options: ["Todos", "Camila Reis", "Pedro Nogueira"], onChange: set("analista") },
          { label: "Status", value: filters.status, options: ["Todos", "Ativo", "Em simulação", "Em aprovação", "Aprovada", "Reprovada", "Pendência docs"], onChange: set("status") },
        ]}
        dateRange={{
          from: filters.customFrom,
          to: filters.customTo,
          onFrom: set("customFrom"),
          onTo: set("customTo"),
          show: filters.periodo === "Personalizado",
        }}
      />


      {/* Resumo */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clientes no período" value={isCorr ? "412" : "62"} accent={COLOR.brand} icon={Users2} caption="+24% vs. período anterior" />
        <KpiCard label="Convertidos em simulação" value={isCorr ? "204" : "31"} accent={COLOR.info} icon={Layers} footer={{ label: "Taxa", value: "49.5%" }} />
        <KpiCard label="Aprovados" value={isCorr ? "61" : "9"} accent={COLOR.success} icon={TrendingUp} footer={{ label: "Taxa", value: "14.8%" }} />
        <KpiCard label="Documentos pendentes" value={isCorr ? "203" : "29"} accent={COLOR.warning} icon={FileBarChart} caption="Concentração em renda e endereço" />
      </section>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Cadastrados × Convertidos × Aprovados" icon={TrendingUp} className="lg:col-span-2">
          <MultiBarChart
            data={[
              { label: "Sem 1", values: [42, 22, 6] },
              { label: "Sem 2", values: [56, 28, 8] },
              { label: "Sem 3", values: [64, 34, 10] },
              { label: "Sem 4", values: [72, 38, 12] },
              { label: "Sem 5", values: [68, 36, 11] },
              { label: "Sem 6", values: [78, 41, 14] },
            ]}
            series={[
              { color: COLOR.brand, label: "Cadastrados" },
              { color: COLOR.info, label: "Em simulação" },
              { color: COLOR.success, label: "Aprovados" },
            ]}
          />
        </Panel>
        <Panel title="Origem dos cadastros">
          <Donut
            centerLabel="Origens"
            centerValue={isCorr ? "412" : "62"}
            segments={[
              { value: 38, color: COLOR.brand, label: "Indicação corretor" },
              { value: 24, color: COLOR.info, label: "Site / formulário" },
              { value: 18, color: COLOR.warning, label: "Parceiro imobiliária" },
              { value: 14, color: COLOR.success, label: "Marketing" },
              { value: 6, color: "#6b7280", label: "Outros" },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Conversão por produto" icon={Layers}>
          <HBarList
            accent={COLOR.brand}
            rows={[
              { label: "Financiamento Imobiliário", value: 18, sub: "18%" },
              { label: "Home Equity", value: 12, sub: "12%" },
            ]}
          />
        </Panel>
        <Panel title={isCorr ? "Produtividade por responsável" : "Sua produtividade"} icon={Users2}>
          <HBarList
            accent={COLOR.info}
            rows={
              isCorr
                ? [
                    { label: "Mariana Lopes", value: 58, sub: "58 fech." },
                    { label: "Rafael Souza", value: 47, sub: "47 fech." },
                    { label: "Camila Duarte", value: 39, sub: "39 fech." },
                    { label: "Bruno Tavares", value: 31, sub: "31 fech." },
                  ]
                : [
                    { label: "Cadastros", value: 62 },
                    { label: "Simulações", value: 31 },
                    { label: "Propostas", value: 18 },
                    { label: "Aprovações", value: 9 },
                  ]
            }
          />
        </Panel>
      </div>

      {/* Catalog of reports */}
      <Panel title="Catálogo de relatórios" icon={FileBarChart}>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <li
              key={r}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-[12px]"
            >
              <span className="font-medium text-graphite">{r}</span>
              <button className="rounded border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40 hover:text-brand">
                Abrir
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
