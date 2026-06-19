import type { ComponentType, ReactNode } from "react";

export function PanelHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-graphite sm:text-[34px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}

export function FilterBar({ filters }: { filters: { label: string; value: string }[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filtros
        </span>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filters.map((f) => (
            <label key={f.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f.label}
              </span>
              <button
                type="button"
                className="inline-flex h-9 min-w-[140px] items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium text-graphite hover:border-brand/40"
              >
                {f.value}
                <span className="text-muted-foreground">▾</span>
              </button>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

export type KpiCardProps = {
  label: string;
  value: string;
  accent: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  sub?: { k: string; v: string }[];
  footer?: { label: string; value: string };
  caption?: string;
};

export function KpiCard({ label, value, accent, icon: Icon, sub, footer, caption }: KpiCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-graphite">{value}</p>
          </div>
          {Icon && (
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-secondary"
              style={{ color: accent }}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </div>
          )}
        </div>
        {caption && <p className="mt-2 text-[11px] text-muted-foreground">{caption}</p>}
        {sub && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {sub.map((s) => (
              <div key={s.k} className="rounded-md border border-border bg-background px-2 py-1.5">
                <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </p>
                <p className="mt-0.5 text-xs font-bold text-graphite">{s.v}</p>
              </div>
            ))}
          </div>
        )}
        {footer && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-[11px]">
            <span className="font-medium text-muted-foreground">{footer.label}</span>
            <span className="font-bold text-graphite">{footer.value}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export function Panel({
  title,
  icon: Icon,
  right,
  children,
  className = "",
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-graphite">
          {Icon && <Icon className="h-4 w-4 text-brand" />}
          <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Legend({ items }: { items: { c: string; l: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      {items.map((s) => (
        <span key={s.l} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: s.c }} />
          {s.l}
        </span>
      ))}
    </div>
  );
}

export function MultiBarChart({
  data,
  series,
}: {
  data: { label: string; values: number[] }[];
  series: { color: string; label: string }[];
}) {
  const max = Math.max(...data.flatMap((d) => d.values), 1);
  return (
    <div>
      <div className="flex h-56 items-end gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col justify-end gap-1">
            <div className="flex flex-1 items-end gap-0.5">
              {d.values.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${(v / max) * 100}%`,
                    background: series[i].color,
                    opacity: 0.9,
                  }}
                  title={`${series[i].label}: ${v}`}
                />
              ))}
            </div>
            <span className="text-center text-[10px] font-medium text-muted-foreground">
              {d.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Legend items={series.map((s) => ({ c: s.color, l: s.label }))} />
      </div>
    </div>
  );
}

export function HBarList({
  rows,
  accent = "var(--brand)",
}: {
  rows: { label: string; value: number; sub?: string }[];
  accent?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-medium text-graphite">{r.label}</span>
            <span className="shrink-0 font-bold text-graphite">{r.sub ?? r.value}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: accent }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string; label: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--secondary)" strokeWidth="16" />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {centerLabel}
        </p>
        <p className="text-xl font-bold text-graphite">{centerValue}</p>
        <ul className="mt-3 space-y-1.5">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3 text-xs">
              <span className="inline-flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="truncate text-graphite">{s.label}</span>
              </span>
              <span className="font-bold text-graphite">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Funnel({
  steps,
}: {
  steps: { label: string; value: number; color: string }[];
}) {
  const max = steps[0]?.value ?? 1;
  return (
    <ul className="space-y-2">
      {steps.map((s) => {
        const pct = (s.value / max) * 100;
        return (
          <li key={s.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-xs font-medium text-graphite">{s.label}</span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-secondary">
              <div
                className="absolute inset-y-0 left-0 flex items-center justify-end pr-2 text-[11px] font-bold text-white"
                style={{ width: `${pct}%`, background: s.color }}
              >
                {s.value}
              </div>
            </div>
            <span className="w-12 shrink-0 text-right text-[11px] text-muted-foreground">
              {Math.round(pct)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function AlertList({
  items,
}: {
  items: { tone: "critical" | "warning" | "info"; title: string; meta?: string }[];
}) {
  const toneMap = {
    critical: { bg: "color-mix(in oklab, var(--direction) 8%, transparent)", c: "var(--direction)" },
    warning: { bg: "color-mix(in oklab, var(--warning) 10%, transparent)", c: "var(--warning)" },
    info: { bg: "color-mix(in oklab, var(--info) 10%, transparent)", c: "var(--info)" },
  };
  return (
    <ul className="space-y-2">
      {items.map((a, i) => {
        const t = toneMap[a.tone];
        return (
          <li
            key={i}
            className="flex items-start gap-3 rounded-md border border-border p-3"
            style={{ background: t.bg }}
          >
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ background: t.c }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-graphite">{a.title}</p>
              {a.meta && <p className="mt-0.5 text-[11px] text-muted-foreground">{a.meta}</p>}
            </div>
            <button
              type="button"
              className="rounded border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40 hover:text-brand"
            >
              Ver
            </button>
          </li>
        );
      })}
    </ul>
  );
}
