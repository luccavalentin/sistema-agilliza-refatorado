import { ShieldCheck, Activity, Layers } from "lucide-react";

export function OverviewPlaceholder({
  title,
  subtitle,
  kind,
}: {
  title: string;
  subtitle: string;
  kind: "correspondente" | "corretor" | "cliente";
}) {
  const stats =
    kind === "cliente"
      ? [
          { label: "Processo atual", value: "—" },
          { label: "Status", value: "—" },
          { label: "Próxima etapa", value: "—" },
        ]
      : [
          { label: "Operações ativas", value: "—" },
          { label: "Em análise", value: "—" },
          { label: "Aprovadas no mês", value: "—" },
          { label: "Aguardando documentos", value: "—" },
        ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-graphite">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          Acesso conforme permissões do perfil
        </span>
      </header>

      <section
        className={`grid gap-4 ${
          kind === "cliente" ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4"
        }`}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-border bg-card p-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-graphite">{s.value}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded bg-secondary">
              <div className="h-full w-1/3 bg-brand/70" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-graphite">
            <Activity className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold">Área principal de conteúdo</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta região receberá os módulos funcionais conforme o desenho de cada tela.
            A estrutura está pronta para acomodar painéis, listas operacionais, indicadores
            e fluxos específicos do perfil logado.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-md border border-dashed border-border bg-secondary/60 p-4"
              >
                <div className="h-3 w-24 rounded bg-border" />
                <div className="mt-3 h-2 w-full rounded bg-border/70" />
                <div className="mt-2 h-2 w-4/5 rounded bg-border/70" />
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-graphite">
            <Layers className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold">Diretrizes do ecossistema</h2>
          </div>
          <ul className="mt-3 space-y-2.5 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Permissões segregadas por perfil de acesso.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Trilha de auditoria para ações sensíveis.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Confirmação obrigatória em ações críticas.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-direction" />
              Alertas e reprovações destacados em vermelho direcional.
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
