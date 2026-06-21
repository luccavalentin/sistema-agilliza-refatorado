// Contexto de busca global do topbar — todas as listas combinam com seu filtro local.
import { createContext, useContext, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";

type Ctx = { value: string; setValue: (v: string) => void };
const GlobalSearchCtx = createContext<Ctx>({ value: "", setValue: () => {} });

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState("");
  return (
    <GlobalSearchCtx.Provider value={{ value, setValue }}>
      {children}
    </GlobalSearchCtx.Provider>
  );
}

/** Valor atual da busca global (em lowercase trimado). Use junto com seu filtro local. */
export function useGlobalSearch(): string {
  return useContext(GlobalSearchCtx).value.trim().toLowerCase();
}

/** Helper: testa se algum dos campos contém a busca global (case-insensitive). */
export function matchGlobalSearch(query: string, ...fields: Array<string | number | null | undefined>): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f != null && String(f).toLowerCase().includes(q));
}

export function GlobalSearchInput() {
  const { value, setValue } = useContext(GlobalSearchCtx);
  return (
    <div className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar em toda a tela…"
        aria-label="Busca global"
        className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-8 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-graphite"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
