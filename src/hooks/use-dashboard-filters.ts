// Hook de filtros funcionais para todos os dashboards.
// Centraliza estado + helpers de filtragem sobre arrays de domínio.

import { useMemo, useState, useCallback } from "react";
import { ANCHOR_NOW } from "@/data/anchor";

export type PeriodoOpt =
  | "7 dias"
  | "Últimos 30 dias"
  | "90 dias"
  | "Ano"
  | "Tudo";

export const PERIODOS: PeriodoOpt[] = ["7 dias", "Últimos 30 dias", "90 dias", "Ano", "Tudo"];

export const periodoToDays = (p: string): number | null => {
  if (p === "7 dias") return 7;
  if (p === "Últimos 30 dias" || p === "30 dias") return 30;
  if (p === "90 dias") return 90;
  if (p === "Ano") return 365;
  return null; // Tudo / Personalizado
};

export type DashFilters = {
  periodo: string;
  produto: string;
  banco: string;
  corretor: string;
  status: string;
  imobiliaria: string;
  analista: string;
  origem: string;
  cidade: string;
  uf: string;
  cliente: string;
  backoffice: string;
  comercial: string;
  categoria: string;
  formaPagamento: string;
  fase: string;
};

export const DEFAULTS: DashFilters = {
  periodo: "Últimos 30 dias",
  produto: "Todos",
  banco: "Todos",
  corretor: "Todos",
  status: "Todos",
  imobiliaria: "Todas",
  analista: "Todos",
  origem: "Todas",
  cidade: "Todas",
  uf: "Todas",
  cliente: "Todos",
  backoffice: "Todos",
  comercial: "Todos",
  categoria: "Todas",
  formaPagamento: "Todas",
  fase: "Todas",
};

export function useDashboardFilters(initial?: Partial<DashFilters>) {
  const [filters, setFilters] = useState<DashFilters>({ ...DEFAULTS, ...(initial ?? {}) });

  const set = useCallback(
    <K extends keyof DashFilters>(k: K) =>
      (v: DashFilters[K]) =>
        setFilters((f) => ({ ...f, [k]: v })),
    [],
  );

  const reset = useCallback(() => setFilters({ ...DEFAULTS, ...(initial ?? {}) }), [initial]);

  const cutoffMs = useMemo(() => {
    const days = periodoToDays(filters.periodo);
    if (days == null) return null;
    return ANCHOR_NOW.getTime() - days * 24 * 3600 * 1000;
  }, [filters.periodo]);

  // Helper genérico: aplica filtro a um array tipado.
  function apply<T>(
    items: T[],
    map: {
      data?: (x: T) => string | Date | undefined;
      produto?: (x: T) => string | undefined;
      bancoSigla?: (x: T) => string | undefined;
      corretor?: (x: T) => string | undefined;
      status?: (x: T) => string | undefined;
      cliente?: (x: T) => string | undefined;
      categoria?: (x: T) => string | undefined;
      fase?: (x: T) => string | undefined;
    },
  ): T[] {
    return items.filter((x) => {
      if (cutoffMs != null && map.data) {
        const d = map.data(x);
        if (d) {
          const t = typeof d === "string" ? new Date(d).getTime() : d.getTime();
          if (!Number.isNaN(t) && t < cutoffMs) return false;
        }
      }
      if (filters.produto !== "Todos" && map.produto && map.produto(x) !== filters.produto) return false;
      if (filters.banco !== "Todos" && map.bancoSigla && map.bancoSigla(x) !== filters.banco) return false;
      if (filters.corretor !== "Todos" && map.corretor && map.corretor(x) !== filters.corretor) return false;
      if (filters.status !== "Todos" && map.status && map.status(x) !== filters.status) return false;
      if (filters.cliente !== "Todos" && map.cliente && map.cliente(x) !== filters.cliente) return false;
      if (filters.categoria !== "Todas" && map.categoria && map.categoria(x) !== filters.categoria) return false;
      if (filters.fase !== "Todas" && map.fase && map.fase(x) !== filters.fase) return false;
      return true;
    });
  }

  return { filters, set, reset, apply, cutoffMs };
}
