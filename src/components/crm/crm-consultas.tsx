import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Calculator,
  Paperclip,
  History,
  FileText,
  Building2,
  Home,
  Users,
  StickyNote,
  Power,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import type { CrmScope } from "./crm-dashboard";

type Tab = "clientes" | "vendedores" | "imoveis" | "composicao" | "documentos" | "vinculos" | "propostas" | "simulacoes";

const TABS: { key: Tab; label: string }[] = [
  { key: "clientes", label: "Clientes" },
  { key: "vendedores", label: "Vendedores" },
  { key: "imoveis", label: "Imóveis" },
  { key: "composicao", label: "Composição de renda" },
  { key: "documentos", label: "Documentos" },
  { key: "vinculos", label: "Vínculos" },
  { key: "propostas", label: "Propostas" },
  { key: "simulacoes", label: "Simulações" },
];

const baseClientes = [
  { nome: "Juliana Pereira", doc: "284.512.910-22", tel: "(11) 99812-2210", email: "juliana@email.com", status: "Em análise", produto: "Financiamento Imob.", corretor: "Mariana Lopes", imob: "Prime Imóveis", analista: "Camila Duarte", criado: "12/06/2026", upd: "Hoje · 09:42", pend: 2 },
  { nome: "Ricardo Andrade", doc: "910.221.510-09", tel: "(11) 99744-1180", email: "ricardo@email.com", status: "Documentação", produto: "Home Equity", corretor: "Rafael Souza", imob: "Lopes Capital", analista: "Camila Duarte", criado: "10/06/2026", upd: "Hoje · 08:10", pend: 4 },
  { nome: "Construtora Vega LTDA", doc: "29.812.510/0001-44", tel: "(11) 4112-7800", email: "contato@vega.com.br", status: "Aprovado", produto: "Financiamento Imob.", corretor: "Mariana Lopes", imob: "Prime Imóveis", analista: "Bruno Tavares", criado: "01/06/2026", upd: "Ontem", pend: 0 },
  { nome: "Marcelo Tavares", doc: "184.220.910-77", tel: "(21) 99211-3380", email: "marcelo@email.com", status: "Reprovado", produto: "Home Equity", corretor: "Camila Duarte", imob: "RE/MAX Centro", analista: "Camila Duarte", criado: "29/05/2026", upd: "16/06/2026", pend: 1 },
  { nome: "Ana Beatriz Lima", doc: "451.882.110-12", tel: "(31) 98112-7740", email: "anabeatriz@email.com", status: "Simulação", produto: "Financiamento Imob.", corretor: "Mariana Lopes", imob: "Auxiliadora", analista: "Camila Duarte", criado: "26/05/2026", upd: "15/06/2026", pend: 3 },
  { nome: "Felipe Nunes", doc: "742.103.882-44", tel: "(41) 99421-5540", email: "felipe@email.com", status: "Sem mov.", produto: "Financiamento Imob.", corretor: "Bruno Tavares", imob: "Independente", analista: "—", criado: "18/05/2026", upd: "20/05/2026", pend: 5 },
];

const statusTone: Record<string, string> = {
  "Em análise": "bg-amber-50 text-amber-700",
  "Documentação": "bg-blue-50 text-blue-700",
  "Aprovado": "bg-emerald-50 text-emerald-700",
  "Reprovado": "bg-red-50 text-red-700",
  "Simulação": "bg-indigo-50 text-indigo-700",
  "Sem mov.": "bg-slate-100 text-slate-700",
};

export function CrmConsultas({ scope }: { scope: CrmScope }) {
  const [tab, setTab] = useState<Tab>("clientes");
  const isCorr = scope === "correspondente";
  const rows = isCorr ? baseClientes : baseClientes.filter((r) => r.corretor === "Mariana Lopes");

  const filters = isCorr
    ? ["Nome", "CPF/CNPJ", "Telefone", "E-mail", "Status", "Produto", "Corretor", "Imobiliária", "Analista", "Backoffice", "Comercial", "Cidade", "UF", "Período", "Origem", "Possui simulação", "Possui proposta", "Possui pendência"]
    : ["Nome", "CPF/CNPJ", "Telefone", "E-mail", "Status", "Produto", "Cidade", "UF", "Período", "Origem", "Possui simulação", "Possui proposta", "Possui pendência"];

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`CRM · ${isCorr ? "Correspondente" : "Corretor"}`}
        title="Consultas"
        subtitle={isCorr ? "Consulta unificada de toda a base." : "Consulta limitada à sua carteira."}
      />

      {/* Search bar */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar por nome, CPF/CNPJ, telefone ou e-mail"
              className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </div>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
            <Filter className="h-3.5 w-3.5" /> Filtros avançados
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-graphite hover:border-brand/40 hover:text-brand"
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-semibold",
              tab === t.key ? "bg-brand text-brand-foreground" : "text-graphite hover:bg-secondary",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">Cliente</th>
                <th className="px-3 py-2.5 font-semibold">CPF/CNPJ</th>
                <th className="px-3 py-2.5 font-semibold">Contato</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Produto</th>
                {isCorr && <th className="px-3 py-2.5 font-semibold">Corretor</th>}
                {isCorr && <th className="px-3 py-2.5 font-semibold">Imobiliária</th>}
                <th className="px-3 py-2.5 font-semibold">Analista</th>
                <th className="px-3 py-2.5 font-semibold">Criado</th>
                <th className="px-3 py-2.5 font-semibold">Atualizado</th>
                <th className="px-3 py-2.5 font-semibold">Pend.</th>
                <th className="px-3 py-2.5 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.doc} className="hover:bg-secondary/40">
                  <td className="px-3 py-2.5 font-semibold text-graphite">{r.nome}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.doc}</td>
                  <td className="px-3 py-2.5">
                    <div className="text-graphite">{r.tel}</div>
                    <div className="text-[11px] text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusTone[r.status] ?? "bg-secondary text-graphite"}`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-graphite">{r.produto}</td>
                  {isCorr && <td className="px-3 py-2.5 text-graphite">{r.corretor}</td>}
                  {isCorr && <td className="px-3 py-2.5 text-graphite">{r.imob}</td>}
                  <td className="px-3 py-2.5 text-graphite">{r.analista}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.criado}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.upd}</td>
                  <td className="px-3 py-2.5">
                    {r.pend > 0 ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{r.pend}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      {[
                        { I: Eye, t: "Visualizar" },
                        { I: Pencil, t: "Editar" },
                        { I: Users, t: "Vínculos" },
                        { I: Building2, t: "Vendedores" },
                        { I: Home, t: "Imóveis" },
                        { I: FileText, t: "Documentos" },
                        { I: Calculator, t: "Criar simulação" },
                        { I: Paperclip, t: "Anexar documento" },
                        { I: StickyNote, t: "Observação" },
                        { I: History, t: "Histórico" },
                        { I: Power, t: "Inativar" },
                      ].map(({ I, t }) => (
                        <button
                          key={t}
                          type="button"
                          title={t}
                          className="grid h-7 w-7 place-items-center rounded hover:bg-secondary hover:text-brand"
                        >
                          <I className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span>Mostrando {rows.length} de {isCorr ? "1.284" : "186"}</span>
          <div className="flex items-center gap-1">
            <button className="rounded border border-border px-2 py-1 hover:border-brand/40">Anterior</button>
            <button className="rounded border border-brand bg-brand px-2 py-1 font-semibold text-brand-foreground">1</button>
            <button className="rounded border border-border px-2 py-1 hover:border-brand/40">2</button>
            <button className="rounded border border-border px-2 py-1 hover:border-brand/40">3</button>
            <button className="rounded border border-border px-2 py-1 hover:border-brand/40">Próximo</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
