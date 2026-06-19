// Atualização de Proposta — visão do Corretor.
// Backlog entre corretor e cliente, com SLA, chat com cliente e
// botão para enviar/segurar atualização para o cliente.

import { useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, Bell, BellOff, CheckCircle2, Clock,
  MessageSquare, RefreshCw, Search, X,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PopoutChat } from "@/components/operacional/popout-chat";
import {
  bancoById, clienteById, propostas as propostasMock, usuarioById,
} from "@/lib/operacional/mock-data";
import { formatBRL, formatDataHora } from "@/lib/operacional/formatters";
import { ETAPAS_PROPOSTA, type EtapaProposta, type Proposta } from "@/lib/operacional/types";

type StatusAtual = "Pendente atualização" | "Atualizado" | "Adiado";

type AtualizacaoState = {
  status: StatusAtual;
  ultimaNotificacao?: string;
  notas?: string;
};

const USUARIO_CORRETOR = "u-cor-1";

export function AtualizacaoProposta() {
  // Apenas propostas vinculadas ao corretor logado
  const baseProps = useMemo(
    () => propostasMock.filter((p) => p.corretorId === USUARIO_CORRETOR),
    [],
  );

  // Estado de atualização por proposta (mock controlado)
  const [estado, setEstado] = useState<Record<string, AtualizacaoState>>(() => {
    const init: Record<string, AtualizacaoState> = {};
    baseProps.forEach((p, i) => {
      init[p.id] = {
        status: i % 3 === 0 ? "Atualizado" : i % 3 === 1 ? "Adiado" : "Pendente atualização",
        ultimaNotificacao: i % 3 === 0 ? p.atualizadaEm : undefined,
      };
    });
    return init;
  });

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | StatusAtual>("");
  const [propAtiva, setPropAtiva] = useState<Proposta | null>(null);

  const lista = useMemo(() => {
    return baseProps.filter((p) => {
      const c = clienteById(p.clienteId);
      const txt = `${p.numero} ${c?.nome ?? ""}`.toLowerCase();
      if (busca && !txt.includes(busca.toLowerCase())) return false;
      if (filtroStatus && estado[p.id]?.status !== filtroStatus) return false;
      return true;
    });
  }, [baseProps, busca, filtroStatus, estado]);

  const pendentes = baseProps.filter((p) => estado[p.id]?.status === "Pendente atualização").length;
  const slaVencidos = baseProps.filter((p) => new Date(p.slaPrazo).getTime() < Date.now()).length;

  function avancarEtapa(prop: Proposta) {
    const idx = ETAPAS_PROPOSTA.indexOf(prop.etapa);
    const next: EtapaProposta = ETAPAS_PROPOSTA[Math.min(idx + 1, ETAPAS_PROPOSTA.length - 1)];
    prop.etapa = next;
    prop.atualizadaEm = new Date().toISOString();
    setEstado((s) => ({
      ...s,
      [prop.id]: { ...s[prop.id], status: "Pendente atualização" },
    }));
  }

  function notificarCliente(prop: Proposta) {
    setEstado((s) => ({
      ...s,
      [prop.id]: {
        status: "Atualizado",
        ultimaNotificacao: new Date().toISOString(),
        notas: s[prop.id]?.notas,
      },
    }));
  }

  function adiar(prop: Proposta) {
    setEstado((s) => ({
      ...s,
      [prop.id]: { ...s[prop.id], status: "Adiado" },
    }));
  }

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Operacional · Atualização"
        title="Atualização de Proposta"
        subtitle="Backlog entre corretor e cliente — controle de SLA de atualização, comunicação e avanço de etapas."
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiSmall label="Total" valor={baseProps.length} accent="#3b82f6" />
        <KpiSmall label="Pendentes" valor={pendentes} accent="#f59e0b" />
        <KpiSmall label="SLA vencido" valor={slaVencidos} accent="#dc2626" />
        <KpiSmall label="Atualizadas" valor={baseProps.length - pendentes} accent="#16a34a" />
      </section>

      <section className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou número da proposta…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
          {(["", "Pendente atualização", "Atualizado", "Adiado"] as const).map((s) => (
            <button
              key={s || "todos"}
              onClick={() => setFiltroStatus(s)}
              className={`rounded px-2.5 py-1 text-xs font-medium ${filtroStatus === s ? "bg-graphite text-white" : "text-muted-foreground hover:text-graphite"}`}
            >
              {s || "Todos"}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Proposta</th>
              <th className="px-3 py-2 text-left font-medium">Cliente</th>
              <th className="px-3 py-2 text-left font-medium">Banco</th>
              <th className="px-3 py-2 text-left font-medium">Etapa</th>
              <th className="px-3 py-2 text-left font-medium">SLA</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => {
              const c = clienteById(p.clienteId);
              const b = bancoById(p.bancoId);
              const st = estado[p.id];
              const slaMs = new Date(p.slaPrazo).getTime() - Date.now();
              const slaDias = Math.ceil(slaMs / 86400000);
              const slaVencido = slaMs < 0;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-graphite">{p.numero}</div>
                    <div className="text-[10px] text-muted-foreground">{formatBRL(p.valor)}</div>
                  </td>
                  <td className="px-3 py-2">{c?.nome ?? "—"}</td>
                  <td className="px-3 py-2">{b?.sigla ?? "—"}</td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary">{p.etapa}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${slaVencido ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      <Clock className="h-3 w-3" />
                      {slaVencido ? `Vencido ${Math.abs(slaDias)}d` : `${slaDias}d`}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={st?.status ?? "Pendente atualização"} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => avancarEtapa(p)}>
                        <ArrowRight className="h-3.5 w-3.5" /> Avançar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => notificarCliente(p)}>
                        <Bell className="h-3.5 w-3.5" /> Notificar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => adiar(p)}>
                        <BellOff className="h-3.5 w-3.5" /> Adiar
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setPropAtiva(p)}>
                        <MessageSquare className="h-3.5 w-3.5" /> Abrir
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                  Nenhuma proposta encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {propAtiva && (
        <DetalheAtualizacao
          proposta={propAtiva}
          onClose={() => setPropAtiva(null)}
          onNotificar={notificarCliente}
          onAvancar={avancarEtapa}
          estado={estado[propAtiva.id]}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: StatusAtual }) {
  const map: Record<StatusAtual, { cls: string; icon: typeof CheckCircle2 }> = {
    "Pendente atualização": { cls: "bg-amber-100 text-amber-800", icon: AlertCircle },
    "Atualizado": { cls: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
    "Adiado": { cls: "bg-slate-100 text-slate-700", icon: RefreshCw },
  };
  const Icon = map[status].icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${map[status].cls}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}

function KpiSmall({ label, valor, accent }: { label: string; valor: number; accent: string }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-graphite">{valor}</p>
      </div>
    </article>
  );
}

function DetalheAtualizacao({
  proposta, onClose, onNotificar, onAvancar, estado,
}: {
  proposta: Proposta;
  onClose: () => void;
  onNotificar: (p: Proposta) => void;
  onAvancar: (p: Proposta) => void;
  estado?: AtualizacaoState;
}) {
  const cli = clienteById(proposta.clienteId);
  const banco = bancoById(proposta.bancoId);
  const corretor = usuarioById(proposta.corretorId);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-background"
      >
        <header className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{proposta.numero}</p>
              <h2 className="text-lg font-bold text-graphite">{cli?.nome}</h2>
              <p className="text-xs text-muted-foreground">{banco?.nome} · {formatBRL(proposta.valor)}</p>
            </div>
            <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{proposta.etapa}</Badge>
            <Badge variant="outline">{proposta.status}</Badge>
            <StatusBadge status={estado?.status ?? "Pendente atualização"} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="gap-1" onClick={() => onAvancar(proposta)}>
              <ArrowRight className="h-3.5 w-3.5" /> Avançar etapa
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => onNotificar(proposta)}>
              <Bell className="h-3.5 w-3.5" /> Notificar cliente
            </Button>
          </div>
          {estado?.ultimaNotificacao && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Última notificação ao cliente: {formatDataHora(estado.ultimaNotificacao)}
            </p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <PopoutChat
            titulo={`Chat com ${cli?.nome ?? "cliente"} — ${proposta.numero}`}
            storageKey={`atualizacao-${proposta.id}`}
            placeholder="Mensagem para o cliente…"
            mensagens={[
              { autor: cli?.nome ?? "Cliente", texto: "Olá! Como está minha proposta?", quando: "ontem 18:42" },
              { autor: corretor?.nome ?? "Corretor", texto: `Proposta enviada ao ${banco?.sigla}. Aguardando análise.`, quando: "ontem 19:01" },
              { autor: cli?.nome ?? "Cliente", texto: "Perfeito, fico no aguardo!", quando: "hoje 09:15" },
            ]}
          />
        </div>
      </aside>
    </div>
  );
}
