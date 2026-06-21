// Categorias Financeiras e Centros de Custo
import { useState } from "react";
import { Plus, Edit, Search } from "lucide-react";
import { PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categorias, centrosCusto } from "@/lib/financeiro/mock-data";
import { useGlobalSearch } from "@/components/portal/global-search";

export function CategoriasView() {
  const [tab, setTab] = useState<"categorias" | "centros">("categorias");
  const [q, setQ] = useState("");
  const globalQ = useGlobalSearch();
  const term = (q || globalQ).toLowerCase();

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title="Categorias e Centros de Custo"
        subtitle="Organize receitas, despesas e comissões em categorias e centros de custo."
        right={
          <Button size="sm" className="bg-brand text-white hover:bg-brand/90">
            <Plus className="h-4 w-4 mr-1" />Novo {tab === "categorias" ? "categoria" : "centro de custo"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Categorias" value={String(categorias.length)} accent="#000f9f" />
        <KpiCard label="Receitas" value={String(categorias.filter(c => c.tipo === "Receita").length)} accent="#15803d" />
        <KpiCard label="Despesas" value={String(categorias.filter(c => c.tipo !== "Receita").length)} accent="#f5333f" />
        <KpiCard label="Centros de Custo" value={String(centrosCusto.length)} accent="#2563eb" />
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          {(["categorias", "centros"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded ${tab === t ? "bg-brand text-white" : "text-muted-foreground"}`}>
              {t === "categorias" ? "Categorias" : "Centros de Custo"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-8 h-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {tab === "categorias" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cor</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Centro de custo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.filter(c => !term || c.nome.toLowerCase().includes(term)).map(c => {
                const cc = centrosCusto.find(x => x.id === c.centroCustoId);
                return (
                  <TableRow key={c.id}>
                    <TableCell><span className="block h-5 w-5 rounded" style={{ background: c.cor }} /></TableCell>
                    <TableCell className="font-medium text-graphite">{c.nome}</TableCell>
                    <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cc?.nome ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold ${c.ativa ? "text-green-700" : "text-muted-foreground"}`}>
                        {c.ativa ? "Ativa" : "Inativa"}
                      </span>
                    </TableCell>
                    <TableCell><button className="rounded p-1 hover:bg-secondary"><Edit className="h-3.5 w-3.5" /></button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centrosCusto.filter(c => !term || c.nome.toLowerCase().includes(term)).map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-graphite">{c.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.descricao ?? "—"}</TableCell>
                  <TableCell><button className="rounded p-1 hover:bg-secondary"><Edit className="h-3.5 w-3.5" /></button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
