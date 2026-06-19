// Painel Financeiro — Correspondente e Corretor
import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Clock, CheckCircle2, Banknote, Receipt, Users,
  Building2, Download, Filter,
} from "lucide-react";
import { PanelHeader, Panel, KpiCard } from "@/components/dashboards/primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
} from "@/components/dashboards/detail-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  contasReceber, contasPagar, comissoes, recorrencias,
  categoriaById, bancos, propostas, clientes, usuarios,
} from "@/lib/financeiro/mock-data";
import { formatBRL, formatData } from "@/lib/operacional/formatters";

type Escopo = "correspondente" | "corretor";

const TOKENS = {
  brand: "#000f9f", brandSoft: "#4a55c4",
  direction: "#f5333f", directionSoft: "#f8757e",
  success: "#15803d", successSoft: "#4ea870",
  warning: "#d97706", info: "#2563eb",
  graphite: "#1a1f2e", muted: "#6b7280", grid: "#e5e7eb",
};

const filtrosCorr = ["Período", "Mês", "Ano", "Centro de custo", "Categoria", "Banco/Conta", "Corretor", "Imobiliária", "Cliente", "Produto", "Status", "Forma de pagamento"];
const filtrosCor = ["Período", "Produto", "Cliente", "Proposta", "Status", "Categoria", "Forma de pagamento"];

export function PainelFinanceiro({ escopo }: { escopo: Escopo }) {
  return (
    <DashboardDetailProvider>
      <PainelFinanceiroInner escopo={escopo} />
    </DashboardDetailProvider>
  );
}

function PainelFinanceiroInner({ escopo }: { escopo: Escopo }) {
  const { open } = useDashboardDetail();
  const drill = (title: string, value: string, count = 16) =>
    open({
      title,
      subtitle: `Painel Financeiro · ${escopo === "correspondente" ? "Correspondente" : "Corretor"}`,
      period: "Últimos 30 dias",
      kpis: [
        { label: title, value },
        { label: "Período", value: "30 dias" },
        { label: "Escopo", value: escopo === "correspondente" ? "Ecossistema" : "Meus dados" },
        { label: "Registros", value: String(count) },
      ],
      rows: buildMockRows(count),
    });
  const corretorId = "u-cor-1";
  const [periodo, setPeriodo] = useState("30 dias");

  const recDados = useMemo(() => (
    escopo === "corretor" ? contasReceber.filter(r => r.corretorId === corretorId) : contasReceber
  ), [escopo]);
  const pagDados = useMemo(() => (
    escopo === "corretor" ? contasPagar.slice(0, 6) : contasPagar
  ), [escopo]);
  const comDados = useMemo(() => (
    escopo === "corretor" ? comissoes.filter(c => c.corretorId === corretorId) : comissoes
  ), [escopo]);

  const totalReceber = recDados.reduce((s, r) => s + r.valor, 0);
  const totalRecebido = recDados.filter(r => r.status === "Recebido").reduce((s, r) => s + r.valor, 0);
  const totalRecParcial = recDados.filter(r => r.status === "Recebido parcialmente").reduce((s, r) => s + (r.valorPago ?? 0), 0);
  const totalVencidoRec = recDados.filter(r => r.status === "Vencido").reduce((s, r) => s + r.valor, 0);

  const totalPagar = pagDados.reduce((s, p) => s + p.valor, 0);
  const totalPago = pagDados.filter(p => p.status === "Pago").reduce((s, p) => s + p.valor, 0);
  const totalVencidoPag = pagDados.filter(p => p.status === "Vencido").reduce((s, p) => s + p.valor, 0);

  const receitaMes = totalRecebido + totalRecParcial;
  const despesaMes = totalPago;
  const resultadoMes = receitaMes - despesaMes;
  const margem = receitaMes > 0 ? (resultadoMes / receitaMes) * 100 : 0;

  const comPrev = comDados.filter(c => c.status === "Prevista").reduce((s, c) => s + c.valor, 0);
  const comLib = comDados.filter(c => c.status === "Liberada").reduce((s, c) => s + c.valor, 0);
  const comPaga = comDados.filter(c => c.status === "Paga").reduce((s, c) => s + c.valor, 0);
  const comBloq = comDados.filter(c => c.status === "Bloqueada").reduce((s, c) => s + c.valor, 0);
  const comPend = comDados.filter(c => c.status === "Pendente" || c.status === "Aguardando aprovação").reduce((s, c) => s + c.valor, 0);

  // Fluxo previsto x realizado por mês
  const fluxoData = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses.map((m, i) => ({
      mes: m,
      previsto: 180_000 + i * 14_000 + (i % 3) * 22_000,
      realizado: 165_000 + i * 12_500 + (i % 4) * 18_000,
      despesa: 110_000 + i * 8_000 + (i % 2) * 9_500,
    }));
  }, []);

  // Receita por produto
  const recProduto = useMemo(() => {
    const fi = recDados.filter(r => r.produto === "Financiamento Imobiliário").reduce((s, r) => s + r.valor, 0);
    const he = recDados.filter(r => r.produto === "Home Equity").reduce((s, r) => s + r.valor, 0);
    return [
      { name: "Financiamento", value: fi, color: TOKENS.brand },
      { name: "Home Equity", value: he, color: TOKENS.direction },
    ];
  }, [recDados]);

  // Receita por banco
  const recBanco = useMemo(() => bancos.map((b, i) => ({
    nome: b.sigla,
    valor: recDados.filter(r => propostas.find(p => p.id === r.propostaId)?.bancoId === b.id).reduce((s, r) => s + r.valor, 0),
    cor: [TOKENS.brand, TOKENS.direction, TOKENS.success, TOKENS.warning, TOKENS.info, TOKENS.brandSoft][i % 6],
  })).filter(b => b.valor > 0), [recDados]);

  // Despesa por categoria
  const despCategoria = useMemo(() => {
    const map = new Map<string, number>();
    pagDados.forEach(p => map.set(p.categoriaId, (map.get(p.categoriaId) ?? 0) + p.valor));
    return Array.from(map.entries()).map(([id, valor]) => {
      const c = categoriaById(id);
      return { nome: c?.nome ?? id, valor, cor: c?.cor ?? TOKENS.muted };
    }).sort((a, b) => b.valor - a.valor);
  }, [pagDados]);

  // Próximos recebimentos / pagamentos
  const proximosRec = recDados.filter(r => r.status === "Em aberto" && new Date(r.vencimento) > new Date()).slice(0, 6);
  const proximosPag = pagDados.filter(p => p.status === "Em aberto" || p.status === "Agendado").slice(0, 6);
  const vencidosRec = recDados.filter(r => r.status === "Vencido").slice(0, 5);
  const vencidosPag = pagDados.filter(p => p.status === "Vencido").slice(0, 5);

  const cards = escopo === "correspondente" ? [
    { label: "Saldo Previsto", value: formatBRL(receitaMes - despesaMes + 280_000), accent: TOKENS.brand, icon: Wallet },
    { label: "Total a Receber", value: formatBRL(totalReceber), accent: TOKENS.success, icon: ArrowDownRight, sub: [{ k: "Recebido", v: formatBRL(totalRecebido) }, { k: "Vencido", v: formatBRL(totalVencidoRec) }] },
    { label: "Total a Pagar", value: formatBRL(totalPagar), accent: TOKENS.direction, icon: ArrowUpRight, sub: [{ k: "Pago", v: formatBRL(totalPago) }, { k: "Vencido", v: formatBRL(totalVencidoPag) }] },
    { label: "Resultado do Mês", value: formatBRL(resultadoMes), accent: resultadoMes >= 0 ? TOKENS.success : TOKENS.direction, icon: TrendingUp, caption: `Margem ${margem.toFixed(1)}%` },
    { label: "Comissões Pagas", value: formatBRL(comPaga), accent: TOKENS.info, icon: Banknote, sub: [{ k: "Liberadas", v: formatBRL(comLib) }, { k: "Pendentes", v: formatBRL(comPend) }] },
    { label: "Comissões Bloqueadas", value: formatBRL(comBloq), accent: TOKENS.warning, icon: AlertTriangle, caption: `${comDados.filter(c => c.bloqueada).length} comissões` },
    { label: "Inadimplência", value: formatBRL(totalVencidoRec), accent: TOKENS.direction, icon: TrendingDown, caption: `${recDados.filter(r => r.status === "Vencido").length} títulos` },
    { label: "Projeção de Caixa (30d)", value: formatBRL(receitaMes * 1.18 - despesaMes * 1.05), accent: TOKENS.brandSoft, icon: TrendingUp },
  ] : [
    { label: "Meus Recebíveis", value: formatBRL(totalReceber), accent: TOKENS.brand, icon: Wallet },
    { label: "Recebido", value: formatBRL(totalRecebido), accent: TOKENS.success, icon: CheckCircle2 },
    { label: "Pendentes", value: formatBRL(totalReceber - totalRecebido - totalVencidoRec), accent: TOKENS.info, icon: Clock },
    { label: "Vencidos", value: formatBRL(totalVencidoRec), accent: TOKENS.direction, icon: AlertTriangle },
    { label: "Minhas Comissões Previstas", value: formatBRL(comPrev), accent: TOKENS.brandSoft, icon: Banknote },
    { label: "Comissões Liberadas", value: formatBRL(comLib), accent: TOKENS.info, icon: CheckCircle2 },
    { label: "Comissões Pagas", value: formatBRL(comPaga), accent: TOKENS.success, icon: Banknote },
    { label: "Comissões Bloqueadas", value: formatBRL(comBloq), accent: TOKENS.warning, icon: AlertTriangle, caption: comBloq > 0 ? "Aguardando confirmação" : "Sem bloqueios" },
  ];

  const filtros = escopo === "correspondente" ? filtrosCorr : filtrosCor;

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title={escopo === "correspondente" ? "Painel Financeiro" : "Meu Painel Financeiro"}
        subtitle={escopo === "correspondente"
          ? "Visão geral do ecossistema: receitas, despesas, comissões e fluxo de caixa."
          : "Acompanhe seus recebíveis, comissões e resultado pessoal."}
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              {["7 dias", "30 dias", "90 dias", "Ano"].map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${periodo === p ? "bg-brand text-white" : "text-muted-foreground hover:text-graphite"}`}>
                  {p}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filtros</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
          </div>
        }
      />

      {/* Filtros chips */}
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-3">
        {filtros.map(f => (
          <button key={f} className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-graphite hover:border-brand/40">
            {f}<span className="text-muted-foreground">▾</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* KPIs por natureza de lançamento */}
      <Panel title="Resumo por natureza do lançamento" icon={Receipt}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(() => {
            const sumN = (arr: typeof recDados, n: string) => arr.filter(r => r.natureza === n).reduce((s, r) => s + r.valor, 0);
            const recEsp = sumN(recDados, "Esporádico");
            const recRec = sumN(recDados, "Recorrente");
            const recParc = sumN(recDados, "Parcelado");
            const pagEsp = sumN(pagDados, "Esporádico");
            const pagRec = sumN(pagDados, "Recorrente");
            const pagParc = sumN(pagDados, "Parcelado");
            return (
              <>
                <KpiCard label="Esporádico a receber" value={formatBRL(recEsp)} accent={TOKENS.muted} icon={Receipt} />
                <KpiCard label="Recorrente a receber" value={formatBRL(recRec)} accent={TOKENS.brand} icon={Clock} />
                <KpiCard label="Parcelado a receber" value={formatBRL(recParc)} accent={TOKENS.info} icon={Receipt} />
                <KpiCard label="Esporádico a pagar" value={formatBRL(pagEsp)} accent={TOKENS.muted} icon={Receipt} />
                <KpiCard label="Recorrente a pagar" value={formatBRL(pagRec)} accent={TOKENS.direction} icon={Clock} />
                <KpiCard label="Parcelado a pagar" value={formatBRL(pagParc)} accent={TOKENS.warning} icon={Receipt} />
              </>
            );
          })()}
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="rounded-md border border-border p-3"><div className="text-muted-foreground">Recorrências ativas</div><div className="font-bold text-graphite text-base mt-0.5">{[...recDados, ...pagDados].filter(d => d.natureza === "Recorrente").length}</div></div>
          <div className="rounded-md border border-border p-3"><div className="text-muted-foreground">Recorrências pausadas</div><div className="font-bold text-graphite text-base mt-0.5">{recorrencias.filter(r => r.status === "Pausada").length}</div></div>
          <div className="rounded-md border border-border p-3"><div className="text-muted-foreground">Parcelamentos ativos</div><div className="font-bold text-graphite text-base mt-0.5">{new Set([...recDados, ...pagDados].filter(d => d.parcelamento).map(d => d.parcelamento!.grupoId)).size}</div></div>
          <div className="rounded-md border border-border p-3"><div className="text-muted-foreground">Parcelas vencidas</div><div className="font-bold text-graphite text-base mt-0.5">{[...recDados, ...pagDados].filter(d => d.parcelamento && d.status === "Vencido").length}</div></div>
          <div className="rounded-md border border-border p-3"><div className="text-muted-foreground">Próximas recorrências (30d)</div><div className="font-bold text-graphite text-base mt-0.5">{[...recDados, ...pagDados].filter(d => d.natureza === "Recorrente" && new Date(d.vencimento).getTime() - Date.now() < 30 * 86400000 && new Date(d.vencimento).getTime() > Date.now()).length}</div></div>
          <div className="rounded-md border border-border p-3"><div className="text-muted-foreground">Próximas parcelas (30d)</div><div className="font-bold text-graphite text-base mt-0.5">{[...recDados, ...pagDados].filter(d => d.natureza === "Parcelado" && new Date(d.vencimento).getTime() - Date.now() < 30 * 86400000 && new Date(d.vencimento).getTime() > Date.now()).length}</div></div>
        </div>
      </Panel>


      {/* Gráficos principais */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Fluxo de Caixa: Previsto x Realizado" icon={TrendingUp} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fluxoData}>
              <defs>
                <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TOKENS.brand} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={TOKENS.brand} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TOKENS.success} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={TOKENS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: TOKENS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="previsto" stroke={TOKENS.brand} fill="url(#gPrev)" strokeWidth={2} name="Previsto" />
              <Area type="monotone" dataKey="realizado" stroke={TOKENS.success} fill="url(#gReal)" strokeWidth={2} name="Realizado" />
              <Line type="monotone" dataKey="despesa" stroke={TOKENS.direction} strokeWidth={2} name="Despesa" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Receita por Produto" icon={Receipt}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={recProduto} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {recProduto.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Receita por Banco" icon={Building2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={recBanco} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
              <XAxis type="number" tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: TOKENS.muted }} width={70} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {recBanco.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Despesa por Categoria" icon={TrendingDown}>
          <ResponsiveContainer width="100%" height={260}>
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

      {/* Blocos de monitoramento */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Próximos Recebimentos" icon={ArrowDownRight}>
          <ul className="space-y-2">
            {proximosRec.map(r => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-graphite truncate">{r.descricao}</p>
                  <p className="text-xs text-muted-foreground">Vence {formatData(r.vencimento)} · {r.forma}</p>
                </div>
                <span className="font-bold text-graphite shrink-0">{formatBRL(r.valor)}</span>
              </li>
            ))}
            {proximosRec.length === 0 && <p className="text-sm text-muted-foreground">Sem recebimentos próximos.</p>}
          </ul>
        </Panel>

        <Panel title="Próximos Pagamentos" icon={ArrowUpRight}>
          <ul className="space-y-2">
            {proximosPag.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-graphite truncate">{p.descricao}</p>
                  <p className="text-xs text-muted-foreground">Vence {formatData(p.vencimento)} · {p.forma}</p>
                </div>
                <span className="font-bold text-graphite shrink-0">{formatBRL(p.valor)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Recebíveis Vencidos" icon={AlertTriangle}>
          <ul className="space-y-2">
            {vencidosRec.map(r => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm" style={{ borderColor: TOKENS.direction + "30", background: TOKENS.direction + "08" }}>
                <div className="min-w-0">
                  <p className="font-semibold text-graphite truncate">{r.descricao}</p>
                  <p className="text-xs" style={{ color: TOKENS.direction }}>Venceu {formatData(r.vencimento)}</p>
                </div>
                <span className="font-bold shrink-0" style={{ color: TOKENS.direction }}>{formatBRL(r.valor)}</span>
              </li>
            ))}
            {vencidosRec.length === 0 && <p className="text-sm text-muted-foreground">Nenhum recebível vencido.</p>}
          </ul>
        </Panel>

        <Panel title="Pagamentos Vencidos" icon={AlertTriangle}>
          <ul className="space-y-2">
            {vencidosPag.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm" style={{ borderColor: TOKENS.warning + "30", background: TOKENS.warning + "08" }}>
                <div className="min-w-0">
                  <p className="font-semibold text-graphite truncate">{p.descricao}</p>
                  <p className="text-xs" style={{ color: TOKENS.warning }}>Venceu {formatData(p.vencimento)}</p>
                </div>
                <span className="font-bold shrink-0" style={{ color: TOKENS.warning }}>{formatBRL(p.valor)}</span>
              </li>
            ))}
            {vencidosPag.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento vencido.</p>}
          </ul>
        </Panel>
      </div>

      {escopo === "correspondente" && (
        <Panel title="Comissões por Corretor" icon={Users}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usuarios.filter(u => u.papel === "corretor").map(u => ({
              nome: u.nome.split(" ")[0],
              previstas: comissoes.filter(c => c.corretorId === u.id && c.status === "Prevista").reduce((s, c) => s + c.valor, 0),
              pagas: comissoes.filter(c => c.corretorId === u.id && c.status === "Paga").reduce((s, c) => s + c.valor, 0),
              pendentes: comissoes.filter(c => c.corretorId === u.id && (c.status === "Pendente" || c.status === "Liberada")).reduce((s, c) => s + c.valor, 0),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.grid} />
              <XAxis dataKey="nome" tick={{ fontSize: 12, fill: TOKENS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: TOKENS.muted }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--card)", border: `1px solid ${TOKENS.grid}`, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="previstas" fill={TOKENS.brandSoft} name="Previstas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendentes" fill={TOKENS.warning} name="Pendentes" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pagas" fill={TOKENS.success} name="Pagas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}
