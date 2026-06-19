// Relatórios e Métricas Operacionais — agrega indicadores de simulações,
// propostas, demandas, SLA, tarefas, transferências e produtividade.

import { useMemo, useState } from "react";
import { BarChart3, Download, Filter, PieChart, TrendingUp, Users } from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bancoById, demandas, propostas, simulacoes, tarefas, usuarioById, usuarios,
} from "@/lib/operacional/mock-data";
import { formatBRL } from "@/lib/operacional/formatters";
import { ETAPAS_PROPOSTA } from "@/lib/operacional/types";

type Escopo = "correspondente" | "corretor";

const periodos = ["7 dias", "30 dias", "90 dias", "Ano"];

export function RelatoriosOperacionais({ escopo }: { escopo: Escopo }) {
  const [periodo, setPeriodo] = useState("30 dias");
  const usuarioAtualId = escopo === "corretor" ? "u-cor-1" : "u-corr-1";

  const props = useMemo(() => {
    if (escopo === "corretor") {
      return propostas.filter((p) => p.corretorId === usuarioAtualId || p.responsavelId === usuarioAtualId);
    }
    return propostas;
  }, [escopo, usuarioAtualId]);

  const sims = useMemo(() => {
    if (escopo === "corretor") {
      return simulacoes.filter((s) => s.corretorId === usuarioAtualId || s.usuarioId === usuarioAtualId);
    }
    return simulacoes;
  }, [escopo, usuarioAtualId]);

  const dems = useMemo(() => {
    if (escopo === "corretor") {
      return demandas.filter((d) => d.responsavelId === usuarioAtualId || d.participantesIds.includes(usuarioAtualId));
    }
    return demandas;
  }, [escopo, usuarioAtualId]);

  // KPIs
  const totalSim = sims.length;
  const totalProp = props.length;
  const aprovadas = props.filter((p) => p.status === "Aprovada").length;
  const reprovadas = props.filter((p) => p.status === "Reprovada").length;
  const slaVenc = props.filter((p) => new Date(p.slaPrazo).getTime() < Date.now()).length;
  const demConc = dems.filter((d) => d.status === "Concluída").length;
  const tarConc = tarefas.filter((t) => t.status === "Concluída").length;
  const transf = props.filter((p) => p.transferida).length;

  // distribuições
  const porEtapa = ETAPAS_PROPOSTA.map((e) => ({
    label: e,
    valor: props.filter((p) => p.etapa === e).length,
  }));
  const maxEtapa = Math.max(...porEtapa.map((p) => p.valor), 1);

  const porBanco = Array.from(new Set(props.map((p) => p.bancoId))).map((bid) => ({
    label: bancoById(bid)?.sigla ?? bid,
    valor: props.filter((p) => p.bancoId === bid).length,
  }));
  const maxBanco = Math.max(...porBanco.map((p) => p.valor), 1);

  const porUsuario = usuarios
    .filter((u) => u.papel !== "cliente")
    .map((u) => ({
      usuario: u,
      simulacoes: simulacoes.filter((s) => s.usuarioId === u.id).length,
      propostas: propostas.filter((p) => p.responsavelId === u.id || p.corretorId === u.id).length,
      demandas: demandas.filter((d) => d.responsavelId === u.id).length,
    }))
    .sort((a, b) => b.propostas + b.simulacoes - (a.propostas + a.simulacoes))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Operacional · Relatórios"
        title="Relatórios e Métricas Operacionais"
        subtitle={`Dashboards consolidados — visão ${escopo === "correspondente" ? "geral da operação" : "individual do corretor"}.`}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              {periodos.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${periodo === p ? "bg-graphite text-white" : "text-muted-foreground hover:text-graphite"}`}
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

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Simulações" valor={totalSim} accent="#3b82f6" />
        <Kpi label="Propostas" valor={totalProp} accent="#8b5cf6" />
        <Kpi label="Aprovadas" valor={aprovadas} accent="#16a34a" />
        <Kpi label="Reprovadas" valor={reprovadas} accent="#dc2626" />
        <Kpi label="SLA vencido" valor={slaVenc} accent="#f59e0b" />
        <Kpi label="Demandas concluídas" valor={demConc} accent="#0ea5e9" />
        <Kpi label="Tarefas concluídas" valor={tarConc} accent="#14b8a6" />
        <Kpi label="Transferências" valor={transf} accent="#6b7280" />
      </section>

      {/* Distribuição por etapa */}
      <section className="rounded-lg border border-border bg-card p-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold text-graphite">Propostas por etapa do funil</h2>
          </div>
          <Badge variant="secondary">{props.length} propostas</Badge>
        </header>
        <ul className="space-y-2">
          {porEtapa.map((row) => (
            <li key={row.label} className="grid grid-cols-[180px_1fr_40px] items-center gap-3">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(row.valor / maxEtapa) * 100}%` }}
                />
              </div>
              <span className="text-right text-xs font-semibold text-graphite">{row.valor}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por banco */}
        <section className="rounded-lg border border-border bg-card p-5">
          <header className="mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold text-graphite">Propostas por banco</h2>
          </header>
          <ul className="space-y-2">
            {porBanco.map((row) => (
              <li key={row.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-3">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-graphite" style={{ width: `${(row.valor / maxBanco) * 100}%` }} />
                </div>
                <span className="text-right text-xs font-semibold text-graphite">{row.valor}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Produtividade por usuário */}
        <section className="rounded-lg border border-border bg-card p-5">
          <header className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold text-graphite">Produtividade por usuário</h2>
          </header>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Usuário</th>
                <th className="py-2 text-right font-medium">Sim.</th>
                <th className="py-2 text-right font-medium">Prop.</th>
                <th className="py-2 text-right font-medium">Demandas</th>
              </tr>
            </thead>
            <tbody>
              {porUsuario.map((row) => (
                <tr key={row.usuario.id} className="border-b border-border/50">
                  <td className="py-2">
                    <div className="font-medium text-graphite">{row.usuario.nome}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">{row.usuario.papel}</div>
                  </td>
                  <td className="py-2 text-right font-semibold">{row.simulacoes}</td>
                  <td className="py-2 text-right font-semibold">{row.propostas}</td>
                  <td className="py-2 text-right font-semibold">{row.demandas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Volume financeiro */}
      <section className="rounded-lg border border-border bg-card p-5">
        <header className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold text-graphite">Volume financeiro em propostas</h2>
        </header>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Volume total" valor={formatBRL(props.reduce((a, p) => a + p.valor, 0))} />
          <Stat label="Ticket médio" valor={formatBRL(props.length ? props.reduce((a, p) => a + p.valor, 0) / props.length : 0)} />
          <Stat label="Aprovadas (R$)" valor={formatBRL(props.filter((p) => p.status === "Aprovada").reduce((a, p) => a + p.valor, 0))} />
          <Stat label="Em análise (R$)" valor={formatBRL(props.filter((p) => ["Em aprovação", "Aguardando banco", "Análise jurídica"].includes(p.status)).reduce((a, p) => a + p.valor, 0))} />
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, valor, accent }: { label: string; valor: number; accent: string }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-graphite">{valor}</p>
      </div>
    </article>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-graphite">{valor}</p>
    </div>
  );
}
