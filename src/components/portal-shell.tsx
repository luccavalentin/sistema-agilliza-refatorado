import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  Bell,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  ShieldCheck,
  Building2,
  Search,
} from "lucide-react";

export type PortalNavItem = {
  label: string;
  to?: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

export type PortalKind = "correspondente" | "corretor" | "cliente";

const kindMeta: Record<PortalKind, { label: string; description: string; user: string }> = {
  correspondente: {
    label: "Correspondente Imobiliário",
    description: "Controle operacional do ecossistema",
    user: "Administrador",
  },
  corretor: {
    label: "Portal do Corretor",
    description: "Operação comercial e clientes",
    user: "Corretor",
  },
  cliente: {
    label: "Portal do Cliente",
    description: "Acompanhamento do seu processo",
    user: "Cliente",
  },
};

export function PortalShell({
  kind,
  items,
  children,
}: {
  kind: PortalKind;
  items: PortalNavItem[];
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = kindMeta[kind];

  return (
    <div className="flex min-h-screen bg-secondary text-foreground">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-graphite/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
          "shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]",
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
        style={{
          backgroundImage:
            "linear-gradient(180deg, #001bbf 0%, #000f9f 55%, #000a7a 100%)",
        }}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-brand">
            <Building2 className="h-5 w-5" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">Plataforma</p>
              <p className="truncate text-[11px] text-white/65">Crédito Imobiliário</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {!collapsed && (
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Navegação principal
            </p>
          )}
          {items.map((item) => {
            const Icon = item.icon;
            const active = !!item.to && pathname === item.to;
            const baseCls = [
              "group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
              active
                ? "bg-white text-brand shadow-sm"
                : "text-white/85 hover:bg-white/10 hover:text-white",
            ].join(" ");
            const content = (
              <>
                {active && (
                  <span
                    className="absolute inset-y-1.5 -left-1 w-1 rounded-r bg-direction"
                    aria-hidden
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            );
            return item.to ? (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={baseCls}
                title={collapsed ? item.label : undefined}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className={baseCls}
                title={collapsed ? item.label : undefined}
              >
                {content}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          {!collapsed && (
            <div className="mx-1 mb-2 rounded-md bg-white/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
                Ambiente
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-white">{meta.label}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white lg:flex"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                Recolher menu
              </>
            )}
          </button>
          <Link
            to="/"
            className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sair com segurança</span>}
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-brand lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-graphite">{meta.label}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {meta.description}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar"
                className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>

            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-brand sm:inline-flex">
              <ShieldCheck className="h-3 w-3" />
              Sessão segura
            </span>

            <button
              type="button"
              className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:border-brand/40 hover:text-brand"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-direction" />
            </button>

            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
              <div className="grid h-7 w-7 place-items-center rounded bg-brand text-[11px] font-bold text-brand-foreground">
                {meta.user.charAt(0)}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold text-graphite">{meta.user}</p>
                <p className="truncate text-[10px] text-muted-foreground">Perfil ativo</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
