// Relatórios Financeiros e Métricas Operacionais
// Cruzamento financeiro × operacional (processos, propostas aprovadas, contratos emitidos)
import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend as RLegend,
} from "recharts";
import {
  Download, Filter, Printer, Share2, Save, GitCompare, FileBarChart,
  TrendingUp, CheckCircle2, FileSignature, Activity, Building2, Users, Wallet,
} from "lucide-react";
import { Panel, PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import { propostas, usuarios, clientes, bancos } from "@/lib/operacional/mock-data";
import { formatBRL } from "@/lib/operacional/formatters";
import type { Proposta } from "@/lib/operacional/types";

const TOKENS = {
  brand: "#000f9f", brandSoft: "#4a55c4",
  direction: "#f5333f", directionSoft: "#f8757e",
  success: "#15803d", successSoft: "#4ea870",
  warning: "#d97706", info: "#2563eb",
  graphite: "#1a1f2e", muted: "#6b7280", grid: "#e5e7eb",
};

const PALETTE = [TOKENS.brand, TOKENS.success, TOKENS.warning, TOKENS.info, TOKENS.direction, TOKENS.brandSoft];

// ---- enrich propostas com analista adm/comercial, imobiliária e datas
const IMOBILIARIAS = [
  "Lopes Imóveis", "Coelho da Fonseca", "Auxiliadora Predial",
  "Brasil Brokers", "RE/MAX Master", "Predial Net",
];
const ANALISTAS_ADM = usuarios.filter(u => u.papel === "analista" || u.papel === "backoffice");
const ANALISTAS_COM = usuarios.filter(u => u.papel === "correspondente");

type ProcessoRow = Proposta & {
  cliente: string; cpfCnpj: string; bancoNome: string;
  analistaAdm: string; analistaCom: string; imobiliaria: string;
  corretor: string; dataEntrada: string; aprovadaEm?: string; contratoEm?: string;
  valorFinanciado: number;
};

const enriched: ProcessoRow[] = propostas.map((p, i) => {
  const cli = clientes.find(c => c.id === p.clienteId)!;
  const bank = bancos.find(b => b.id === p.bancoId)!;
  const cor = usuarios.find(u => u.id === p.corretorId);
  const aprovada = ["Aprovada", "Análise jurídica", "Contrato emitido", "Finalizada", "Aguardando banco"].includes(p.status);
  const contrato = ["Contrato emitido", "Finalizada"].includes(p.status);
  return {
    ...p,
    cliente: cli.nome,
    cpfCnpj: cli.cpf ?? cli.cnpj ?? "—",
    bancoNome: bank.sigla,
    analistaAdm: ANALISTAS_ADM[i % ANALISTAS_ADM.length].nome,
    analistaCom: ANALISTAS_COM[i % ANALISTAS_COM.length].nome,
    imobiliaria: IMOBILIARIAS[i % IMOBILIARIAS.length],
    corretor: cor?.nome ?? "—",
    dataEntrada: p.criadaEm,
    aprovadaEm: aprovada ? p.atualizadaEm : undefined,
    contratoEm: contrato ? p.atualizadaEm : undefined,
    valorFinanciado: Math.round(p.valor * 0.78),
  };
});

const PROCESSOS_ANDAMENTO = enriched.filter(p => !["Finalizada", "Reprovada"].includes(p.status) && !p.contratoEm);
const PROPOSTAS_APROVADAS = enriched.filter(p => p.aprovadaEm);
const CONTRATOS_EMITIDOS = enriched.filter(p => p.contratoEm);

// ---- helpers de agregação
const sumBy = <T,>(arr: T[], key: (x: T) => string, val: (x: T) => number) => {
  const m = new Map<string, { name: string; valor: number; qtd: number }>();
  for (const x of arr) {
    const k = key(x);
    const e = m.get(k) ?? { name: k, valor: 0, qtd: 0 };
    e.valor += val(x); e.qtd += 1;
    m.set(k, e);
  }
  return Array.from(m.values()).sort((a, b) => b.valor - a.valor);
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-sm font-semibold text-graphite mb-3">{title}</div>
      <div style={{ width: "100%", height: 240 }}>{children}</div>
    </div>
  );
}

function BarVQ({ data, color = TOKENS.brand, money = true }: { data: { name: string; valor: number; qtd: number }[]; color?: string; money?: boolean }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid stroke={TOKENS.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => money ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
        <Tooltip formatter={(v: number) => money ? formatBRL(v) : String(v)} />
        <Bar dataKey={money ? "valor" : "qtd"} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieVQ({ data }: { data: { name: string; valor: number }[] }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="valor" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => formatBRL(v)} />
        <RLegend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---- componente principal
type Tab = "andamento" | "aprovadas" | "contratos";

export function RelatoriosGerenciais({ escopo }: { escopo: "correspondente" | "corretor" }) {
  const [tab, setTab] = useState<Tab>("andamento");
  const [filtros, setFiltros] = useState({
    periodo: "30 dias", dataInicial: "", dataFinal: "",
    banco: "Todos", produto: "Todos", analistaAdm: "Todos",
    analistaCom: "Todos", imobiliaria: "Todos", corretor: "Todos",
    cliente: "", status: "Todos", fase: "Todos",
    valorMin: "", valorMax: "",
  });
  const [agrupar, setAgrupar] = useState<"banco" | "tipo" | "analistaAdm" | "analistaCom" | "imobiliaria" | "corretor" | "fase" | "status">("banco");
  const [ordenar, setOrdenar] = useState<"valor" | "data" | "banco">("valor");

  const baseSet =
    tab === "andamento" ? PROCESSOS_ANDAMENTO :
    tab === "aprovadas" ? PROPOSTAS_APROVADAS :
    CONTRATOS_EMITIDOS;

  const data = useMemo(() => {
    let d = escopo === "corretor" ? baseSet.filter(p => p.corretorId === "u-cor-1") : baseSet;
    if (filtros.banco !== "Todos") d = d.filter(p => p.bancoNome === filtros.banco);
    if (filtros.produto !== "Todos") d = d.filter(p => p.produto === filtros.produto);
    if (filtros.analistaAdm !== "Todos") d = d.filter(p => p.analistaAdm === filtros.analistaAdm);
    if (filtros.analistaCom !== "Todos") d = d.filter(p => p.analistaCom === filtros.analistaCom);
    if (filtros.imobiliaria !== "Todos") d = d.filter(p => p.imobiliaria === filtros.imobiliaria);
    if (filtros.corretor !== "Todos") d = d.filter(p => p.corretor === filtros.corretor);
    if (filtros.cliente) d = d.filter(p => p.cliente.toLowerCase().includes(filtros.cliente.toLowerCase()));
    if (filtros.status !== "Todos") d = d.filter(p => p.status === filtros.status);
    if (filtros.fase !== "Todos") d = d.filter(p => p.etapa === filtros.fase);
    if (filtros.valorMin) d = d.filter(p => p.valor >= Number(filtros.valorMin));
    if (filtros.valorMax) d = d.filter(p => p.valor <= Number(filtros.valorMax));
    return d;
  }, [baseSet, filtros, escopo]);

  const ordered = useMemo(() => {
    const arr = [...data];
    if (ordenar === "valor") arr.sort((a, b) => b.valor - a.valor);
    if (ordenar === "data") arr.sort((a, b) => +new Date(b.atualizadaEm) - +new Date(a.atualizadaEm));
    if (ordenar === "banco") arr.sort((a, b) => a.bancoNome.localeCompare(b.bancoNome));
    return arr;
  }, [data, ordenar]);

  // KPIs globais (sempre cruzando os 3 conjuntos no escopo)
  const escopoBase = (set: ProcessoRow[]) => escopo === "corretor" ? set.filter(p => p.corretorId === "u-cor-1") : set;
  const andamentoAll = escopoBase(PROCESSOS_ANDAMENTO);
  const aprovadasAll = escopoBase(PROPOSTAS_APROVADAS);
  const contratosAll = escopoBase(CONTRATOS_EMITIDOS);

  const sum = (arr: ProcessoRow[]) => arr.reduce((s, p) => s + p.valor, 0);
  const avg = (arr: ProcessoRow[]) => arr.length ? sum(arr) / arr.length : 0;
  const conversaoApr = andamentoAll.length ? (aprovadasAll.length / (andamentoAll.length + aprovadasAll.length)) * 100 : 0;
  const conversaoCon = aprovadasAll.length ? (contratosAll.length / aprovadasAll.length) * 100 : 0;

  // séries por agrupador no tab atual
  const keyMap: Record<typeof agrupar, (p: ProcessoRow) => string> = {
    banco: p => p.bancoNome, tipo: p => p.produto,
    analistaAdm: p => p.analistaAdm, analistaCom: p => p.analistaCom,
    imobiliaria: p => p.imobiliaria, corretor: p => p.corretor,
    fase: p => p.etapa, status: p => p.status,
  };
  const agg = sumBy(data, keyMap[agrupar], p => p.valor);
  const aggBanco = sumBy(data, p => p.bancoNome, p => p.valor);
  const aggTipo = sumBy(data, p => p.produto, p => p.valor);
  const aggFase = sumBy(data, p => p.etapa, p => p.valor);
  const aggStatus = sumBy(data, p => p.status, p => p.valor);
  const aggAdm = sumBy(data, p => p.analistaAdm, p => p.valor);
  const aggCom = sumBy(data, p => p.analistaCom, p => p.valor);
  const aggImob = sumBy(data, p => p.imobiliaria, p => p.valor);

  // evolução mensal (por atualizadaEm)
  const evolucao = useMemo(() => {
    const m = new Map<string, { name: string; valor: number; qtd: number }>();
    for (const p of data) {
      const d = new Date(p.atualizadaEm);
      const k = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      const e = m.get(k) ?? { name: k, valor: 0, qtd: 0 };
      e.valor += p.valor; e.qtd += 1; m.set(k, e);
    }
    return Array.from(m.values());
  }, [data]);

  const tabConfig: Record<Tab, { title: string; subtitle: string; icon: any; tone: string }> = {
    andamento: { title: "Processos em Andamento", subtitle: "Pipeline operacional ativo", icon: Activity, tone: TOKENS.info },
    aprovadas: { title: "Propostas Aprovadas", subtitle: "Crédito aprovado pelos bancos", icon: CheckCircle2, tone: TOKENS.success },
    contratos: { title: "Contratos Emitidos", subtitle: "Contratos liberados e formalizados", icon: FileSignature, tone: TOKENS.brand },
  };
  const cfg = tabConfig[tab];

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title="Relatórios Financeiros e Métricas Operacionais"
        subtitle="Cruzamento entre dados financeiros e operacionais"
        right={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><GitCompare className="h-4 w-4 mr-1.5" /> Comparar períodos</Button>
            <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-1.5" /> Salvar filtro</Button>
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1.5" /> Compartilhar</Button>
            <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1.5" /> Imprimir</Button>
            <Button size="sm" style={{ background: TOKENS.brand }}><Download className="h-4 w-4 mr-1.5" /> Exportar</Button>
          </div>
        }
      />

      {/* Filtros globais */}
      <Panel title="Filtros" icon={Filter}>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {[
            ["Período", "periodo", ["7 dias", "30 dias", "90 dias", "Ano", "Personalizado"]],
            ["Banco", "banco", ["Todos", ...bancos.map(b => b.sigla)]],
            ["Produto", "produto", ["Todos", "Financiamento Imobiliário", "Home Equity"]],
            ["Analista Adm.", "analistaAdm", ["Todos", ...ANALISTAS_ADM.map(u => u.nome)]],
            ["Analista Comercial", "analistaCom", ["Todos", ...ANALISTAS_COM.map(u => u.nome)]],
            ["Imobiliária", "imobiliaria", ["Todos", ...IMOBILIARIAS]],
            ["Corretor", "corretor", ["Todos", ...usuarios.filter(u => u.papel === "corretor").map(u => u.nome)]],
            ["Status", "status", ["Todos", "Em aprovação", "Aprovada", "Aguardando banco", "Contrato emitido", "Finalizada", "Reprovada"]],
            ["Fase", "fase", ["Todos", "Cadastro básico", "Simulação", "Aprovação", "Documentação completa", "Enviado para o banco", "Contrato emitido"]],
          ].map(([label, key, opts]) => (
            <label key={key as string} className="text-xs space-y-1">
              <div className="text-muted-foreground">{label as string}</div>
              <select
                value={(filtros as any)[key as string]}
                onChange={e => setFiltros(f => ({ ...f, [key as string]: e.target.value }))}
                className="w-full border rounded-md px-2 py-1.5 bg-background text-sm"
              >
                {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <label className="text-xs space-y-1">
            <div className="text-muted-foreground">Data inicial</div>
            <input type="date" value={filtros.dataInicial} onChange={e => setFiltros(f => ({ ...f, dataInicial: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 bg-background text-sm" />
          </label>
          <label className="text-xs space-y-1">
            <div className="text-muted-foreground">Data final</div>
            <input type="date" value={filtros.dataFinal} onChange={e => setFiltros(f => ({ ...f, dataFinal: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 bg-background text-sm" />
          </label>
          <label className="text-xs space-y-1">
            <div className="text-muted-foreground">Cliente</div>
            <input value={filtros.cliente} onChange={e => setFiltros(f => ({ ...f, cliente: e.target.value }))} placeholder="Buscar..." className="w-full border rounded-md px-2 py-1.5 bg-background text-sm" />
          </label>
          <label className="text-xs space-y-1">
            <div className="text-muted-foreground">Valor mínimo</div>
            <input type="number" value={filtros.valorMin} onChange={e => setFiltros(f => ({ ...f, valorMin: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 bg-background text-sm" />
          </label>
          <label className="text-xs space-y-1">
            <div className="text-muted-foreground">Valor máximo</div>
            <input type="number" value={filtros.valorMax} onChange={e => setFiltros(f => ({ ...f, valorMax: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 bg-background text-sm" />
          </label>
        </div>
      </Panel>

      {/* Cards de resumo global */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KpiCard label="Total em andamento" value={String(andamentoAll.length)} icon={Activity} accent={TOKENS.info} />
        <KpiCard label="Valor em andamento" value={formatBRL(sum(andamentoAll))} icon={Wallet} accent={TOKENS.info} />
        <KpiCard label="Total aprovado" value={String(aprovadasAll.length)} icon={CheckCircle2} accent={TOKENS.success} />
        <KpiCard label="Valor aprovado" value={formatBRL(sum(aprovadasAll))} icon={Wallet} accent={TOKENS.success} />
        <KpiCard label="Contratos emitidos" value={String(contratosAll.length)} icon={FileSignature} accent={TOKENS.brand} />
        <KpiCard label="Valor contratado" value={formatBRL(sum(contratosAll))} icon={Wallet} accent={TOKENS.brand} />
        <KpiCard label="Ticket médio processo" value={formatBRL(avg(andamentoAll))} icon={TrendingUp} accent={TOKENS.brandSoft} />
        <KpiCard label="Ticket médio aprovado" value={formatBRL(avg(aprovadasAll))} icon={TrendingUp} accent={TOKENS.successSoft} />
        <KpiCard label="Ticket médio contratado" value={formatBRL(avg(contratosAll))} icon={TrendingUp} accent={TOKENS.brand} />
        <KpiCard label="Conversão Andam.→Apr." value={`${conversaoApr.toFixed(1)}%`} icon={TrendingUp} accent={TOKENS.warning} />
        <KpiCard label="Conversão Apr.→Contrato" value={`${conversaoCon.toFixed(1)}%`} icon={TrendingUp} accent={TOKENS.direction} />
        <KpiCard label="Qtd. bancos ativos" value={String(new Set(enriched.map(p => p.bancoNome)).size)} icon={Building2} accent={TOKENS.graphite} />
      </div>

      {/* Tabs de relatório */}
      <div className="flex gap-2 border-b">
        {(Object.keys(tabConfig) as Tab[]).map(t => {
          const Ico = tabConfig[t].icon;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 -mb-px border-b-2 text-sm font-medium flex items-center gap-2 transition-colors"
              style={{
                borderColor: active ? tabConfig[t].tone : "transparent",
                color: active ? tabConfig[t].tone : TOKENS.muted,
              }}
            >
              <Ico className="h-4 w-4" /> {tabConfig[t].title}
            </button>
          );
        })}
      </div>

      {/* Header do relatório selecionado */}
      <div className="rounded-xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${cfg.tone}, ${TOKENS.brandSoft})` }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">Relatório Gerencial</div>
            <div className="text-xl font-bold">{cfg.title}</div>
            <div className="text-sm opacity-90">{cfg.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">Registros filtrados</div>
            <div className="text-3xl font-bold">{data.length}</div>
            <div className="text-sm opacity-90">{formatBRL(sum(data))}</div>
          </div>
        </div>
      </div>

      {/* Controles de visualização */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Agrupar por:</span>
        {(["banco", "tipo", "analistaAdm", "analistaCom", "imobiliaria", "corretor", "fase", "status"] as const).map(g => (
          <button
            key={g}
            onClick={() => setAgrupar(g)}
            className="px-2.5 py-1 rounded-md text-xs border transition-colors"
            style={{
              background: agrupar === g ? TOKENS.brand : "transparent",
              color: agrupar === g ? "#fff" : TOKENS.graphite,
              borderColor: agrupar === g ? TOKENS.brand : TOKENS.grid,
            }}
          >{g}</button>
        ))}
        <span className="text-xs text-muted-foreground ml-4">Ordenar por:</span>
        {(["valor", "data", "banco"] as const).map(o => (
          <button
            key={o}
            onClick={() => setOrdenar(o)}
            className="px-2.5 py-1 rounded-md text-xs border transition-colors"
            style={{
              background: ordenar === o ? TOKENS.graphite : "transparent",
              color: ordenar === o ? "#fff" : TOKENS.graphite,
              borderColor: ordenar === o ? TOKENS.graphite : TOKENS.grid,
            }}
          >{o}</button>
        ))}
      </div>

      {/* Gráficos do relatório */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={`Valor por ${agrupar}`}><BarVQ data={agg} color={cfg.tone} /></ChartCard>
        <ChartCard title={`Quantidade por ${agrupar}`}><BarVQ data={agg} color={TOKENS.brandSoft} money={false} /></ChartCard>
        <ChartCard title="Valor por banco"><BarVQ data={aggBanco} color={TOKENS.brand} /></ChartCard>
        <ChartCard title="Mix por tipo (Financiamento × Home Equity)"><PieVQ data={aggTipo} /></ChartCard>
        <ChartCard title="Por fase atual"><BarVQ data={aggFase} color={TOKENS.warning} money={false} /></ChartCard>
        <ChartCard title="Por status"><BarVQ data={aggStatus} color={TOKENS.direction} money={false} /></ChartCard>
        <ChartCard title="Por analista administrativo"><BarVQ data={aggAdm} color={TOKENS.info} /></ChartCard>
        <ChartCard title="Por analista comercial"><BarVQ data={aggCom} color={TOKENS.success} /></ChartCard>
        <ChartCard title="Por imobiliária"><BarVQ data={aggImob} color={TOKENS.brandSoft} /></ChartCard>
        <ChartCard title="Evolução mensal">
          <ResponsiveContainer>
            <LineChart data={evolucao}>
              <CartesianGrid stroke={TOKENS.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Line type="monotone" dataKey="valor" stroke={cfg.tone} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tabela detalhada */}
      <Panel title="Detalhamento" icon={FileBarChart}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground border-b">
              <tr>
                {["Cliente", "CPF/CNPJ", "Banco", "Tipo", "Valor", tab === "andamento" ? "Financiado" : tab === "aprovadas" ? "Aprovado em" : "Contrato em",
                  "Analista Adm.", "Analista Com.", "Imobiliária", "Corretor", "Fase", "Status", "Entrada", "Atualização"].map(h => (
                  <th key={h} className="py-2 px-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordered.slice(0, 40).map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/40">
                  <td className="py-2 px-2 font-medium text-graphite">{p.cliente}</td>
                  <td className="py-2 px-2">{p.cpfCnpj}</td>
                  <td className="py-2 px-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: `${TOKENS.brand}15`, color: TOKENS.brand }}>{p.bancoNome}</span></td>
                  <td className="py-2 px-2">{p.produto === "Home Equity" ? "HE" : "Fin."}</td>
                  <td className="py-2 px-2 font-semibold">{formatBRL(p.valor)}</td>
                  <td className="py-2 px-2">
                    {tab === "andamento" ? formatBRL(p.valorFinanciado) :
                     tab === "aprovadas" ? new Date(p.aprovadaEm!).toLocaleDateString("pt-BR") :
                     new Date(p.contratoEm!).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-2 px-2">{p.analistaAdm}</td>
                  <td className="py-2 px-2">{p.analistaCom}</td>
                  <td className="py-2 px-2">{p.imobiliaria}</td>
                  <td className="py-2 px-2">{p.corretor}</td>
                  <td className="py-2 px-2 text-muted-foreground">{p.etapa}</td>
                  <td className="py-2 px-2"><span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: `${cfg.tone}15`, color: cfg.tone }}>{p.status}</span></td>
                  <td className="py-2 px-2 text-muted-foreground">{new Date(p.dataEntrada).toLocaleDateString("pt-BR")}</td>
                  <td className="py-2 px-2 text-muted-foreground">{new Date(p.atualizadaEm).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordered.length > 40 && (
            <div className="text-xs text-muted-foreground text-center py-3">Exibindo 40 de {ordered.length} registros. Use os filtros para refinar ou exporte o relatório completo.</div>
          )}
        </div>
      </Panel>

      {/* Métricas operacionais integradas */}
      <Panel title="Métricas Operacionais Integradas ao Financeiro" icon={TrendingUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Valor em andamento por banco (top)" value={aggBanco[0]?.name ?? "—"} caption={formatBRL(aggBanco[0]?.valor ?? 0)} icon={Building2} accent={TOKENS.info} />
          <KpiCard label="Valor aprovado (escopo)" value={formatBRL(sum(aprovadasAll))} icon={CheckCircle2} accent={TOKENS.success} />
          <KpiCard label="Valor contratado (escopo)" value={formatBRL(sum(contratosAll))} icon={FileSignature} accent={TOKENS.brand} />
          <KpiCard label="Tempo médio até aprovação" value="18 dias" icon={TrendingUp} accent={TOKENS.warning} />
          <KpiCard label="Tempo médio até contrato" value="42 dias" icon={TrendingUp} accent={TOKENS.direction} />
          <KpiCard label="Ticket médio por banco (top)" value={aggBanco[0] ? formatBRL(aggBanco[0].valor / Math.max(1, aggBanco[0].qtd)) : "—"} icon={Wallet} accent={TOKENS.brandSoft} />
          <KpiCard label="Ticket médio por corretor" value={formatBRL(avg(escopoBase(enriched)))} icon={Users} accent={TOKENS.successSoft} />
          <KpiCard label="Ticket médio por imobiliária" value={aggImob[0] ? formatBRL(aggImob[0].valor / Math.max(1, aggImob[0].qtd)) : "—"} icon={Building2} accent={TOKENS.graphite} />
        </div>
      </Panel>
    </div>
  );
}
