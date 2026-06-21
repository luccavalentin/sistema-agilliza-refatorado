// Consultas Operacionais — busca unificada de propostas, simulações,
// demandas, com filtros e ações por linha + ações em lote.

import { useMemo, useState } from "react";
import {
  ArrowRightLeft, Copy, Download, Eye, FileText, History,
  Pencil, Search, Send, Share2,
} from "lucide-react";
import { PanelHeader, FilterBar } from "@/components/dashboards/primitives";
import {
  bancoById, bancos, clienteById, clientes, demandas,
  propostas, simulacoes, usuarioById, usuarios,
} from "@/lib/operacional/mock-data";
import { ETAPAS_PROPOSTA } from "@/lib/operacional/types";
import { formatBRL, formatDataHora } from "@/lib/operacional/formatters";
import { useGlobalSearch } from "@/components/portal/global-search";
import { useDashboardFilters, PERIODOS } from "@/hooks/use-dashboard-filters";

type Aba = "propostas" | "simulacoes" | "demandas";

export function ConsultasOperacionais({
  escopo,
  usuarioAtualId = "u-cor-1",
}: {
  escopo: "correspondente" | "corretor";
  usuarioAtualId?: string;
}) {
  const [aba, setAba] = useState<Aba>("propostas");
  const [busca, setBusca] = useState("");
  const globalQ = useGlobalSearch();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const { filters, set, reset, apply } = useDashboardFilters();

  const restritoCorretor = escopo === "corretor";
  const term = (busca || globalQ).toLowerCase();

  const linhasProp = useMemo(() => {
    const base = restritoCorretor
      ? propostas.filter((p) => p.corretorId === usuarioAtualId || p.responsavelId === usuarioAtualId)
      : propostas;
    const src = apply(base, {
      data: (p) => p.atualizadaEm,
      produto: (p) => p.produto,
      bancoSigla: (p) => bancoById(p.bancoId)?.sigla,
      status: (p) => p.status,
      cliente: (p) => clienteById(p.clienteId)?.nome,
      fase: (p) => p.etapa,
      corretor: (p) => usuarioById(p.responsavelId)?.nome,
    });
    return src.filter((p) => {
      if (!term) return true;
      const cli = clienteById(p.clienteId);
      return (
        p.numero.toLowerCase().includes(term) ||
        cli?.nome.toLowerCase().includes(term) ||
        cli?.cpf?.includes(term) ||
        cli?.cnpj?.includes(term) ||
        p.etapa.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
      );
    });
  }, [term, restritoCorretor, usuarioAtualId, apply]);

  const linhasSim = useMemo(() => {
    const base = restritoCorretor
      ? simulacoes.filter((s) => s.corretorId === usuarioAtualId || s.usuarioId === usuarioAtualId)
      : simulacoes;
    const src = apply(base, {
      data: (s) => s.criadaEm,
      produto: (s) => s.produto,
      status: (s) => s.status,
      cliente: (s) => clienteById(s.clienteId)?.nome,
    });
    return src.filter((s) => {
      if (!term) return true;
      const cli = clienteById(s.clienteId);
      return (
        s.id.toLowerCase().includes(term) ||
        cli?.nome.toLowerCase().includes(term) ||
        s.produto.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term)
      );
    });
  }, [term, restritoCorretor, usuarioAtualId, apply]);

  const linhasDem = useMemo(() => {
    const base = restritoCorretor
      ? demandas.filter((d) =>
          d.responsavelId === usuarioAtualId ||
          d.criadoPorId === usuarioAtualId ||
          d.participantesIds.includes(usuarioAtualId),
        )
      : demandas;
    const src = apply(base, {
      data: (d) => d.criadaEm,
      status: (d) => d.status,
      cliente: (d) => clienteById(d.clienteId)?.nome,
      corretor: (d) => usuarioById(d.responsavelId)?.nome,
    });
    return src.filter((d) => {
      if (!term) return true;
      return (
        d.titulo.toLowerCase().includes(term) ||
        d.tipo.toLowerCase().includes(term) ||
        d.status.toLowerCase().includes(term)
      );
    });
  }, [term, restritoCorretor, usuarioAtualId, apply]);

  const total =
    aba === "propostas" ? linhasProp.length :
    aba === "simulacoes" ? linhasSim.length : linhasDem.length;

  const toggle = (id: string) => {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const statusOpts = aba === "propostas"
    ? ["Todos", "Em aprovação", "Sequenciada", "Não sequenciada", "Aprovada", "Reprovada", "Em tratativa", "Documentação pendente", "Aguardando banco", "Análise jurídica", "Contrato emitido", "Finalizada"]
    : aba === "simulacoes"
    ? ["Todos", "Rascunho", "Em andamento", "Concluída", "Enviada para proposta", "Arquivada"]
    : ["Todos", "Nova", "Aguardando aceite", "Em andamento", "Aguardando retorno", "Em revisão", "Concluída", "Reaberta", "Cancelada"];

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="OPERACIONAL"
        title="Consultas Operacionais"
        subtitle="Pesquise propostas, simulações e demandas em todo o ecossistema, com filtros e ações."
      />

      <FilterBar
        onReset={reset}
        filters={[
          { label: "Cliente", value: filters.cliente, options: ["Todos", ...clientes.map(c => c.nome)], onChange: set("cliente") },
          { label: "Banco", value: filters.banco, options: ["Todos", ...bancos.map(b => b.sigla)], onChange: set("banco") },
          { label: "Produto", value: filters.produto, options: ["Todos", "Financiamento Imobiliário", "Home Equity"], onChange: set("produto") },
          { label: "Status", value: filters.status, options: statusOpts, onChange: set("status") },
          { label: "Etapa", value: filters.fase, options: ["Todas", ...ETAPAS_PROPOSTA], onChange: set("fase") },
          { label: "Responsável", value: filters.corretor, options: ["Todos", ...usuarios.map(u => u.nome)], onChange: set("corretor") },
          { label: "Analista", value: filters.analista, options: ["Todos", ...usuarios.filter(u => u.papel === "analista").map(u => u.nome)], onChange: set("analista") },
          { label: "Período", value: filters.periodo, options: PERIODOS, onChange: set("periodo") },
        ]}
        dateRange={{
          from: filters.customFrom,
          to: filters.customTo,
          onFrom: set("customFrom"),
          onTo: set("customTo"),
          show: filters.periodo === "Personalizado",
        }}
      />


      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="inline-flex rounded-md border border-border bg-secondary p-0.5 text-xs">
            {(["propostas", "simulacoes", "demandas"] as Aba[]).map((a) => (
              <button
                key={a}
                onClick={() => { setAba(a); setSel(new Set()); }}
                className={`px-3 py-1.5 rounded font-medium capitalize ${
                  aba === a ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="relative ml-auto w-full sm:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Cliente, CPF/CNPJ, nº proposta…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </div>
        </div>

        {/* Ações em lote */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-[11px]">
          <span className="text-muted-foreground">
            {sel.size > 0 ? `${sel.size} selecionado(s)` : `${total} resultado(s)`}
          </span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <LoteBtn icon={Download}>Baixar</LoteBtn>
            <LoteBtn icon={Share2}>Compartilhar</LoteBtn>
            <LoteBtn icon={ArrowRightLeft}>Transferir</LoteBtn>
            <LoteBtn icon={Send}>Enviar para proposta</LoteBtn>
            <button
              onClick={() => setSel(new Set())}
              className="rounded border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-graphite"
            >Limpar</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {aba === "propostas" && (
            <TabelaPropostas linhas={linhasProp} sel={sel} toggle={toggle} />
          )}
          {aba === "simulacoes" && (
            <TabelaSimulacoes linhas={linhasSim} sel={sel} toggle={toggle} />
          )}
          {aba === "demandas" && (
            <TabelaDemandas linhas={linhasDem} sel={sel} toggle={toggle} />
          )}
        </div>
      </section>

      {/* uso de imports para evitar lint warning */}
      <span className="hidden">{bancos.length}{usuarios.length}{clientes.length}</span>
    </div>
  );
}

function LoteBtn({
  icon: Icon, children,
}: { icon: typeof Eye; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40 hover:text-brand">
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}

function RowActions() {
  const Btn = ({ icon: Icon, label }: { icon: typeof Eye; label: string }) => (
    <button title={label} className="grid h-7 w-7 place-items-center rounded border border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-brand">
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
  return (
    <div className="flex justify-end gap-1">
      <Btn icon={Eye} label="Visualizar" />
      <Btn icon={Pencil} label="Editar" />
      <Btn icon={Copy} label="Duplicar" />
      <Btn icon={ArrowRightLeft} label="Transferir" />
      <Btn icon={History} label="Histórico" />
      <Btn icon={FileText} label="Documentos" />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap border-b border-border bg-secondary px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`border-b border-border px-3 py-2 text-xs text-graphite ${className}`}>
      {children}
    </td>
  );
}

function TabelaPropostas({
  linhas, sel, toggle,
}: { linhas: typeof propostas; sel: Set<string>; toggle: (id: string) => void }) {
  return (
    <table className="w-full min-w-[1000px] text-xs">
      <thead>
        <tr>
          <Th><input type="checkbox" /></Th>
          <Th>Proposta</Th>
          <Th>Cliente</Th>
          <Th>Banco</Th>
          <Th>Produto</Th>
          <Th>Valor</Th>
          <Th>Etapa</Th>
          <Th>Status</Th>
          <Th>SLA</Th>
          <Th>Resp.</Th>
          <Th>Atualizada</Th>
          <Th>Ações</Th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((p) => {
          const sla = (new Date(p.slaPrazo).getTime() - Date.now()) / 86400000;
          const slaTone = sla < 0 ? "bg-direction/10 text-direction" : sla <= 2 ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground";
          return (
            <tr key={p.id} className={sel.has(p.id) ? "bg-brand/5" : ""}>
              <Td><input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} /></Td>
              <Td className="font-bold">
                {p.numero}
                {p.transferida && <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-info/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-info"><ArrowRightLeft className="h-2.5 w-2.5" />Transf.</span>}
              </Td>
              <Td>{clienteById(p.clienteId)?.nome}</Td>
              <Td>{bancoById(p.bancoId)?.sigla}</Td>
              <Td>{p.produto}</Td>
              <Td>{formatBRL(p.valor)}</Td>
              <Td>{p.etapa}</Td>
              <Td><span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-graphite">{p.status}</span></Td>
              <Td><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${slaTone}`}>
                {sla < 0 ? `${Math.round(-sla)}d atrasada` : `em ${Math.round(sla)}d`}
              </span></Td>
              <Td>{usuarioById(p.responsavelId)?.nome.split(" ")[0]}</Td>
              <Td className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDataHora(p.atualizadaEm)}</Td>
              <Td><RowActions /></Td>
            </tr>
          );
        })}
        {linhas.length === 0 && (
          <tr><td colSpan={12} className="p-6 text-center text-xs text-muted-foreground">Nenhum resultado.</td></tr>
        )}
      </tbody>
    </table>
  );
}

function TabelaSimulacoes({
  linhas, sel, toggle,
}: { linhas: typeof simulacoes; sel: Set<string>; toggle: (id: string) => void }) {
  return (
    <table className="w-full min-w-[900px] text-xs">
      <thead>
        <tr>
          <Th><input type="checkbox" /></Th>
          <Th>ID</Th>
          <Th>Cliente</Th>
          <Th>Produto</Th>
          <Th>Valor</Th>
          <Th>Prazo</Th>
          <Th>Status</Th>
          <Th>Criada por</Th>
          <Th>Criada em</Th>
          <Th>Ações</Th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((s) => (
          <tr key={s.id} className={sel.has(s.id) ? "bg-brand/5" : ""}>
            <Td><input type="checkbox" checked={sel.has(s.id)} onChange={() => toggle(s.id)} /></Td>
            <Td className="font-bold">{s.id}</Td>
            <Td>{clienteById(s.clienteId)?.nome ?? <span className="italic text-muted-foreground">Sem cliente</span>}</Td>
            <Td>{s.produto}</Td>
            <Td>{formatBRL(s.valorImovel ?? s.valorSolicitado ?? 0)}</Td>
            <Td>{s.prazoMesesBase}m</Td>
            <Td><span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-graphite">{s.status}</span></Td>
            <Td>{usuarioById(s.usuarioId)?.nome.split(" ")[0]}</Td>
            <Td className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDataHora(s.criadaEm)}</Td>
            <Td><RowActions /></Td>
          </tr>
        ))}
        {linhas.length === 0 && (
          <tr><td colSpan={10} className="p-6 text-center text-xs text-muted-foreground">Nenhum resultado.</td></tr>
        )}
      </tbody>
    </table>
  );
}

function TabelaDemandas({
  linhas, sel, toggle,
}: { linhas: typeof demandas; sel: Set<string>; toggle: (id: string) => void }) {
  return (
    <table className="w-full min-w-[900px] text-xs">
      <thead>
        <tr>
          <Th><input type="checkbox" /></Th>
          <Th>Título</Th>
          <Th>Tipo</Th>
          <Th>Prioridade</Th>
          <Th>Status</Th>
          <Th>Responsável</Th>
          <Th>SLA</Th>
          <Th>Criada</Th>
          <Th>Ações</Th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((d) => {
          const sla = (new Date(d.slaPrazo).getTime() - Date.now()) / 86400000;
          const slaTone = sla < 0 ? "bg-direction/10 text-direction" : sla <= 1 ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground";
          const prioTone = d.prioridade === "Crítica" ? "bg-direction/10 text-direction"
            : d.prioridade === "Urgente" ? "bg-warning/10 text-warning"
            : d.prioridade === "Alta" ? "bg-info/10 text-info"
            : "bg-secondary text-muted-foreground";
          return (
            <tr key={d.id} className={sel.has(d.id) ? "bg-brand/5" : ""}>
              <Td><input type="checkbox" checked={sel.has(d.id)} onChange={() => toggle(d.id)} /></Td>
              <Td className="font-semibold">{d.titulo}</Td>
              <Td>{d.tipo}</Td>
              <Td><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${prioTone}`}>{d.prioridade}</span></Td>
              <Td><span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-graphite">{d.status}</span></Td>
              <Td>{usuarioById(d.responsavelId)?.nome.split(" ")[0]}</Td>
              <Td><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${slaTone}`}>
                {sla < 0 ? `${Math.round(-sla)}d atrasada` : `em ${Math.round(sla)}d`}
              </span></Td>
              <Td className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDataHora(d.criadaEm)}</Td>
              <Td><RowActions /></Td>
            </tr>
          );
        })}
        {linhas.length === 0 && (
          <tr><td colSpan={9} className="p-6 text-center text-xs text-muted-foreground">Nenhum resultado.</td></tr>
        )}
      </tbody>
    </table>
  );
}
