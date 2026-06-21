/**
 * Flash IA — Consulta CPF + Data de Nascimento (simulação Receita Federal).
 * Após encontrar dados: opção de cadastrar cliente (pré-preenche o formulário)
 * ou iniciar simulação. Inclui o chat AgillizaIA embutido.
 *
 * TODO: integrar `consultarReceitaFederal` com Edge Function real quando
 *       contratar bureau (Serpro DataValid, Serasa Experian, BoaVista, etc.)
 */
import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit, CheckCircle2, ChevronRight, Loader2,
  User2, Building2, AlertTriangle, Plus, LinkIcon, Zap,
  CalendarDays, ShieldCheck, X, Send, MessageSquare,
  Sparkles, ArrowRight, RotateCcw, BadgeInfo, Copy, Check,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { clientes } from "@/lib/operacional/mock-data";
import { useNavigate } from "@tanstack/react-router";
import { useAgillizaIA } from "@/hooks/use-agilliza-ia";
import type { CrmScope } from "@/components/crm/crm-dashboard";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface DadosBureau {
  tipo: "PF" | "PJ";
  documento: string;
  nomeCompleto: string;
  nomeMae?: string;
  dataNascimento?: string;
  situacaoCadastral: "regular" | "pendente" | "suspensa" | "cancelada";
  restricoes: string[];
  enderecoUF?: string;
  enderecoMunicipio?: string;
  email?: string;
  telefone?: string;
  // PJ
  razaoSocial?: string;
  nomeFantasia?: string;
  situacaoEmpresa?: string;
  atividadePrincipal?: string;
}

// ---------------------------------------------------------------------------
// Simulação de consulta — substitua por Edge Function real
// ---------------------------------------------------------------------------
function consultarReceitaFederal(
  cpf: string,
  _dataNasc: string,
): Promise<DadosBureau> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const limpo = cpf.replace(/\D/g, "");
      if (limpo === "00000000000") {
        reject(new Error("CPF inválido na Receita Federal."));
        return;
      }
      if (limpo === "11111111111") {
        resolve({
          tipo: "PF",
          documento: limpo,
          nomeCompleto: "Carlos Alberto Mendes",
          nomeMae: "Maria José Mendes",
          dataNascimento: _dataNasc || "1978-03-22",
          situacaoCadastral: "suspensa",
          restricoes: ["Pendência cadastral junto à RF"],
          enderecoUF: "MG",
          enderecoMunicipio: "Belo Horizonte",
        });
        return;
      }
      resolve({
        tipo: "PF",
        documento: limpo,
        nomeCompleto: "Eduardo Fernandes Santos",
        nomeMae: "Ana Lúcia Fernandes",
        dataNascimento: _dataNasc || "1985-08-15",
        situacaoCadastral: "regular",
        restricoes: [],
        enderecoUF: "SP",
        enderecoMunicipio: "São Paulo",
        email: "eduardo@email.com",
        telefone: "(11) 98765-4321",
      });
    }, 1200 + Math.random() * 800);
  });
}

function consultarCnpj(cnpj: string): Promise<DadosBureau> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const limpo = cnpj.replace(/\D/g, "");
      if (limpo === "00000000000000") {
        reject(new Error("CNPJ inválido."));
        return;
      }
      resolve({
        tipo: "PJ",
        documento: limpo,
        nomeCompleto: "Fernandes Santos Ltda.",
        razaoSocial: "Fernandes Santos Comércio e Serviços Ltda.",
        nomeFantasia: "FS Soluções",
        situacaoCadastral: "regular",
        situacaoEmpresa: "Ativa",
        atividadePrincipal: "Construção civil e incorporação",
        restricoes: [],
        enderecoUF: "SP",
        enderecoMunicipio: "Campinas",
      });
    }, 1400 + Math.random() * 600);
  });
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
function formatDoc(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const situacaoCor = {
  regular: {
    badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
    label: "Regular",
    icon: CheckCircle2,
  },
  pendente: {
    badge: "text-amber-700 bg-amber-50 border-amber-200",
    label: "Pendente",
    icon: AlertTriangle,
  },
  suspensa: {
    badge: "text-orange-700 bg-orange-50 border-orange-200",
    label: "Suspensa",
    icon: AlertTriangle,
  },
  cancelada: {
    badge: "text-red-700 bg-red-50 border-red-200",
    label: "Cancelada",
    icon: AlertTriangle,
  },
};

// ---------------------------------------------------------------------------
// Componente de chat AgillizaIA
// ---------------------------------------------------------------------------
function AgillizaIAChat({ onClose }: { onClose: () => void }) {
  const { messages, isLoading, send, clear } = useAgillizaIA();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSend() {
    if (!input.trim() || isLoading) return;
    send(input.trim());
    setInput("");
    inputRef.current?.focus();
  }

  const quickQuestions = [
    "Qual a taxa de juros atual?",
    "Como usar o FGTS?",
    "Quais documentos são necessários?",
    "O que é LTV?",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/10">
            <Sparkles className="h-4 w-4 text-brand" />
          </div>
          <div>
            <p className="text-sm font-bold text-graphite">AgillizaIA</p>
            <p className="text-[10px] text-muted-foreground">Especialista em financiamento habitacional</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clear}
            title="Limpar conversa"
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-graphite"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-graphite"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" && (
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand text-brand-foreground rounded-tr-sm"
                  : "bg-secondary text-graphite rounded-tl-sm"
              }`}
            >
              {/* Renderiza markdown simples: **negrito**, listas, quebras */}
              <MiniMarkdown text={msg.content} />
              <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-brand-foreground/60 text-right" : "text-muted-foreground"}`}>
                {msg.ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="border-t border-border px-4 py-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Perguntas frequentes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-graphite hover:border-brand/40 hover:bg-brand/5 hover:text-brand transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pergunte sobre taxas, FGTS, documentos, MCMV..."
            className="flex-1 resize-none rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
          Respostas baseadas em regulamentação vigente · Sempre confirme com um especialista
        </p>
      </div>
    </div>
  );
}

// Mini-renderer de markdown básico (**bold**, listas, quebras)
function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("• ") || line.startsWith("- ")) {
          const content = line.slice(2);
          return (
            <p key={i} className="flex gap-1.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              <span dangerouslySetInnerHTML={{ __html: bold(content) }} />
            </p>
          );
        }
        if (/^\d+\./.test(line)) {
          return (
            <p key={i} dangerouslySetInnerHTML={{ __html: bold(line) }} />
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: bold(line) }} />
        );
      })}
    </div>
  );
}
function bold(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function FlashIaView({ scope }: { scope: CrmScope }) {
  const navigate = useNavigate();

  // --- Estado de consulta CPF/CNPJ ---
  const [doc, setDoc] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [isPF, setIsPF] = useState(true);
  const [status, setStatus] = useState<"idle" | "buscando" | "encontrado" | "erro">("idle");
  const [dados, setDados] = useState<DadosBureau | null>(null);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [historico, setHistorico] = useState<{ doc: string; nome: string; tipo: string }[]>([
    { doc: "123.456.789-00", nome: "João da Silva", tipo: "PF" },
    { doc: "987.654.321-00", nome: "Maria Oliveira", tipo: "PF" },
  ]);

  // --- Estado do chat ---
  const [chatAberto, setChatAberto] = useState(false);

  const docLimpo = doc.replace(/\D/g, "");
  const isCpf = docLimpo.length <= 11;
  const podeConsultar =
    status !== "buscando" &&
    (isCpf ? docLimpo.length === 11 && dataNasc !== "" : docLimpo.length === 14);

  // Verifica se cliente já existe nos mocks
  const clienteExistente = dados
    ? clientes.find(
        (c) =>
          c.cpf?.replace(/\D/g, "") === dados.documento ||
          c.cnpj?.replace(/\D/g, "") === dados.documento,
      )
    : null;

  // Atualiza tipo PF/PJ dinamicamente
  useEffect(() => {
    setIsPF(docLimpo.length <= 11);
  }, [docLimpo.length]);

  async function consultar() {
    if (!podeConsultar) return;
    setStatus("buscando");
    setDados(null);
    setErro("");
    try {
      const res = isCpf
        ? await consultarReceitaFederal(docLimpo, dataNasc)
        : await consultarCnpj(docLimpo);
      setDados(res);
      setStatus("encontrado");
      setHistorico((p) =>
        [{ doc: formatDoc(docLimpo), nome: res.nomeCompleto, tipo: res.tipo }, ...p].slice(0, 10),
      );
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido.");
      setStatus("erro");
    }
  }

  function irParaCadastro() {
    if (!dados) return;
    // Salva dados no sessionStorage para o formulário de cadastro recuperar
    const lead = {
      nomeCompleto: dados.nomeCompleto,
      cpf: dados.tipo === "PF" ? formatDoc(dados.documento) : "",
      cnpj: dados.tipo === "PJ" ? formatDoc(dados.documento) : "",
      dataNascimento: dados.dataNascimento ?? "",
      email: dados.email ?? "",
      telefone: dados.telefone ?? "",
      uf: dados.enderecoUF ?? "",
      municipio: dados.enderecoMunicipio ?? "",
      origem: "flash-ia",
      tipo: dados.tipo,
    };
    sessionStorage.setItem("agilliza:flash-ia-lead", JSON.stringify(lead));
    const base = scope === "correspondente" ? "/correspondente" : "/corretor";
    navigate({ to: `${base}/crm/cadastro` as never });
  }

  function copiarDados() {
    if (!dados) return;
    const text = [
      `Nome: ${dados.nomeCompleto}`,
      dados.nomeMae ? `Nome da mãe: ${dados.nomeMae}` : "",
      `CPF: ${formatDoc(dados.documento)}`,
      dados.dataNascimento ? `Nascimento: ${formatDateBR(dados.dataNascimento)}` : "",
      dados.email ? `E-mail: ${dados.email}` : "",
      dados.telefone ? `Telefone: ${dados.telefone}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const situacaoInfo = dados ? situacaoCor[dados.situacaoCadastral] : null;
  const SituacaoIcon = situacaoInfo?.icon ?? BadgeInfo;

  return (
    <div className="relative space-y-5">
      <PanelHeader
        eyebrow={`CRM · ${scope === "correspondente" ? "Correspondente" : "Corretor"}`}
        title="Flash IA"
        subtitle="Consulte dados da Receita Federal por CPF e data de nascimento — crie o lead em segundos."
        right={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-[11px] font-semibold text-brand">
              <Zap className="h-3.5 w-3.5" />
              Consulta instantânea
            </span>
            <button
              onClick={() => setChatAberto((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                chatAberto
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card text-graphite hover:border-brand/40 hover:text-brand"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AgillizaIA
            </button>
          </div>
        }
      />

      <div className={`grid gap-5 ${chatAberto ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-[1fr_300px]"}`}>
        {/* ── Coluna principal ── */}
        <div className="space-y-4">

          {/* Formulário de consulta */}
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <p className="text-sm font-bold text-graphite">Consulta Receita Federal</p>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Simulado · Integração pendente
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* CPF / CNPJ */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  CPF ou CNPJ *
                </label>
                <div className="relative">
                  <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={doc}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 14);
                      setDoc(formatDoc(raw));
                      if (status !== "idle") { setStatus("idle"); setDados(null); }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && consultar()}
                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>
                {docLimpo.length > 0 && docLimpo.length < 11 && (
                  <p className="text-[11px] text-muted-foreground">{11 - docLimpo.length} dígitos restantes</p>
                )}
              </div>

              {/* Data de nascimento — só para PF */}
              {isPF && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Data de nascimento *
                    <span className="ml-1 normal-case font-normal">(obrigatória p/ CPF)</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={dataNasc}
                      onChange={(e) => setDataNasc(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && consultar()}
                      className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={consultar}
                disabled={!podeConsultar}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground transition-colors"
              >
                {status === "buscando" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="h-4 w-4" />
                )}
                {status === "buscando" ? "Consultando Receita Federal..." : "Consultar Receita Federal"}
              </button>
              {status === "buscando" && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Aguarde...
                </p>
              )}
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              🔒 Dados consultados com segurança · A data de nascimento é usada como chave de validação junto à RF
            </p>
          </section>

          {/* Estado idle */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 py-14 text-center">
              <BrainCircuit className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-semibold text-graphite">Pronto para consultar</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Informe o CPF e a data de nascimento para buscar os dados da Receita Federal
                </p>
              </div>
            </div>
          )}

          {/* Erro */}
          {status === "erro" && (
            <section className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Erro na consulta</p>
                <p className="mt-0.5 text-xs text-red-700">{erro}</p>
              </div>
            </section>
          )}

          {/* Resultado */}
          {status === "encontrado" && dados && situacaoInfo && (
            <section className="overflow-hidden rounded-lg border border-border bg-card">
              {/* Header do resultado */}
              <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-3">
                <div className="flex items-center gap-2">
                  {dados.tipo === "PF" ? (
                    <User2 className="h-4 w-4 text-brand" />
                  ) : (
                    <Building2 className="h-4 w-4 text-brand" />
                  )}
                  <p className="text-sm font-bold text-graphite">
                    {dados.tipo === "PF" ? "Pessoa Física — Receita Federal" : "Pessoa Jurídica — CNPJ"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${situacaoInfo.badge}`}
                  >
                    <SituacaoIcon className="h-3 w-3" />
                    {situacaoInfo.label}
                  </span>
                  <button
                    onClick={copiarDados}
                    title="Copiar dados"
                    className="rounded p-1.5 text-muted-foreground hover:bg-secondary"
                  >
                    {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-5">
                {/* Campos retornados */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { l: "Nome completo", v: dados.nomeCompleto },
                    { l: dados.tipo === "PF" ? "CPF" : "CNPJ", v: formatDoc(dados.documento) },
                    ...(dados.nomeMae ? [{ l: "Nome da mãe", v: dados.nomeMae }] : []),
                    ...(dados.dataNascimento
                      ? [{ l: "Data de nascimento", v: formatDateBR(dados.dataNascimento) }]
                      : []),
                    ...(dados.razaoSocial ? [{ l: "Razão social", v: dados.razaoSocial }] : []),
                    ...(dados.atividadePrincipal
                      ? [{ l: "Atividade principal", v: dados.atividadePrincipal }]
                      : []),
                    ...(dados.enderecoMunicipio
                      ? [{ l: "Município / UF", v: `${dados.enderecoMunicipio} / ${dados.enderecoUF}` }]
                      : []),
                    ...(dados.email ? [{ l: "E-mail", v: dados.email }] : []),
                    ...(dados.telefone ? [{ l: "Telefone", v: dados.telefone }] : []),
                  ].map((r) => (
                    <div key={r.l} className="rounded-md border border-border bg-background px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {r.l}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-graphite">{r.v}</p>
                    </div>
                  ))}
                </div>

                {/* Restrições */}
                {dados.restricoes.length > 0 && (
                  <div className="mt-4 flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-orange-800">Restrições encontradas:</p>
                      <p className="text-xs text-orange-700">{dados.restricoes.join(", ")}</p>
                    </div>
                  </div>
                )}

                {/* Cliente já existe */}
                {clienteExistente && (
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-brand/20 bg-brand/5 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <p className="text-xs font-semibold text-brand">
                      Já cadastrado como:{" "}
                      <strong>{clienteExistente.nome}</strong>
                    </p>
                    <button className="ml-auto text-xs font-bold text-brand underline hover:no-underline whitespace-nowrap">
                      Ver cadastro
                    </button>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {!clienteExistente ? (
                    <button
                      onClick={irParaCadastro}
                      className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground hover:bg-brand/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar Cliente
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-graphite hover:border-brand/40 hover:text-brand transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Abrir cadastro existente
                    </button>
                  )}
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-graphite hover:border-brand/40 hover:text-brand transition-colors"
                  >
                    Nova simulação rápida
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── Coluna lateral ── */}
        {chatAberto ? (
          // Chat AgillizaIA aberto
          <aside className="flex h-[600px] flex-col overflow-hidden rounded-lg border border-brand/20 bg-card shadow-lg">
            <AgillizaIAChat onClose={() => setChatAberto(false)} />
          </aside>
        ) : (
          // Histórico de consultas
          <aside className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Consultas recentes
            </p>
            {historico.length === 0 && (
              <p className="text-xs text-muted-foreground">Sem consultas recentes.</p>
            )}
            {historico.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setDoc(h.doc);
                  setStatus("idle");
                  setDados(null);
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-brand/40 transition-colors"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                  {h.tipo === "PF" ? <User2 className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-graphite">{h.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{h.doc}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}

            {/* AgillizaIA CTA */}
            <div className="mt-4 overflow-hidden rounded-lg border border-brand/20 bg-gradient-to-br from-brand/5 to-brand/10">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-brand" />
                  <p className="text-sm font-bold text-graphite">AgillizaIA</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Tire dúvidas sobre taxas, FGTS, documentação e financiamento habitacional em segundos.
                </p>
                <button
                  onClick={() => setChatAberto(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-bold text-brand-foreground hover:bg-brand/90 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Perguntar ao AgillizaIA
                </button>
              </div>
            </div>

            {/* Info de integração */}
            <div className="rounded-lg border border-border bg-card p-4 text-xs">
              <p className="font-semibold text-graphite">Fontes de dados</p>
              <ul className="mt-2 space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  Receita Federal (simulado)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                  Bureau de crédito (pendente)
                </li>
              </ul>
              <p className="mt-2 text-[11px] font-semibold text-brand">
                Hook pronto para integração real
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
