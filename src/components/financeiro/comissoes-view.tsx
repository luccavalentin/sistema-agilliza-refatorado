// Comissões — visão correspondente / corretor
import { useMemo, useState } from "react";
import { Plus, Search, Download, MoreVertical, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { PanelHeader, KpiCard } from "@/components/dashboards/primitives";
import {
  DashboardDetailProvider,
  useDashboardDetail,
  buildMockRows,
} from "@/components/dashboards/detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clientes, propostas, bancos, usuarios } from "@/lib/financeiro/mock-data";
import { useComissoes } from "@/data/hooks";
import { formatBRL, formatData } from "@/lib/operacional/formatters";

const TOKENS = {
  brand: "#000f9f", success: "#15803d", direction: "#f5333f",
  warning: "#d97706", info: "#2563eb", brandSoft: "#4a55c4", muted: "#6b7280",
};

const statusCor: Record<string, string> = {
  "Prevista": TOKENS.brandSoft,
  "Aguardando aprovação": TOKENS.warning,
  "Liberada": TOKENS.info,
  "Pendente": TOKENS.muted,
  "Bloqueada": TOKENS.direction,
  "Paga": TOKENS.success,
  "Cancelada": TOKENS.muted,
  "Estornada": TOKENS.direction,
};

export function ComissoesView({ escopo }: { escopo: "correspondente" | "corretor" }) {
  return (
    <DashboardDetailProvider>
      <ComissoesViewInner escopo={escopo} />
    </DashboardDetailProvider>
  );
}

function ComissoesViewInner({ escopo }: { escopo: "correspondente" | "corretor" }) {
  const { open } = useDashboardDetail();
  const drill = (title: string, value: string) =>
    open({
      title,
      subtitle: `Comissões · ${escopo === "correspondente" ? "Correspondente" : "Corretor"}`,
      period: "Últimos 30 dias",
      kpis: [
        { label: title, value },
        { label: "Escopo", value: escopo === "correspondente" ? "Ecossistema" : "Minhas comissões" },
        { label: "Período", value: "30 dias" },
        { label: "Registros", value: "20" },
      ],
      rows: buildMockRows(20),
    });
  const comissoes = useComissoes();
  const dados = useMemo(() => (
    escopo === "corretor" ? comissoes.filter((c) => c.corretorId === "u-cor-1") : comissoes
  ), [escopo, comissoes]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todos");

  const filtradas = dados.filter(c => {
    if (status !== "todos" && c.status !== status) return false;
    const cli = clientes.find(x => x.id === c.clienteId);
    if (q && !(cli?.nome.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const tot = (s: string) => dados.filter(c => c.status === s).reduce((a, c) => a + c.valor, 0);
  const cards = [
    { label: "Previstas", value: formatBRL(tot("Prevista")), accent: TOKENS.brandSoft },
    { label: "Liberadas", value: formatBRL(tot("Liberada")), accent: TOKENS.info },
    { label: "Pagas", value: formatBRL(tot("Paga")), accent: TOKENS.success },
    { label: "Pendentes", value: formatBRL(tot("Pendente") + tot("Aguardando aprovação")), accent: TOKENS.warning },
    { label: "Bloqueadas", value: formatBRL(tot("Bloqueada")), accent: TOKENS.direction, caption: `${dados.filter(c => c.bloqueada).length} comissões` },
    { label: "Total", value: formatBRL(dados.reduce((s, c) => s + c.valor, 0)), accent: TOKENS.brand },
  ];

  return (
    <div className="space-y-6 p-6">
      <PanelHeader
        eyebrow="Gestão Financeira"
        title={escopo === "corretor" ? "Minhas Comissões" : "Comissões"}
        subtitle={escopo === "corretor"
          ? "Acompanhe suas comissões previstas, liberadas, pagas e bloqueadas."
          : "Gestão de comissões dos corretores vinculadas a propostas e bancos."}
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
            {escopo === "correspondente" && <Button size="sm" className="bg-brand text-white hover:bg-brand/90"><Plus className="h-4 w-4 mr-1" />Nova comissão</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map(c => <KpiCard key={c.label} {...c} onClick={() => drill(c.label, c.value)} />)}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por cliente..." className="pl-8 h-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-graphite">
          {["todos", "Prevista", "Aguardando aprovação", "Liberada", "Pendente", "Bloqueada", "Paga", "Cancelada", "Estornada"]
            .map(s => <option key={s} value={s}>{s === "todos" ? "Todos os status" : s}</option>)}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proposta</TableHead>
              <TableHead>Cliente</TableHead>
              {escopo === "correspondente" && <TableHead>Corretor</TableHead>}
              <TableHead>Banco</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prev.</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map(c => {
              const cli = clientes.find(x => x.id === c.clienteId);
              const prop = propostas.find(p => p.id === c.propostaId);
              const banco = bancos.find(b => b.id === c.bancoId);
              const cor = statusCor[c.status];
              const corretor = usuarios.find(u => u.id === c.corretorId);
              return (
                <TableRow key={c.id} className={c.bloqueada ? "bg-red-50/40" : ""}>
                  <TableCell className="font-medium text-graphite">{prop?.numero ?? "—"}</TableCell>
                  <TableCell className="text-sm">{cli?.nome ?? "—"}</TableCell>
                  {escopo === "correspondente" && <TableCell className="text-sm">{corretor?.nome ?? "—"}</TableCell>}
                  <TableCell className="text-sm text-muted-foreground">{banco?.sigla ?? "—"}</TableCell>
                  <TableCell className="text-xs">{c.produto}</TableCell>
                  <TableCell className="text-right text-sm">{formatBRL(c.baseCalculo)}</TableCell>
                  <TableCell className="text-right text-sm">{c.percentual.toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-bold text-graphite">{formatBRL(c.valor)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: cor + "15", color: cor }}>
                      {c.bloqueada && <Lock className="h-3 w-3" />}
                      {c.status}
                    </span>
                    {c.bloqueada && c.motivoBloqueio && (
                      <p className="text-[10px] text-red-700 mt-1">{c.motivoBloqueio}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatData(c.dataPrevista)}</TableCell>
                  <TableCell><button className="text-muted-foreground hover:text-graphite"><MoreVertical className="h-4 w-4" /></button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {escopo === "correspondente" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Ações sobre comissões</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { l: "Liberar", i: CheckCircle2 }, { l: "Bloquear", i: Lock }, { l: "Desbloquear", i: Unlock },
              { l: "Pagar", i: CheckCircle2 }, { l: "Pagar parcial", i: CheckCircle2 },
              { l: "Gerar a partir de proposta", i: Plus }, { l: "Anexar comprovante", i: Download },
            ].map(a => (
              <span key={a.l} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-graphite">
                <a.i className="h-3.5 w-3.5" />{a.l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
