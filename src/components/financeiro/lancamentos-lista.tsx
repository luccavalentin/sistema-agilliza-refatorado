// Tela compartilhada de Lançamentos (Receber / Pagar)
import { useMemo, useState } from "react";
import {
  Plus, Search, Filter, Download, MoreVertical, CheckCircle2, X,
  Paperclip, RotateCcw, Copy, Calendar, AlertTriangle, Layers, FileText,
} from "lucide-react";
import { PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoriaById, clientes } from "@/lib/financeiro/mock-data";
import { useLancamentos } from "@/data/hooks";
import { adicionarLancamento, marcarLancamentoPago } from "@/data/repositories";
import { formatBRL, formatData } from "@/lib/operacional/formatters";
import { LancamentoFormDialog } from "./lancamento-form-dialog";
import type { Lancamento, NaturezaLancamento } from "@/lib/financeiro/types";
import { useGlobalSearch } from "@/components/portal/global-search";

const TOKENS = {
  success: "#15803d", warning: "#d97706", direction: "#f5333f",
  brand: "#000f9f", info: "#2563eb", muted: "#6b7280",
};

const statusReceberColor: Record<string, string> = {
  "Recebido": TOKENS.success, "Recebido parcialmente": TOKENS.info,
  "Em aberto": TOKENS.muted, "Vencido": TOKENS.direction,
  "Cancelado": TOKENS.muted, "Em negociação": TOKENS.warning, "Estornado": TOKENS.direction,
};
const statusPagarColor: Record<string, string> = {
  "Pago": TOKENS.success, "Pago parcialmente": TOKENS.info,
  "Em aberto": TOKENS.muted, "Vencido": TOKENS.direction,
  "Cancelado": TOKENS.muted, "Agendado": TOKENS.brand, "Em aprovação": TOKENS.warning,
};

const naturezaConfig: Record<NaturezaLancamento, { color: string; icon: any; bg: string }> = {
  "Esporádico": { color: TOKENS.muted, icon: FileText, bg: `${TOKENS.muted}15` },
  "Recorrente": { color: TOKENS.brand, icon: RotateCcw, bg: `${TOKENS.brand}15` },
  "Parcelado": { color: TOKENS.warning, icon: Layers, bg: `${TOKENS.warning}15` },
};

export function LancamentosLista({ tipo, escopo }: { tipo: "receber" | "pagar"; escopo: "correspondente" | "corretor" }) {
  const lancamentos = useLancamentos();
  const dadosBase = useMemo(() => lancamentos.filter((l) => l.tipo === tipo), [lancamentos, tipo]);
  const dados = useMemo(() => (
    escopo === "corretor" && tipo === "receber" ? dadosBase.filter((d) => d.corretorId === "u-cor-1") : dadosBase
  ), [dadosBase, escopo, tipo]);

  const [q, setQ] = useState("");
  const globalQ = useGlobalSearch();
  const [status, setStatus] = useState<string>("todos");
  const [natureza, setNatureza] = useState<"todos" | NaturezaLancamento>("todos");
  const [openForm, setOpenForm] = useState(false);

  const filtrados = useMemo(() => {
    const term = (q || globalQ).toLowerCase();
    return dados.filter(d => {
      if (term && !d.descricao.toLowerCase().includes(term)) return false;
      if (status !== "todos" && d.status !== status) return false;
      if (natureza !== "todos" && d.natureza !== natureza) return false;
      return true;
    });
  }, [dados, q, globalQ, status, natureza]);

  const sumBy = (pred: (d: Lancamento) => boolean) => dados.filter(pred).reduce((s, d) => s + d.valor, 0);
  const totalEsp = sumBy(d => d.natureza === "Esporádico");
  const totalRec = sumBy(d => d.natureza === "Recorrente");
  const totalParc = sumBy(d => d.natureza === "Parcelado");
  const vencidos = sumBy(d => d.status === "Vencido");

  const isReceber = tipo === "receber";

  const statusList = isReceber
    ? ["todos", "Em aberto", "Recebido", "Recebido parcialmente", "Vencido", "Em negociação", "Cancelado", "Estornado"]
    : ["todos", "Em aberto", "Pago", "Pago parcialmente", "Vencido", "Agendado", "Em aprovação", "Cancelado"];

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title={isReceber ? (escopo === "corretor" ? "Meus Recebíveis" : "Contas a Receber") : "Contas a Pagar"}
        subtitle="Cadastre lançamentos esporádicos, recorrentes ou parcelados — recorrência configurada no próprio formulário."
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
            <Button size="sm" className="bg-brand text-white hover:bg-brand/90" onClick={() => setOpenForm(true)}>
              <Plus className="h-4 w-4 mr-1" />Novo lançamento
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={`${isReceber ? "A receber" : "A pagar"} — Esporádico`} value={formatBRL(totalEsp)} accent={TOKENS.muted}
          caption={`${dados.filter(d => d.natureza === "Esporádico").length} lançamentos`} icon={FileText} />
        <KpiCard label={`${isReceber ? "A receber" : "A pagar"} — Recorrente`} value={formatBRL(totalRec)} accent={TOKENS.brand}
          caption={`${dados.filter(d => d.natureza === "Recorrente").length} ativos`} icon={RotateCcw} />
        <KpiCard label={`${isReceber ? "A receber" : "A pagar"} — Parcelado`} value={formatBRL(totalParc)} accent={TOKENS.warning}
          caption={`${dados.filter(d => d.natureza === "Parcelado").length} parcelas`} icon={Layers} />
        <KpiCard label="Vencido" value={formatBRL(vencidos)} accent={TOKENS.direction} icon={AlertTriangle} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por descrição..." className="pl-8 h-9" />
        </div>
        <select value={natureza} onChange={(e) => setNatureza(e.target.value as any)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-graphite">
          <option value="todos">Todas naturezas</option>
          <option value="Esporádico">Esporádico</option>
          <option value="Recorrente">Recorrente</option>
          <option value="Parcelado">Parcelado</option>
        </select>
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
              <TableHead>Natureza</TableHead>
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
              const natCfg = naturezaConfig[d.natureza];
              const NatIco = natCfg.icon;
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="font-medium text-graphite">{d.descricao}</div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mt-0.5">
                      {d.propostaId && <span>• Proposta vinculada</span>}
                      {d.recorrencia && <span>• {d.recorrencia.frequencia} · dia {d.recorrencia.diaVencimento}</span>}
                      {d.parcelamento && <span>• Parcela {d.parcelamento.parcelaAtual}/{d.parcelamento.totalParcelas}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: natCfg.bg, color: natCfg.color }}>
                      <NatIco className="h-3 w-3" />{d.natureza}
                    </span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-brand" />Ações em lançamento recorrente</p>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {["Editar apenas este", "Editar este e os próximos", "Editar toda a recorrência", "Pausar", "Retomar", "Cancelar recorrência", "Gerar próximos", "Alterar vencimento", "Alterar valor", "Marcar como pago/recebido", "Anexar comprovante"].map(a => (
              <span key={a} className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-graphite">{a}</span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-warning" />Ações em lançamento parcelado</p>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {["Editar parcela", "Editar parcelas futuras", "Quitar parcela", "Quitar todas", "Cancelar parcela", "Cancelar parcelamento", "Antecipar parcelas", "Recalcular", "Anexar comprovante", "Ver grupo"].map(a => (
              <span key={a} className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-graphite">{a}</span>
            ))}
          </div>
        </div>
      </div>

      <LancamentoFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        tipo={tipo}
        onSave={(novos) => novos.forEach((n) => adicionarLancamento(n))}
      />
    </div>
  );
}
