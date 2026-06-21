// Conciliação Financeira
import { useMemo, useState } from "react";
import { CheckCircle2, X, AlertTriangle, Paperclip, Download, Filter } from "lucide-react";
import { PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
} from "@/components/dashboards/detail-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { itensConciliacao, contaById, categoriaById, contas } from "@/lib/financeiro/mock-data";
import { formatBRL, formatData } from "@/lib/operacional/formatters";
import { useGlobalSearch } from "@/components/portal/global-search";

const TOKENS = {
  success: "#15803d", warning: "#d97706", direction: "#f5333f",
  info: "#2563eb", brand: "#000f9f", muted: "#6b7280",
};

const statusCor: Record<string, string> = {
  "Conciliado": TOKENS.success,
  "Não conciliado": TOKENS.warning,
  "Divergente": TOKENS.direction,
  "Em revisão": TOKENS.info,
};

export function ConciliacaoView() {
  return (
    <DashboardDetailProvider>
      <ConciliacaoViewInner />
    </DashboardDetailProvider>
  );
}

function ConciliacaoViewInner() {
  const { open } = useDashboardDetail();
  const drill = (title: string, value: string) =>
    open({
      title,
      subtitle: "Conciliação Bancária",
      period: "Período atual",
      kpis: [
        { label: title, value },
        { label: "Origem", value: "Extrato bancário" },
        { label: "Período", value: "Mês corrente" },
        { label: "Registros", value: "20" },
      ],
      rows: buildMockRows(20),
    });
  const [conta, setConta] = useState("todas");
  const [status, setStatus] = useState("todos");
  const globalQ = useGlobalSearch();

  const itens = useMemo(() => itensConciliacao.filter(i => {
    if (conta !== "todas" && i.contaId !== conta) return false;
    if (status !== "todos" && i.status !== status) return false;
    if (globalQ && !i.descricao.toLowerCase().includes(globalQ)) return false;
    return true;
  }), [conta, status, globalQ]);

  const tot = (s: string) => itensConciliacao.filter(i => i.status === s).length;

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title="Conciliação Bancária"
        subtitle="Confronto entre extrato bancário e lançamentos do sistema."
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filtros</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Conciliados" value={String(tot("Conciliado"))} accent={TOKENS.success} onClick={() => drill("Conciliados", String(tot("Conciliado")))} />
        <KpiCard label="Não conciliados" value={String(tot("Não conciliado"))} accent={TOKENS.warning} onClick={() => drill("Não conciliados", String(tot("Não conciliado")))} />
        <KpiCard label="Divergentes" value={String(tot("Divergente"))} accent={TOKENS.direction} onClick={() => drill("Divergentes", String(tot("Divergente")))} />
        <KpiCard label="Em revisão" value={String(tot("Em revisão"))} accent={TOKENS.info} onClick={() => drill("Em revisão", String(tot("Em revisão")))} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <select value={conta} onChange={(e) => setConta(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-graphite">
          <option value="todas">Todas as contas</option>
          {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-graphite">
          {["todos", "Conciliado", "Não conciliado", "Divergente", "Em revisão"].map(s => (
            <option key={s} value={s}>{s === "todos" ? "Todos os status" : s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map(i => {
              const c = contaById(i.contaId);
              const cat = i.categoriaId ? categoriaById(i.categoriaId) : null;
              const cor = statusCor[i.status];
              const positivo = i.valor >= 0;
              return (
                <TableRow key={i.id}>
                  <TableCell className="text-sm">{formatData(i.data)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c?.nome}</TableCell>
                  <TableCell className="text-sm font-medium text-graphite">{i.descricao}</TableCell>
                  <TableCell className="text-xs">{cat?.nome ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.origem}</TableCell>
                  <TableCell className={`text-right font-bold ${positivo ? "text-green-700" : "text-red-700"}`}>
                    {positivo ? "+" : ""}{formatBRL(i.valor)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: cor + "15", color: cor }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cor }} />
                      {i.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button title="Conciliar" className="rounded p-1 hover:bg-secondary"><CheckCircle2 className="h-3.5 w-3.5 text-green-700" /></button>
                      <button title="Divergência" className="rounded p-1 hover:bg-secondary"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" /></button>
                      <button title="Anexar" className="rounded p-1 hover:bg-secondary"><Paperclip className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      <button title="Ignorar" className="rounded p-1 hover:bg-secondary"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
