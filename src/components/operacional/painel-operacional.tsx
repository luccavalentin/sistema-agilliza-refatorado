// Painel Operacional — visão geral do ecossistema.
// Lê dos mocks; estrutura preparada para receber dados reais (Supabase).

import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRightLeft, Banknote, Building2,
  CheckCircle2, Clock, FileCheck2, Filter, Gauge,
  Layers, ListChecks, Sparkles, Target, TrendingUp, Users,
} from "lucide-react";
import {
  AlertList, Donut, FilterBar, Funnel, HBarList,
  KpiCard, MultiBarChart, Panel, PanelHeader,
} from "@/components/dashboards/primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
} from "@/components/dashboards/detail-dialog";
import {
  bancos, clientes, demandas, propostas, simulacoes,
  tarefas, usuarios, usuarioById, bancoById, clienteById,
} from "@/lib/operacional/mock-data";
import { ETAPAS_PROPOSTA } from "@/lib/operacional/types";
import { formatBRL, formatDataHora } from "@/lib/operacional/formatters";

type Escopo = "correspondente" | "corretor";

export function PainelOperacional({
  escopo,
  usuarioAtualId = "u-cor-1",
}: {
  escopo: Escopo;
  usuarioAtualId?: string;
}) {
  return (
    <DashboardDetailProvider>
      <PainelOperacionalInner escopo={escopo} usuarioAtualId={usuarioAtualId} />
    </DashboardDetailProvider>
  );
}

function PainelOperacionalInner({
  escopo,
  usuarioAtualId = "u-cor-1",
}: {
  escopo: Escopo;
  usuarioAtualId?: string;
}) {
  const { open } = useDashboardDetail();
  const drill = (title: string, value: string, count = 16, hint?: { banco?: string; status?: string }) =>
    open({
      title,
      subtitle: `Painel Operacional · ${escopo === "correspondente" ? "Correspondente" : "Corretor"}`,
      period: "Últimos 30 dias",
      kpis: [
        { label: title, value },
        { label: "Período", value: "30 dias" },
        { label: "Escopo", value: escopo === "correspondente" ? "Ecossistema" : "Meus dados" },
        { label: "Registros", value: String(count) },
      ],
      rows: buildMockRows(count, hint),
    });
  const [visao, setVisao] = useState<"geral" | "individual">(
    escopo === "corretor" ? "individual" : "geral",
  );

  // Recorte do escopo
  const props = useMemo(() => {
    if (escopo === "corretor" || visao === "individual") {
      return propostas.filter((p) => p.corretorId === usuarioAtualId || p.responsavelId === usuarioAtualId);
    }
    return propostas;
  }, [escopo, visao, usuarioAtualId]);

  const sims = useMemo(() => {
    if (escopo === "corretor" || visao === "individual") {
      return simulacoes.filter((s) => s.corretorId === usuarioAtualId || s.usuarioId === usuarioAtualId);
    }
    return simulacoes;
  }, [escopo, visao, usuarioAtualId]);

  const dems = useMemo(() => {
    if (escopo === "corretor" || visao === "individual") {
      return demandas.filter((d) =>
        d.responsavelId === usuarioAtualId ||
        d.criadoPorId === usuarioAtualId ||
        d.participantesIds.includes(usuarioAtualId),
      );
    }
    return demandas;
  }, [escopo, visao, usuarioAtualId]);

  const tars = useMemo(
    () => tarefas.filter((t) => t.usuarioId === usuarioAtualId),
    [usuarioAtualId],
  );

  // KPIs
  const totalSim = sims.length;
  const simMes = sims.filter((s) => {
    const d = new Date(s.criadaEm);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const simEmAndamento = sims.filter((s) => s.status === "Em andamento").length;
  const simParaProposta = sims.filter((s) => s.status === "Enviada para proposta").length;

  const totalProp = props.length;
  const propEmAprovacao = props.filter((p) => p.status === "Em aprovação").length;
  const propSequenciadas = props.filter((p) => p.status === "Sequenciada").length;
  const propNaoSeq = props.filter((p) => p.status === "Não sequenciada").length;
  const propAprovadas = props.filter((p) => p.status === "Aprovada").length;
  const propReprovadas = props.filter((p) => p.status === "Reprovada").length;
  const propTratativa = props.filter((p) => p.status === "Em tratativa").length;
  const propDocPend = props.filter((p) => p.status === "Documentação pendente").length;
  const propAguardBanco = props.filter((p) => p.status === "Aguardando banco").length;
  const propJuridica = props.filter((p) => p.status === "Análise jurídica").length;
  const propContrato = props.filter((p) => p.status === "Contrato emitido").length;
  const propFinalizadas = props.filter((p) => p.status === "Finalizada").length;

  const demAbertas = dems.filter((d) => d.status !== "Concluída" && d.status !== "Cancelada").length;
  const demAtrasadas = dems.filter((d) => new Date(d.slaPrazo).getTime() < Date.now() && d.status !== "Concluída").length;
  const demConcluidas = dems.filter((d) => d.status === "Concluída").length;

  const tarPendentes = tars.filter((t) => t.status !== "Concluída").length;
  const tarConcluidas = tars.filter((t) => t.status === "Concluída").length;

  const slaMedio = useMemo(() => {
    if (!props.length) return 0;
    const total = props.reduce((acc, p) => {
      const diff = (new Date(p.slaPrazo).getTime() - Date.now()) / 86400000;
      return acc + diff;
    }, 0);
    return Math.round((total / props.length) * 10) / 10;
  }, [props]);

  // Distribuições para gráficos
  const propPorBanco = useMemo(() => {
    return bancos.map((b) => ({
      label: b.sigla,
      value: props.filter((p) => p.bancoId === b.id).length,
    })).filter((x) => x.value > 0);
  }, [props]);

  const simPorBanco = useMemo(() => {
    // simulação não tem banco direto neste mock — usar cenários se houvesse; aproximamos pelo índice
    return bancos.map((b, i) => ({
      label: b.sigla,
      value: Math.max(1, Math.round((sims.length / bancos.length) * (0.7 + (i % 3) * 0.15))),
    }));
  }, [sims.length]);

  const evolucaoSimPropPorMes = useMemo(() => {
    const meses = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];
    return meses.map((m, idx) => ({
      label: m,
      values: [
        Math.max(2, Math.round(sims.length / 6) + ((idx * 3) % 5)),
        Math.max(1, Math.round(props.length / 6) + ((idx * 2) % 4)),
      ],
    }));
  }, [sims.length, props.length]);

  const distStatusProp = useMemo(() => {
    const palette = ["#001bbf", "#00b35a", "#ff8a00", "#e02323", "#7a7af1", "#0a8fdc"];
    const grupos = [
      { k: "Aprovadas", v: propAprovadas },
      { k: "Em aprovação", v: propEmAprovacao + propSequenciadas },
      { k: "Doc. pendente", v: propDocPend + propTratativa },
      { k: "Reprovadas", v: propReprovadas },
      { k: "Aguardando banco", v: propAguardBanco + propJuridica },
      { k: "Finalizadas", v: propContrato + propFinalizadas },
    ];
    return grupos
      .filter((g) => g.v > 0)
      .map((g, i) => ({ value: g.v, color: palette[i % palette.length], label: g.k }));
  }, [propAprovadas, propEmAprovacao, propSequenciadas, propDocPend, propTratativa, propReprovadas, propAguardBanco, propJuridica, propContrato, propFinalizadas]);

  const distEtapa = useMemo(() => {
    return ETAPAS_PROPOSTA.map((e) => ({
      label: e,
      value: props.filter((p) => p.etapa === e).length,
    })).filter((x) => x.value > 0);
  }, [props]);

  const funilOperacional = useMemo(() => {
    const palette = ["#001bbf", "#0a8fdc", "#7a7af1", "#00b35a", "#ff8a00"];
    const steps = [
      { label: "Simulações", value: totalSim },
      { label: "Propostas", value: totalProp },
      { label: "Em análise banco", value: propAguardBanco + propJuridica },
      { label: "Aprovadas", value: propAprovadas },
      { label: "Contratos", value: propContrato + propFinalizadas },
    ];
    return steps.map((s, i) => ({ ...s, color: palette[i % palette.length] }));
  }, [totalSim, totalProp, propAguardBanco, propJuridica, propAprovadas, propContrato, propFinalizadas]);

  const produtividadeUsuario = useMemo(() => {
    return usuarios
      .filter((u) => u.papel !== "cliente")
      .map((u) => {
        const meus = props.filter((p) => p.responsavelId === u.id || p.corretorId === u.id);
        return { label: u.nome, value: meus.length };
      })
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [props]);

  const finVsHe = useMemo(() => {
    const fin = props.filter((p) => p.produto === "Financiamento Imobiliário").length;
    const he = props.filter((p) => p.produto === "Home Equity").length;
    return [
      { value: fin, color: "#001bbf", label: "Financiamento" },
      { value: he, color: "#ff8a00", label: "Home Equity" },
    ];
  }, [props]);

  // Blocos de monitoramento
  const propParadas = useMemo(
    () => props
      .filter((p) => (Date.now() - new Date(p.atualizadaEm).getTime()) / 86400000 > 5)
      .slice(0, 6),
    [props],
  );

  const propProxSla = useMemo(
    () => props
      .filter((p) => {
        const diff = (new Date(p.slaPrazo).getTime() - Date.now()) / 86400000;
        return diff >= 0 && diff <= 2;
      })
      .slice(0, 6),
    [props],
  );

  const propVencidas = useMemo(
    () => props.filter((p) => new Date(p.slaPrazo).getTime() < Date.now()).slice(0, 6),
    [props],
  );

  const demUrgentes = useMemo(
    () => dems.filter((d) => d.prioridade === "Urgente" || d.prioridade === "Crítica").slice(0, 6),
    [dems],
  );

  const ultSimulacoes = useMemo(
    () => [...sims].sort((a, b) => +new Date(b.criadaEm) - +new Date(a.criadaEm)).slice(0, 5),
    [sims],
  );

  const ultPropMovimentadas = useMemo(
    () => [...props].sort((a, b) => +new Date(b.atualizadaEm) - +new Date(a.atualizadaEm)).slice(0, 5),
    [props],
  );

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="OPERACIONAL"
        title="Painel Operacional"
        subtitle="Monitoramento em tempo real do ecossistema: simulações, propostas, demandas e SLA."
        right={
          escopo === "correspondente" ? (
            <div className="inline-flex rounded-md border border-border bg-card p-0.5 text-xs">
              <button
                onClick={() => setVisao("geral")}
                className={`px-3 py-1.5 rounded ${visao === "geral" ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}
              >Visão geral</button>
              <button
                onClick={() => setVisao("individual")}
                className={`px-3 py-1.5 rounded ${visao === "individual" ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}
              >Visão individual</button>
            </div>
          ) : null
        }
      />

      <FilterBar
        filters={[
          { label: "Período", value: "Últimos 30 dias" },
          { label: "Usuário", value: "Todos" },
          { label: "Corretor", value: "Todos" },
          { label: "Analista", value: "Todos" },
          { label: "Backoffice", value: "Todos" },
          { label: "Banco", value: "Todos" },
          { label: "Produto", value: "Todos" },
          { label: "Status", value: "Todos" },
          { label: "Etapa", value: "Todas" },
          { label: "SLA", value: "Todos" },
          { label: "Prioridade", value: "Todas" },
        ]}
      />

      {/* KPIs principais */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <KpiCard label="Total simulações" value={String(totalSim)} accent="#001bbf" icon={Sparkles}
          sub={[{ k: "Mês", v: String(simMes) }, { k: "Em andamento", v: String(simEmAndamento) }]}
          footer={{ label: "Enviadas para proposta", value: String(simParaProposta) }}
          onClick={() => drill("Total simulações", String(totalSim), 20)}
          onSubClick={(k) => drill(`Simulações · ${k}`, k === "Mês" ? String(simMes) : String(simEmAndamento), 14)} />
        <KpiCard label="Total propostas" value={String(totalProp)} accent="#0a8fdc" icon={FileCheck2}
          sub={[{ k: "Aprovadas", v: String(propAprovadas) }, { k: "Em aprov.", v: String(propEmAprovacao) }]}
          footer={{ label: "Sequenciadas", value: String(propSequenciadas) }}
          onClick={() => drill("Total propostas", String(totalProp), 20)}
          onSubClick={(k) => drill(`Propostas · ${k}`, k === "Aprovadas" ? String(propAprovadas) : String(propEmAprovacao), 14, { status: k === "Aprovadas" ? "Aprovada" : "Em análise" })} />
        <KpiCard label="SLA médio (dias)" value={String(slaMedio)} accent="#ff8a00" icon={Gauge}
          caption="Distância média até o vencimento de SLA por proposta"
          onClick={() => drill("SLA médio", `${slaMedio} dias`, 16)} />
        <KpiCard label="Demandas abertas" value={String(demAbertas)} accent="#7a7af1" icon={Activity}
          sub={[{ k: "Atrasadas", v: String(demAtrasadas) }, { k: "Concluídas", v: String(demConcluidas) }]}
          onClick={() => drill("Demandas abertas", String(demAbertas), 18)}
          onSubClick={(k) => drill(`Demandas · ${k}`, k === "Atrasadas" ? String(demAtrasadas) : String(demConcluidas), 14)} />
      </section>

      {/* KPIs propostas detalhados */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Não sequenciadas" value={String(propNaoSeq)} accent="#e02323" onClick={() => drill("Não sequenciadas", String(propNaoSeq), 12)} />
        <KpiCard label="Em tratativa" value={String(propTratativa)} accent="#ff8a00" onClick={() => drill("Em tratativa", String(propTratativa), 12, { status: "Tratativa" })} />
        <KpiCard label="Doc. pendente" value={String(propDocPend)} accent="#ff8a00" onClick={() => drill("Doc. pendente", String(propDocPend), 12, { status: "Pendência docs" })} />
        <KpiCard label="Aguardando banco" value={String(propAguardBanco)} accent="#0a8fdc" onClick={() => drill("Aguardando banco", String(propAguardBanco), 12, { status: "Em análise" })} />
        <KpiCard label="Análise jurídica" value={String(propJuridica)} accent="#7a7af1" onClick={() => drill("Análise jurídica", String(propJuridica), 10)} />
        <KpiCard label="Contrato emitido" value={String(propContrato)} accent="#00b35a" onClick={() => drill("Contrato emitido", String(propContrato), 12)} />
      </section>

      {/* Tarefas pessoais */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Reprovadas" value={String(propReprovadas)} accent="#e02323" icon={AlertTriangle} onClick={() => drill("Reprovadas", String(propReprovadas), 12, { status: "Reprovada" })} />
        <KpiCard label="Finalizadas" value={String(propFinalizadas)} accent="#00b35a" icon={CheckCircle2} onClick={() => drill("Finalizadas", String(propFinalizadas), 14, { status: "Aprovada" })} />
        <KpiCard label="Tarefas pendentes" value={String(tarPendentes)} accent="#001bbf" icon={ListChecks} onClick={() => drill("Tarefas pendentes", String(tarPendentes), 12)} />
        <KpiCard label="Tarefas concluídas" value={String(tarConcluidas)} accent="#00b35a" icon={CheckCircle2} onClick={() => drill("Tarefas concluídas", String(tarConcluidas), 12)} />
      </section>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução simulações × propostas" icon={TrendingUp} className="lg:col-span-2" onClick={() => drill("Evolução simulações × propostas", String(totalSim + totalProp), 20)}>
          <MultiBarChart
            data={evolucaoSimPropPorMes}
            series={[
              { color: "#001bbf", label: "Simulações" },
              { color: "#00b35a", label: "Propostas" },
            ]}
            onBarClick={(period, serieLabel, value) => drill(`${serieLabel} · ${period}`, String(value), 14)}
          />
        </Panel>
        <Panel title="Funil operacional" icon={Filter} onClick={() => drill("Funil operacional", String(totalProp), 18)}>
          <Funnel steps={funilOperacional} onStepClick={(label, value) => drill(`Funil · ${label}`, String(value), 14)} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Distribuição por status" icon={Layers} onClick={() => drill("Distribuição por status", String(totalProp), 18)}>
          {distStatusProp.length > 0 ? (
            <Donut segments={distStatusProp} centerLabel="Propostas" centerValue={String(totalProp)} onSegmentClick={(label, value) => drill(`Status · ${label}`, String(value), 14)} />
          ) : (
            <p className="text-xs text-muted-foreground">Sem dados.</p>
          )}
        </Panel>
        <Panel title="Distribuição por etapa" icon={Target} onClick={() => drill("Distribuição por etapa", String(totalProp), 18)}>
          <HBarList rows={distEtapa} accent="#001bbf" onRowClick={(label, value) => drill(`Etapa · ${label}`, String(value), 14)} />
        </Panel>
        <Panel title="Financiamento × Home Equity" icon={Building2} onClick={() => drill("Mix de produtos", String(totalProp), 18)}>
          <Donut segments={finVsHe} centerLabel="Mix produtos" centerValue={String(totalProp)} onSegmentClick={(label, value) => drill(`Produto · ${label}`, String(value), 14)} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Propostas por banco" icon={Banknote} onClick={() => drill("Propostas por banco", String(totalProp), 20)}>
          <HBarList rows={propPorBanco} accent="#0a8fdc" onRowClick={(label, value) => drill(`Banco · ${label}`, String(value), 14, { banco: label })} />
        </Panel>
        <Panel title="Simulações por banco" icon={Banknote} onClick={() => drill("Simulações por banco", String(totalSim), 20)}>
          <HBarList rows={simPorBanco} accent="#7a7af1" onRowClick={(label, value) => drill(`Sim · ${label}`, String(value), 14, { banco: label })} />
        </Panel>
        <Panel title="Produtividade por usuário" icon={Users} onClick={() => drill("Produtividade por usuário", String(totalProp), 16)}>
          <HBarList rows={produtividadeUsuario} accent="#00b35a" onRowClick={(label, value) => drill(`Usuário · ${label}`, String(value), 14)} />
        </Panel>
      </div>

      {/* Blocos de monitoramento */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Propostas próximas do SLA" icon={Clock} onClick={() => drill("Propostas próximas do SLA", String(propProxSla.length), 12)}>
          <AlertList
            items={propProxSla.map((p) => ({
              tone: "warning" as const,
              title: `${p.numero} — ${clienteById(p.clienteId)?.nome ?? ""}`,
              meta: `${bancoById(p.bancoId)?.sigla} • ${p.etapa} • vence em ${Math.max(0, Math.round((+new Date(p.slaPrazo) - Date.now()) / 86400000))}d`,
            }))}
            onItemClick={(title) => drill(title, "Próximo do SLA", 8)}
          />
        </Panel>
        <Panel title="Propostas vencidas" icon={AlertTriangle} onClick={() => drill("Propostas vencidas", String(propVencidas.length), 12)}>
          <AlertList
            items={propVencidas.map((p) => ({
              tone: "critical" as const,
              title: `${p.numero} — ${clienteById(p.clienteId)?.nome ?? ""}`,
              meta: `Vencida há ${Math.max(1, Math.round((Date.now() - +new Date(p.slaPrazo)) / 86400000))}d • ${p.etapa}`,
            }))}
            onItemClick={(title) => drill(title, "Vencida", 8)}
          />
        </Panel>
        <Panel title="Propostas paradas" icon={Activity} onClick={() => drill("Propostas paradas", String(propParadas.length), 12)}>
          <AlertList
            items={propParadas.map((p) => ({
              tone: "info" as const,
              title: `${p.numero} — ${clienteById(p.clienteId)?.nome ?? ""}`,
              meta: `Sem movimento há ${Math.round((Date.now() - +new Date(p.atualizadaEm)) / 86400000)}d`,
            }))}
            onItemClick={(title) => drill(title, "Parada", 8)}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Demandas urgentes" icon={AlertTriangle}>
          <AlertList
            items={demUrgentes.map((d) => ({
              tone: d.prioridade === "Crítica" ? ("critical" as const) : ("warning" as const),
              title: d.titulo,
              meta: `${d.tipo} • Resp.: ${usuarioById(d.responsavelId)?.nome ?? "—"}`,
            }))}
          />
        </Panel>
        <Panel title="Últimas simulações" icon={Sparkles}>
          <ul className="divide-y divide-border text-xs">
            {ultSimulacoes.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-graphite">
                    {clienteById(s.clienteId)?.nome ?? "Sem cliente"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {s.produto} • {formatBRL(s.valorImovel ?? s.valorSolicitado ?? 0)}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{formatDataHora(s.criadaEm)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Últimas propostas movimentadas" icon={ArrowRightLeft}>
          <ul className="divide-y divide-border text-xs">
            {ultPropMovimentadas.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-graphite">
                    {p.numero} — {clienteById(p.clienteId)?.nome}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.etapa} • {bancoById(p.bancoId)?.sigla}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{formatDataHora(p.atualizadaEm)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Dados mockados para validação visual. Estrutura pronta para integração com Supabase e serviços bancários.
      </p>
      {/* utiliza referência para evitar lint warning */}
      <span className="hidden">{clientes.length}</span>
    </div>
  );
}
