// Hook de filtros funcionais para todos os dashboards.
// Centraliza estado + helpers de filtragem sobre arrays de domínio.

import { useMemo, useState, useCallback } from "react";
import { ANCHOR_NOW } from "@/data/anchor";

export type PeriodoOpt =
  | "7 dias"
  | "Últimos 30 dias"
  | "90 dias"
  | "Ano"
  | "Tudo"
  | "Personalizado";

export const PERIODOS: PeriodoOpt[] = [
  "7 dias",
  "Últimos 30 dias",
  "90 dias",
  "Ano",
  "Tudo",
  "Personalizado",
];

export const periodoToDays = (p: string): number | null => {
  if (p === "7 dias") return 7;
  if (p === "Últimos 30 dias" || p === "30 dias") return 30;
  if (p === "90 dias") return 90;
  if (p === "Ano") return 365;
  return null; // Tudo / Personalizado
};

export type DashFilters = {
  periodo: string;
  customFrom: string; // ISO yyyy-mm-dd (vazio quando não usado)
  customTo: string;
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
  customFrom: "",
  customTo: "",
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

  const setCustomRange = useCallback((from: string, to: string) => {
    setFilters((f) => ({ ...f, customFrom: from, customTo: to }));
  }, []);

  const reset = useCallback(() => setFilters({ ...DEFAULTS, ...(initial ?? {}) }), [initial]);

  // Janela de tempo efetiva: [fromMs, toMs] (qualquer um pode ser null)
  const range = useMemo<{ fromMs: number | null; toMs: number | null }>(() => {
    if (filters.periodo === "Personalizado") {
      const fromMs = filters.customFrom ? new Date(filters.customFrom + "T00:00:00").getTime() : null;
      const toMs = filters.customTo ? new Date(filters.customTo + "T23:59:59").getTime() : null;
      return { fromMs, toMs };
    }
    const days = periodoToDays(filters.periodo);
    if (days == null) return { fromMs: null, toMs: null };
    return { fromMs: ANCHOR_NOW - days * 24 * 3600 * 1000, toMs: null };
  }, [filters.periodo, filters.customFrom, filters.customTo]);

  // Compat: cutoffMs (limite inferior) — código antigo usa este valor.
  const cutoffMs = range.fromMs;

  // Helper genérico: aplica filtro a um array tipado.
  function apply<T>(
    items: T[],
    map: {
      data?: (x: T) => string | Date | number | undefined;
      produto?: (x: T) => string | undefined;
      bancoSigla?: (x: T) => string | undefined;
      corretor?: (x: T) => string | undefined;
      status?: (x: T) => string | undefined;
      cliente?: (x: T) => string | undefined;
      categoria?: (x: T) => string | undefined;
      fase?: (x: T) => string | undefined;
      analista?: (x: T) => string | undefined;
      backoffice?: (x: T) => string | undefined;
      comercial?: (x: T) => string | undefined;
      imobiliaria?: (x: T) => string | undefined;
    },
  ): T[] {
    return items.filter((x) => {
      if (map.data && (range.fromMs != null || range.toMs != null)) {
        const d = map.data(x);
        if (d != null) {
          const t = d instanceof Date ? d.getTime() : typeof d === "number" ? d : new Date(d).getTime();
          if (!Number.isNaN(t)) {
            if (range.fromMs != null && t < range.fromMs) return false;
            if (range.toMs != null && t > range.toMs) return false;
          }
        }
      }
      if (filters.produto !== "Todos" && map.produto && map.produto(x) !== filters.produto) return false;
      if (filters.banco !== "Todos" && map.bancoSigla && map.bancoSigla(x) !== filters.banco) return false;
      if (filters.corretor !== "Todos" && map.corretor && map.corretor(x) !== filters.corretor) return false;
      if (filters.status !== "Todos" && map.status && map.status(x) !== filters.status) return false;
      if (filters.cliente !== "Todos" && map.cliente && map.cliente(x) !== filters.cliente) return false;
      if (filters.categoria !== "Todas" && map.categoria && map.categoria(x) !== filters.categoria) return false;
      if (filters.fase !== "Todas" && map.fase && map.fase(x) !== filters.fase) return false;
      if (filters.analista !== "Todos" && map.analista && map.analista(x) !== filters.analista) return false;
      if (filters.backoffice !== "Todos" && map.backoffice && map.backoffice(x) !== filters.backoffice) return false;
      if (filters.comercial !== "Todos" && map.comercial && map.comercial(x) !== filters.comercial) return false;
      if (filters.imobiliaria !== "Todas" && map.imobiliaria && map.imobiliaria(x) !== filters.imobiliaria) return false;
      return true;
    });
  }

  return { filters, set, setCustomRange, reset, apply, cutoffMs, range };
}
