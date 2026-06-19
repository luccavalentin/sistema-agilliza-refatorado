import { Users2, CheckCircle2, FileSearch, Calculator, TrendingUp } from "lucide-react";

type Kind = "correspondente" | "corretor" | "cliente";

export function OverviewPlaceholder({
  title,
  subtitle,
  kind,
}: {
  title: string;
  subtitle: string;
  kind: Kind;
}) {
  if (kind === "cliente") return <ClienteOverview title={title} subtitle={subtitle} />;
  return <OperationalOverview title={title} subtitle={subtitle} />;
}

function OperationalOverview({ title, subtitle }: { title: string; subtitle: string }) {
  const kpis = [
    {
      label: "Simulações",
      value: "141",
      accent: "var(--brand)",
      icon: Users2,
      sub: [
        { k: "Aprovadas", v: "44%", tone: "text-[color:var(--success)]" },
        { k: "Reprovadas", v: "21%", tone: "text-[color:var(--direction)]" },
        { k: "Tratativas", v: "24%", tone: "text-[color:var(--info)]" },
        { k: "Não seq.", v: "11%", tone: "text-[color:var(--warning)]" },
      ],
      footer: { label: "Ver em volume R$", value: "R$ 94.103.000" },
    },
    {
      label: "Aprovações",
      value: "62",
      accent: "var(--success)",
      icon: CheckCircle2,
      caption: "44% sob o volume total de simulações",
      footer: { label: "Ver em volume R$", value: "R$ 41.405.000" },
    },
    {
      label: "Reprovações",
      value: "30",
      accent: "var(--direction)",
      icon: FileSearch,
      caption: "21% sob o volume total de simulações",
      footer: { label: "Ver em volume R$", value: "R$ 19.762.000" },
    },
    {
      label: "Tratativas",
      value: "34",
      accent: "var(--info)",
      icon: Calculator,
      caption: "24% em análise/negociação",
      footer: { label: "Volume estimado", value: "R$ 22.580.000" },
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title.toUpperCase()}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-graphite sm:text-[34px]">
          Painel de Monitoramento
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <article
              key={k.label}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="h-1 w-full" style={{ backgroundColor: k.accent }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </p>
                    <p className="mt-1.5 text-4xl font-bold tracking-tight text-graphite">
                      {k.value}
                    </p>
                  </div>
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-secondary"
                    style={{ color: k.accent }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </div>
                </div>

                {k.sub ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {k.sub.map((s) => (
                      <div
                        key={s.k}
                        className="rounded-md border border-border bg-background px-3 py-2"
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {s.k}
                        </p>
                        <p className={`mt-0.5 text-sm font-bold ${s.tone}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{k.caption}</p>
                )}

                <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                  <span className="font-medium text-muted-foreground">{k.footer.label}</span>
                  <span className="font-bold text-graphite">{k.footer.value}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-graphite">
            <TrendingUp className="h-4 w-4 text-brand" />
            <h2 className="text-base font-bold tracking-tight">Evolução diária</h2>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {[
              { c: "var(--brand)", l: "Simulações" },
              { c: "var(--success)", l: "Aprovações" },
              { c: "var(--direction)", l: "Reprovações" },
            ].map((s) => (
              <span key={s.l} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: s.c }} />
                {s.l}
              </span>
            ))}
          </div>
        </div>

        {/* Chart placeholder */}
        <div className="mt-5 h-64 rounded-md border border-dashed border-border bg-secondary/60 p-4">
          <ChartSkeleton />
        </div>
      </section>
    </div>
  );
}

function ChartSkeleton() {
  const bars = [40, 65, 50, 80, 55, 70, 90, 60, 75, 85, 50, 95];
  return (
    <div className="flex h-full items-end gap-2">
      {bars.map((h, i) => (
        <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1">
          <div
            className="w-full rounded-sm"
            style={{ height: `${h}%`, background: "var(--brand)", opacity: 0.85 }}
          />
          <div
            className="w-full rounded-sm"
            style={{ height: `${h * 0.45}%`, background: "var(--success)", opacity: 0.7 }}
          />
        </div>
      ))}
    </div>
  );
}

function ClienteOverview({ title, subtitle }: { title: string; subtitle: string }) {
  const steps = [
    { k: "Cadastro", done: true },
    { k: "Documentação", done: true },
    { k: "Análise de crédito", done: false, current: true },
    { k: "Aprovação", done: false },
    { k: "Formalização", done: false },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title.toUpperCase()}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-graphite sm:text-[34px]">
          Acompanhamento do seu processo
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-3">
        {[
          { label: "Etapa atual", value: "Análise de crédito", accent: "var(--info)" },
          { label: "Status", value: "Em andamento", accent: "var(--brand)" },
          { label: "Próxima ação", value: "Aguardando análise", accent: "var(--warning)" },
        ].map((c) => (
          <article
            key={c.label}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="h-1 w-full" style={{ backgroundColor: c.accent }} />
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-2 text-xl font-bold tracking-tight text-graphite">{c.value}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-base font-bold tracking-tight text-graphite">Linha do tempo</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.k} className="relative">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                    s.done
                      ? "bg-brand text-brand-foreground"
                      : s.current
                        ? "bg-direction text-direction-foreground"
                        : "border border-border bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {i + 1}
                </span>
                <p className="text-xs font-semibold text-graphite">{s.k}</p>
              </div>
              <p className="mt-1 pl-9 text-[11px] text-muted-foreground">
                {s.done ? "Concluído" : s.current ? "Em andamento" : "Aguardando"}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
