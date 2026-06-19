// Tela compartilhada de Lançamentos (Receber / Pagar)
import { useMemo, useState } from "react";
import {
  Plus, Search, Filter, Download, MoreVertical, CheckCircle2, X,
  Paperclip, RotateCcw, Copy, Calendar, AlertTriangle,
} from "lucide-react";
import { PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  contasReceber, contasPagar, categoriaById, contaById, clientes, propostas,
} from "@/lib/financeiro/mock-data";
import { formatBRL, formatData } from "@/lib/operacional/formatters";

const TOKENS = {
  success: "#15803d", warning: "#d97706", direction: "#f5333f",
  brand: "#000f9f", info: "#2563eb", muted: "#6b7280",
};

const statusReceberColor: Record<string, string> = {
  "Recebido": TOKENS.success,
  "Recebido parcialmente": TOKENS.info,
  "Em aberto": TOKENS.muted,
  "Vencido": TOKENS.direction,
  "Cancelado": TOKENS.muted,
  "Em negociação": TOKENS.warning,
  "Estornado": TOKENS.direction,
};
const statusPagarColor: Record<string, string> = {
  "Pago": TOKENS.success,
  "Pago parcialmente": TOKENS.info,
  "Em aberto": TOKENS.muted,
  "Vencido": TOKENS.direction,
  "Cancelado": TOKENS.muted,
  "Agendado": TOKENS.brand,
  "Em aprovação": TOKENS.warning,
};

export function LancamentosLista({ tipo, escopo }: { tipo: "receber" | "pagar"; escopo: "correspondente" | "corretor" }) {
  const dadosBase = tipo === "receber" ? contasReceber : contasPagar;
  const dados = useMemo(() => (
    escopo === "corretor" && tipo === "receber" ? dadosBase.filter(d => d.corretorId === "u-cor-1") : dadosBase
  ), [dadosBase, escopo, tipo]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");

  const filtrados = useMemo(() => dados.filter(d => {
    if (q && !d.descricao.toLowerCase().includes(q.toLowerCase())) return false;
    if (status !== "todos" && d.status !== status) return false;
    return true;
  }), [dados, q, status]);

  const total = dados.reduce((s, d) => s + d.valor, 0);
  const recebidos = dados.filter(d => d.status === "Recebido" || d.status === "Pago").reduce((s, d) => s + d.valor, 0);
  const vencidos = dados.filter(d => d.status === "Vencido").reduce((s, d) => s + d.valor, 0);
  const aberto = total - recebidos - vencidos;

  const isReceber = tipo === "receber";

  const statusList = isReceber
    ? ["todos", "Em aberto", "Recebido", "Recebido parcialmente", "Vencido", "Em negociação", "Cancelado", "Estornado"]
    : ["todos", "Em aberto", "Pago", "Pago parcialmente", "Vencido", "Agendado", "Em aprovação", "Cancelado"];

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title={isReceber ? (escopo === "corretor" ? "Meus Recebíveis" : "Contas a Receber") : "Contas a Pagar"}
        subtitle={isReceber
          ? "Recebíveis vinculados a propostas, clientes e corretores."
          : "Despesas, fornecedores e obrigações operacionais."}
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
            <Button size="sm" className="bg-brand text-white hover:bg-brand/90"><Plus className="h-4 w-4 mr-1" />Novo lançamento</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total" value={formatBRL(total)} accent={TOKENS.brand} caption={`${dados.length} lançamentos`} />
        <KpiCard label={isReceber ? "Recebido" : "Pago"} value={formatBRL(recebidos)} accent={TOKENS.success} />
        <KpiCard label="Em aberto" value={formatBRL(aberto)} accent={TOKENS.info} />
        <KpiCard label="Vencido" value={formatBRL(vencidos)} accent={TOKENS.direction} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por descrição..." className="pl-8 h-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-graphite">
          {statusList.map(s => <option key={s} value={s}>{s === "todos" ? "Todos os status" : s}</option>)}
        </select>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Mais filtros</Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>{isReceber ? "Cliente" : "Fornecedor"}</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map(d => {
              const cat = categoriaById(d.categoriaId);
              const cli = d.clienteId ? clientes.find(c => c.id === d.clienteId) : null;
              const cor = isReceber ? statusReceberColor[d.status] : statusPagarColor[d.status];
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="font-medium text-graphite">{d.descricao}</div>
                    {d.propostaId && <div className="text-[11px] text-muted-foreground">Proposta vinculada</div>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{isReceber ? (cli?.nome ?? "—") : (d.fornecedor ?? "—")}</TableCell>
                  <TableCell>
                    {cat && <Badge variant="outline" style={{ borderColor: cat.cor + "60", color: cat.cor }}>{cat.nome}</Badge>}
                  </TableCell>
                  <TableCell className="text-sm">{formatData(d.vencimento)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: cor + "15", color: cor }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cor }} />
                      {d.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.forma}</TableCell>
                  <TableCell className="text-right font-bold text-graphite">{formatBRL(d.valor)}</TableCell>
                  <TableCell>
                    <button className="text-muted-foreground hover:text-graphite"><MoreVertical className="h-4 w-4" /></button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Ações disponíveis no lançamento</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { l: isReceber ? "Receber" : "Pagar", i: CheckCircle2 },
            { l: "Receber/Pagar parcial", i: CheckCircle2 },
            { l: "Agendar", i: Calendar },
            { l: "Anexar comprovante", i: Paperclip },
            { l: "Duplicar", i: Copy },
            { l: "Gerar recorrência", i: RotateCcw },
            { l: "Cancelar", i: X },
            { l: "Estornar", i: AlertTriangle },
          ].map(a => (
            <span key={a.l} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-graphite">
              <a.i className="h-3.5 w-3.5" />{a.l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
