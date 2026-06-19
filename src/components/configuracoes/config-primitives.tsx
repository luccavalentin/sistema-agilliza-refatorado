import { useState, type ComponentType, type ReactNode } from "react";
import { Check, ChevronRight, Search } from "lucide-react";

export type ConfigSection = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  description?: string;
  groups?: ConfigGroup[];
};

export type ConfigGroup = {
  title?: string;
  hint?: string;
  fields: ConfigField[];
};

export type ConfigField =
  | { kind: "toggle"; label: string; description?: string; defaultValue?: boolean }
  | { kind: "text"; label: string; placeholder?: string; defaultValue?: string; type?: "text" | "email" | "tel" | "password" | "number" }
  | { kind: "textarea"; label: string; placeholder?: string; defaultValue?: string }
  | { kind: "select"; label: string; options: string[]; defaultValue?: string }
  | { kind: "chips"; label: string; options: string[]; defaultValues?: string[] }
  | { kind: "info"; label: string; value: string; tone?: "default" | "brand" | "success" | "warning" }
  | { kind: "list"; label: string; items: { primary: string; secondary?: string; right?: string }[] };

export function ConfigShell({
  title,
  subtitle,
  sections,
  initialSectionId,
}: {
  title: string;
  subtitle: string;
  sections: ConfigSection[];
  initialSectionId?: string;
}) {
  const [activeId, setActiveId] = useState(initialSectionId ?? sections[0]?.id);
  const [query, setQuery] = useState("");
  const active = sections.find((s) => s.id === activeId) ?? sections[0];
  const filtered = query
    ? sections.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : sections;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Configurações
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-graphite sm:text-[34px]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar configuração…"
            className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border border-border bg-card p-2 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <nav className="space-y-0.5">
            {filtered.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active?.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={[
                    "group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-graphite hover:bg-secondary",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="flex-1 truncate">{s.label}</span>
                  <ChevronRight
                    className={[
                      "h-3.5 w-3.5 shrink-0 transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-5">
          {active && <SectionPanel section={active} />}
        </section>
      </div>
    </div>
  );
}

function SectionPanel({ section }: { section: ConfigSection }) {
  const Icon = section.icon;
  return (
    <article className="rounded-lg border border-border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand">
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-graphite">{section.label}</h2>
            {section.description && (
              <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-graphite hover:bg-secondary">
            Cancelar
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground shadow-sm hover:bg-brand/90">
            <Check className="h-3.5 w-3.5" /> Salvar
          </button>
        </div>
      </header>

      <div className="divide-y divide-border">
        {(section.groups ?? []).map((g, gi) => (
          <GroupBlock key={gi} group={g} />
        ))}
      </div>
    </article>
  );
}

function GroupBlock({ group }: { group: ConfigGroup }) {
  return (
    <div className="px-6 py-5">
      {group.title && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-graphite">{group.title}</h3>
          {group.hint && <p className="mt-0.5 text-xs text-muted-foreground">{group.hint}</p>}
        </div>
      )}
      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
        {group.fields.map((f, i) => (
          <FieldRow key={i} field={f} />
        ))}
      </div>
    </div>
  );
}

function FieldRow({ field }: { field: ConfigField }) {
  switch (field.kind) {
    case "toggle":
      return <ToggleField {...field} />;
    case "text":
      return (
        <Labeled label={field.label}>
          <input
            type={field.type ?? "text"}
            defaultValue={field.defaultValue}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </Labeled>
      );
    case "textarea":
      return (
        <Labeled label={field.label} full>
          <textarea
            rows={3}
            defaultValue={field.defaultValue}
            placeholder={field.placeholder}
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </Labeled>
      );
    case "select":
      return (
        <Labeled label={field.label}>
          <select
            defaultValue={field.defaultValue}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          >
            {field.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Labeled>
      );
    case "chips":
      return <ChipsField {...field} />;
    case "info":
      return <InfoField {...field} />;
    case "list":
      return <ListField {...field} />;
  }
}

function Labeled({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={["flex flex-col gap-1.5", full ? "md:col-span-2" : ""].join(" ")}>
      <span className="text-xs font-semibold text-graphite">{label}</span>
      {children}
    </label>
  );
}

function ToggleField({
  label,
  description,
  defaultValue,
}: {
  label: string;
  description?: string;
  defaultValue?: boolean;
}) {
  const [on, setOn] = useState(defaultValue ?? false);
  return (
    <div className="md:col-span-2 flex items-start justify-between gap-4 rounded-md border border-border bg-background px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-graphite">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={[
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-brand" : "bg-border",
        ].join(" ")}
        aria-pressed={on}
      >
        <span
          className={[
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            on ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function ChipsField({
  label,
  options,
  defaultValues,
}: {
  label: string;
  options: string[];
  defaultValues?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultValues ?? []);
  const toggle = (o: string) =>
    setSelected((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  return (
    <div className="md:col-span-2 flex flex-col gap-2">
      <span className="text-xs font-semibold text-graphite">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                on
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background text-graphite hover:bg-secondary",
              ].join(" ")}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "brand" | "success" | "warning";
}) {
  const toneCls = {
    default: "bg-secondary text-graphite",
    brand: "bg-brand/10 text-brand",
    success: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  }[tone];
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-graphite">{label}</span>
      <span className={["inline-flex w-fit rounded-md px-2.5 py-1.5 text-xs font-semibold", toneCls].join(" ")}>
        {value}
      </span>
    </div>
  );
}

function ListField({
  label,
  items,
}: {
  label: string;
  items: { primary: string; secondary?: string; right?: string }[];
}) {
  return (
    <div className="md:col-span-2 flex flex-col gap-2">
      <span className="text-xs font-semibold text-graphite">{label}</span>
      <div className="divide-y divide-border rounded-md border border-border bg-background">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-graphite">{it.primary}</p>
              {it.secondary && (
                <p className="truncate text-xs text-muted-foreground">{it.secondary}</p>
              )}
            </div>
            {it.right && (
              <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-graphite">
                {it.right}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
