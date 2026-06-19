// Recorrências
import { useState } from "react";
import { Plus, Pause, Play, X, RefreshCw, Calendar, Edit } from "lucide-react";
import { PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { recorrencias, categoriaById, contaById } from "@/lib/financeiro/mock-data";
import { formatBRL, formatData } from "@/lib/operacional/formatters";

const TOKENS = {
  brand: "#000f9f", success: "#15803d", warning: "#d97706",
  direction: "#f5333f", info: "#2563eb", muted: "#6b7280",
};

const statusCor: Record<string, string> = {
  "Ativa": TOKENS.success, "Pausada": TOKENS.warning, "Cancelada": TOKENS.muted, "Encerrada": TOKENS.direction,
};

export function RecorrenciasView({ escopo }: { escopo: "correspondente" | "corretor" }) {
  const dados = escopo === "corretor" ? recorrencias.filter(r => r.tipo === "pagar").slice(0, 3) : recorrencias;
  const [tipo, setTipo] = useState<"todos" | "receber" | "pagar">("todos");

  const filtradas = dados.filter(r => tipo === "todos" || r.tipo === tipo);

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title="Recorrências"
        subtitle="Lançamentos automáticos de receitas e despesas recorrentes."
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Gerar próximas</Button>
            <Button size="sm" className="bg-brand text-white hover:bg-brand/90"><Plus className="h-4 w-4 mr-1" />Nova recorrência</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Ativas" value={String(dados.filter(r => r.status === "Ativa").length)} accent={TOKENS.success} />
        <KpiCard label="Pausadas" value={String(dados.filter(r => r.status === "Pausada").length)} accent={TOKENS.warning} />
        <KpiCard label="Receitas recorrentes" value={formatBRL(dados.filter(r => r.tipo === "receber" && r.status === "Ativa").reduce((s, r) => s + r.valor, 0))} accent={TOKENS.brand} />
        <KpiCard label="Despesas recorrentes" value={formatBRL(dados.filter(r => r.tipo === "pagar" && r.status === "Ativa").reduce((s, r) => s + r.valor, 0))} accent={TOKENS.direction} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        {(["todos", "receber", "pagar"] as const).map(t => (
          <button key={t} onClick={() => setTipo(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tipo === t ? "bg-brand text-white" : "border border-input bg-background text-graphite"}`}>
            {t === "todos" ? "Todas" : t === "receber" ? "A Receber" : "A Pagar"}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Dia venc.</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Próx. geração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map(r => {
              const cat = categoriaById(r.categoriaId);
              const cor = statusCor[r.status];
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-graphite">{r.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={r.tipo === "receber" ? "text-green-700 border-green-200" : "text-red-700 border-red-200"}>
                      {r.tipo === "receber" ? "A Receber" : "A Pagar"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{cat?.nome}</TableCell>
                  <TableCell className="text-sm">{r.frequencia}</TableCell>
                  <TableCell className="text-sm">Dia {r.diaVencimento}</TableCell>
                  <TableCell className="text-right font-bold text-graphite">
                    {formatBRL(r.valor)}
                    {r.valorVariavel && <span className="text-[10px] text-muted-foreground ml-1">var.</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatData(r.proximaGeracao)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: cor + "15", color: cor }}>{r.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button title="Editar" className="rounded p-1 hover:bg-secondary"><Edit className="h-3.5 w-3.5" /></button>
                      {r.status === "Ativa" ? (
                        <button title="Pausar" className="rounded p-1 hover:bg-secondary"><Pause className="h-3.5 w-3.5 text-amber-600" /></button>
                      ) : (
                        <button title="Retomar" className="rounded p-1 hover:bg-secondary"><Play className="h-3.5 w-3.5 text-green-700" /></button>
                      )}
                      <button title="Gerar próxima" className="rounded p-1 hover:bg-secondary"><Calendar className="h-3.5 w-3.5 text-brand" /></button>
                      <button title="Cancelar" className="rounded p-1 hover:bg-secondary"><X className="h-3.5 w-3.5 text-red-600" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Frequências disponíveis</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Semanal", "Quinzenal", "Mensal", "Bimestral", "Trimestral", "Semestral", "Anual", "Personalizada"].map(f => (
            <span key={f} className="rounded-md border border-border bg-background px-2.5 py-1 text-graphite">{f}</span>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 mt-4">Opções de edição</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Alterar somente esta parcela", "Alterar esta e futuras", "Alterar toda a recorrência"].map(f => (
            <span key={f} className="rounded-md border border-border bg-background px-2.5 py-1 text-graphite">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
