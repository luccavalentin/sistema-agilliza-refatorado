// Acompanhamento de Proposta — visão do Cliente.
// Timeline da proposta, status atual, próximos passos, documentos
// e chat com o corretor (com opção de soltar janela).

import { useMemo, useState } from "react";
import {
  CheckCircle2, Circle, Clock, FileText, Upload,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopoutChat } from "@/components/operacional/popout-chat";
import {
  bancoById, clienteById, propostas, usuarioById,
} from "@/lib/operacional/mock-data";
import { formatBRL, formatDataHora } from "@/lib/operacional/formatters";
import { ETAPAS_PROPOSTA } from "@/lib/operacional/types";

// Cliente mockado logado: c-1 (João da Silva)
const CLIENTE_ID = "c-1";

export function ClienteAcompanhamento() {
  const minhasProps = useMemo(
    () => [...propostas]
      .filter((p) => p.clienteId === CLIENTE_ID)
      .sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()),
    [],
  );
  const [ativaId, setAtivaId] = useState<string | undefined>(minhasProps[0]?.id);
  const ativa = minhasProps.find((p) => p.id === ativaId);

  if (!ativa) {
    return (
      <div className="space-y-6">
        <PanelHeader
          eyebrow="Cliente · Acompanhamento"
          title="Acompanhar Minha Proposta"
          subtitle="Você ainda não possui propostas em andamento."
        />
      </div>
    );
  }

  const cli = clienteById(ativa.clienteId);
  const banco = bancoById(ativa.bancoId);
  const corretor = usuarioById(ativa.corretorId);
  const etapaIdx = ETAPAS_PROPOSTA.indexOf(ativa.etapa);
  const proxima = ETAPAS_PROPOSTA[Math.min(etapaIdx + 1, ETAPAS_PROPOSTA.length - 1)];

  const docs = [
    { nome: "RG e CPF", enviado: true },
    { nome: "Comprovante de renda", enviado: true },
    { nome: "Comprovante de residência", enviado: true },
    { nome: "Declaração de IR", enviado: false },
    { nome: "Matrícula do imóvel", enviado: false },
  ];

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Cliente · Acompanhamento"
        title="Acompanhar Minha Proposta"
        subtitle={`Olá, ${cli?.nome}. Aqui você acompanha o andamento da sua proposta em tempo real.`}
      />

      {/* Seletor de propostas (se houver mais de uma) */}
      {minhasProps.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {minhasProps.map((p) => (
            <button
              key={p.id}
              onClick={() => setAtivaId(p.id)}
              className={`rounded-md border px-3 py-2 text-xs ${
                p.id === ativaId ? "border-graphite bg-graphite text-white" : "border-border bg-card text-graphite"
              }`}
            >
              {p.numero} · {bancoById(p.bancoId)?.sigla}
            </button>
          ))}
        </div>
      )}

      {/* Resumo da proposta */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {ativa.numero}
            </p>
            <h2 className="mt-1 text-xl font-bold text-graphite">{banco?.nome}</h2>
            <p className="text-sm text-muted-foreground">
              {ativa.produto} · {formatBRL(ativa.valor)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">{ativa.etapa}</Badge>
            <Badge variant="outline">{ativa.status}</Badge>
            <span className="text-[10px] text-muted-foreground">
              Atualizada em {formatDataHora(ativa.atualizadaEm)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Info label="Etapa atual" valor={ativa.etapa} />
          <Info label="Próxima etapa" valor={proxima} />
          <Info label="Corretor" valor={corretor?.nome ?? "—"} />
          <Info label="Prazo" valor={new Date(ativa.slaPrazo).toLocaleDateString("pt-BR")} />
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-graphite">Linha do tempo da proposta</h3>
        <ol className="space-y-3">
          {ETAPAS_PROPOSTA.map((et, i) => {
            const concluida = i < etapaIdx;
            const atual = i === etapaIdx;
            return (
              <li key={et} className="flex items-start gap-3">
                {concluida ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                ) : atual ? (
                  <Clock className="mt-0.5 h-5 w-5 text-amber-500" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${atual ? "text-graphite" : concluida ? "text-graphite" : "text-muted-foreground"}`}>
                    {et}
                  </p>
                  {atual && (
                    <p className="text-xs text-muted-foreground">Em andamento</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Documentos */}
        <section className="rounded-lg border border-border bg-card p-5">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-graphite">Documentos</h3>
            <Button size="sm" variant="outline" className="gap-1">
              <Upload className="h-3.5 w-3.5" /> Enviar
            </Button>
          </header>
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.nome} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {d.nome}
                </div>
                <Badge variant={d.enviado ? "secondary" : "outline"}>
                  {d.enviado ? "Enviado" : "Pendente"}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        {/* Próximos passos */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-graphite">Próximos passos</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Enviar documentos pendentes ({docs.filter((d) => !d.enviado).length})</li>
            <li>• Aguardar análise do banco {banco?.sigla}</li>
            <li>• Acompanhar mensagens do corretor</li>
            <li>• Próxima etapa prevista: <strong className="text-graphite">{proxima}</strong></li>
          </ul>
        </section>
      </div>

      {/* Chat com corretor */}
      <section className="rounded-lg border border-border bg-card p-5">
        <PopoutChat
          titulo={`Chat com ${corretor?.nome ?? "corretor"} — ${ativa.numero}`}
          storageKey={`cliente-${ativa.id}`}
          placeholder="Mensagem para o corretor…"
          mensagens={[
            { autor: corretor?.nome ?? "Corretor", texto: "Olá! Sua proposta está em andamento, qualquer dúvida estou à disposição.", quando: "ontem 18:00" },
            { autor: cli?.nome ?? "Cliente", texto: "Obrigado! Vou enviar os documentos pendentes ainda hoje.", quando: "ontem 19:20" },
            { autor: corretor?.nome ?? "Corretor", texto: "Perfeito! Avançaremos para a próxima etapa assim que o banco retornar.", quando: "hoje 09:30" },
          ]}
        />
      </section>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-graphite">{valor}</p>
    </div>
  );
}
