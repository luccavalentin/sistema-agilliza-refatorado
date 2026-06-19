import {
  FileCheck2,
  FileClock,
  FileX2,
  FileSearch,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  Upload,
} from "lucide-react";
import { PanelHeader, Panel } from "./primitives";

const COLOR = {
  brand: "var(--brand)",
  direction: "var(--direction)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
};

const steps = [
  { k: "Cadastro iniciado", state: "done" },
  { k: "Documentos enviados", state: "done" },
  { k: "Simulação realizada", state: "done" },
  { k: "Proposta enviada", state: "done" },
  { k: "Em análise", state: "current" },
  { k: "Pendência", state: "wait" },
  { k: "Aprovada", state: "wait" },
  { k: "Contrato", state: "wait" },
  { k: "Finalizada", state: "wait" },
] as const;

const docs = [
  { l: "RG / CNH", status: "approved" },
  { l: "Comprovante de renda", status: "approved" },
  { l: "Comprovante de residência", status: "review" },
  { l: "Certidão do imóvel", status: "pending" },
  { l: "Matrícula atualizada", status: "pending" },
  { l: "IPTU 2025", status: "rejected" },
] as const;

const docMeta = {
  approved: { l: "Aprovado", c: COLOR.success, icon: CheckCircle2 },
  review: { l: "Em análise", c: COLOR.info, icon: FileSearch },
  pending: { l: "Pendente", c: COLOR.warning, icon: Clock },
  rejected: { l: "Reprovado", c: COLOR.direction, icon: FileX2 },
} as const;

export function ClienteDashboard() {
  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Visão Geral · Cliente"
        title="Acompanhamento da sua proposta"
        subtitle="Acompanhe o status, os documentos e os próximos passos do seu processo de crédito com total segurança."
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            Escopo · sua proposta
          </span>
        }
      />

      {/* Status summary */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="h-1 w-full bg-brand" />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status geral
            </p>
            <p className="mt-1 text-lg font-bold text-graphite">Em análise bancária</p>
            <p className="text-[11px] text-muted-foreground">Atualizado há 4 horas</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Produto
            </p>
            <p className="mt-1 text-lg font-bold text-graphite">Financiamento Imobiliário</p>
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Caixa Econômica Federal
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Responsável
            </p>
            <p className="mt-1 text-lg font-bold text-graphite inline-flex items-center gap-1">
              <User className="h-4 w-4 text-brand" /> Mariana Lopes
            </p>
            <p className="text-[11px] text-muted-foreground">Corretora · resposta em até 4h</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Próxima etapa
            </p>
            <p className="mt-1 text-lg font-bold text-graphite">Aguardar análise</p>
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Previsão: 3 dias úteis
            </p>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Valor financiado", v: "R$ 540.000", c: COLOR.brand },
          { l: "Valor do imóvel", v: "R$ 720.000", c: COLOR.info },
          { l: "Parcela estimada", v: "R$ 4.180", c: COLOR.success },
          { l: "Prazo", v: "360 meses", c: COLOR.brand },
          { l: "Banco em análise", v: "Caixa Econômica", c: COLOR.info },
          { l: "Status atual", v: "Em análise", c: COLOR.warning },
          { l: "Próxima ação", v: "Aguardar retorno", c: "#6b7280" },
          { l: "Documentos pendentes", v: "2", c: COLOR.direction },
        ].map((k) => (
          <article
            key={k.l}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="h-1 w-full" style={{ background: k.c }} />
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {k.l}
              </p>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-graphite">{k.v}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Timeline */}
      <Panel title="Linha do tempo da proposta" icon={FileCheck2}>
        <ol className="relative grid gap-3 lg:grid-cols-9">
          {steps.map((s, i) => {
            const isDone = s.state === "done";
            const isCurrent = s.state === "current";
            return (
              <li key={s.k} className="relative flex flex-col items-center text-center">
                <span
                  className={[
                    "grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold",
                    isDone
                      ? "bg-brand text-brand-foreground"
                      : isCurrent
                        ? "bg-direction text-direction-foreground ring-4 ring-direction/20"
                        : "border border-border bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className="absolute left-1/2 top-4 hidden h-px w-full lg:block"
                    style={{ background: isDone ? "var(--brand)" : "var(--border)" }}
                    aria-hidden
                  />
                )}
                <p className="mt-2 text-[11px] font-semibold text-graphite">{s.k}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isDone ? "Concluído" : isCurrent ? "Em andamento" : "Aguardando"}
                </p>
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Documents */}
        <Panel title="Documentos" icon={FileClock} className="lg:col-span-2">
          <ul className="divide-y divide-border rounded-md border border-border">
            {docs.map((d) => {
              const m = docMeta[d.status];
              const Icon = m.icon;
              return (
                <li
                  key={d.l}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: m.c }} />
                    <span className="truncate font-medium text-graphite">{d.l}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: m.c,
                        background: `color-mix(in oklab, ${m.c} 12%, transparent)`,
                      }}
                    >
                      {m.l}
                    </span>
                    {(d.status === "pending" || d.status === "rejected") && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground hover:opacity-90"
                      >
                        <Upload className="h-3 w-3" /> Enviar
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Proposal details */}
        <Panel title="Detalhes da proposta" icon={Building2}>
          <dl className="space-y-2.5 text-xs">
            {[
              ["Produto", "Financiamento Imobiliário"],
              ["Banco", "Caixa Econômica Federal"],
              ["Valor financiado", "R$ 540.000"],
              ["Prazo", "360 meses"],
              ["Parcela estimada", "R$ 4.180"],
              ["Taxa estimada", "10,49% a.a."],
              ["Imóvel", "Apto · São Paulo/SP"],
              ["Status", "Em análise"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-bold text-graphite">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-md border border-border bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
            <strong className="text-graphite">Observação:</strong> avaliação do imóvel agendada
            para a próxima semana pelo banco.
          </p>
        </Panel>
      </div>

      {/* Updates / messages */}
      <Panel title="Atualizações e próximos passos" icon={MessageSquare}>
        <div className="grid gap-4 lg:grid-cols-2">
          <ul className="space-y-3">
            {[
              {
                t: "Documentos recebidos",
                d: "Mariana confirmou o recebimento do RG e comprovante de renda.",
                w: "há 4 horas",
                c: COLOR.success,
              },
              {
                t: "Proposta enviada ao banco",
                d: "Sua proposta foi encaminhada à Caixa Econômica Federal.",
                w: "ontem",
                c: COLOR.brand,
              },
              {
                t: "Solicitação de documento",
                d: "Por favor, envie o IPTU 2025 atualizado.",
                w: "2 dias",
                c: COLOR.warning,
              },
              {
                t: "Simulação aprovada internamente",
                d: "Sua simulação passou nos critérios iniciais.",
                w: "3 dias",
                c: COLOR.info,
              },
            ].map((u) => (
              <li key={u.t} className="flex gap-3">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: u.c }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-graphite">{u.t}</p>
                    <span className="text-[10px] text-muted-foreground">{u.w}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{u.d}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-md border border-border bg-secondary p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
              Próximos passos
            </p>
            <ul className="mt-2 space-y-2 text-xs text-graphite">
              {[
                "Enviar IPTU 2025 atualizado",
                "Reenviar comprovante de residência (até 60 dias)",
                "Aguardar análise do banco · até 3 dias úteis",
                "Agendar avaliação do imóvel",
              ].map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-brand" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-foreground hover:opacity-90"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Falar com a Mariana
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
