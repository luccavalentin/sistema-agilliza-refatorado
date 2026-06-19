// Simulação multicenário: wizard com modos rápida/vinculada,
// suporta Financiamento Imobiliário e Home Equity,
// gera cenários (banco × prazo × tabela), exibe resultados comparativos.

import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, Building2, Calculator,
  CheckCircle2, Copy, Download, Loader2, Send, Share2, Sparkles,
  Star, User, Users, X,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { bancos, clientes } from "@/lib/operacional/mock-data";
import type { Cenario, Produto, Tabela } from "@/lib/operacional/types";
import { gerarCenarios } from "@/lib/operacional/simulador";
import {
  formatBRL, formatPercent, formatPrazoMeses, formatCpf,
} from "@/lib/operacional/formatters";

type Modo = "rapida" | "vinculada";
type Step = "modo" | "dados" | "cenarios" | "resumo" | "processando" | "resultados";

// Taxas padrão estimadas por banco (mock — futura integração trará taxas reais)
const taxaPadraoPorBanco: Record<string, number> = {
  "b-itau": 10.5,
  "b-bb": 10.2,
  "b-cef": 9.8,
  "b-santander": 10.7,
  "b-bradesco": 10.6,
  "b-inter": 11.0,
};

const PRAZOS_SUGERIDOS = [120, 180, 240, 300, 360, 420];

export function SimulacaoWizard({ escopo: _escopo }: { escopo: "correspondente" | "corretor" }) {
  const [step, setStep] = useState<Step>("modo");
  const [modo, setModo] = useState<Modo>("rapida");
  const [produto, setProduto] = useState<Produto>("Financiamento Imobiliário");

  // dados financeiros
  const [clienteId, setClienteId] = useState<string>("");
  const [valorImovel, setValorImovel] = useState(500_000);
  const [valorEntrada, setValorEntrada] = useState(150_000);
  const [valorSolicitado, setValorSolicitado] = useState(250_000);
  const [rendaBruta, setRendaBruta] = useState(15_000);
  const [comprometimento, setComprometimento] = useState(30);

  // cenários
  const [bancosSelecionados, setBancosSelecionados] = useState<string[]>(["b-itau", "b-cef", "b-santander"]);
  const [prazosSelecionados, setPrazosSelecionados] = useState<number[]>([240, 360]);
  const [prazoCustom, setPrazoCustom] = useState("");
  const [tabelasSelecionadas, setTabelasSelecionadas] = useState<Tabela[]>(["SAC", "PRICE"]);

  // resultados
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [cenSelecionados, setCenSelecionados] = useState<Set<string>>(new Set());

  const principal = produto === "Financiamento Imobiliário"
    ? Math.max(0, valorImovel - valorEntrada)
    : valorSolicitado;

  const totalCenarios = bancosSelecionados.length * prazosSelecionados.length * tabelasSelecionadas.length;

  const podeAvancarDados = produto === "Financiamento Imobiliário"
    ? valorImovel > 0 && valorEntrada >= 0 && valorEntrada < valorImovel
    : valorSolicitado > 0;

  const podeProcessar = totalCenarios > 0;

  function processar() {
    setStep("processando");
    setTimeout(() => {
      const gerados = gerarCenarios({
        principal,
        bancos: bancosSelecionados.map((id) => ({
          id, taxaAaPercent: taxaPadraoPorBanco[id] ?? 10.5,
        })),
        prazos: prazosSelecionados,
        tabelas: tabelasSelecionadas,
        comprometimentoRendaMaxPercent: comprometimento,
      });
      setCenarios(gerados);
      setStep("resultados");
    }, 1800);
  }

  function reiniciar() {
    setStep("modo");
    setCenarios([]);
    setFavoritos(new Set());
    setCenSelecionados(new Set());
  }

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="OPERACIONAL"
        title="Nova Simulação"
        subtitle="Crie cenários multicenário combinando bancos, prazos e tabelas de amortização."
        right={
          step !== "modo" && step !== "processando" && (
            <button
              onClick={reiniciar}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand"
            >
              <X className="h-3.5 w-3.5" /> Reiniciar
            </button>
          )
        }
      />

      {/* Stepper */}
      <Stepper step={step} />

      {step === "modo" && (
        <ModoStep
          modo={modo} setModo={setModo}
          produto={produto} setProduto={setProduto}
          clienteId={clienteId} setClienteId={setClienteId}
          onNext={() => setStep("dados")}
        />
      )}

      {step === "dados" && (
        <DadosStep
          produto={produto}
          valorImovel={valorImovel} setValorImovel={setValorImovel}
          valorEntrada={valorEntrada} setValorEntrada={setValorEntrada}
          valorSolicitado={valorSolicitado} setValorSolicitado={setValorSolicitado}
          rendaBruta={rendaBruta} setRendaBruta={setRendaBruta}
          comprometimento={comprometimento} setComprometimento={setComprometimento}
          onBack={() => setStep("modo")}
          onNext={() => setStep("cenarios")}
          podeAvancar={podeAvancarDados}
        />
      )}

      {step === "cenarios" && (
        <CenariosStep
          bancosSel={bancosSelecionados} setBancosSel={setBancosSelecionados}
          prazosSel={prazosSelecionados} setPrazosSel={setPrazosSelecionados}
          prazoCustom={prazoCustom} setPrazoCustom={setPrazoCustom}
          tabelasSel={tabelasSelecionadas} setTabelasSel={setTabelasSelecionadas}
          onBack={() => setStep("dados")}
          onNext={() => setStep("resumo")}
        />
      )}

      {step === "resumo" && (
        <ResumoStep
          produto={produto}
          clienteId={clienteId}
          bancosSel={bancosSelecionados}
          prazosSel={prazosSelecionados}
          tabelasSel={tabelasSelecionadas}
          principal={principal}
          totalCenarios={totalCenarios}
          onBack={() => setStep("cenarios")}
          onProcessar={processar}
          podeProcessar={podeProcessar}
        />
      )}

      {step === "processando" && <ProcessandoStep />}

      {step === "resultados" && (
        <ResultadosStep
          cenarios={cenarios}
          favoritos={favoritos}
          setFavoritos={setFavoritos}
          selecionados={cenSelecionados}
          setSelecionados={setCenSelecionados}
        />
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "modo", label: "Modo" },
    { id: "dados", label: "Dados" },
    { id: "cenarios", label: "Cenários" },
    { id: "resumo", label: "Resumo" },
    { id: "resultados", label: "Resultados" },
  ];
  const idxAtual = step === "processando" ? 3 : steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs">
      {steps.map((s, i) => {
        const ativo = i === idxAtual;
        const feito = i < idxAtual;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
              feito ? "bg-success text-white" : ativo ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"
            }`}>{i + 1}</span>
            <span className={`font-semibold ${ativo ? "text-graphite" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <section className="rounded-lg border border-border bg-card p-5">{children}</section>;
}

function NavBtns({ onBack, onNext, podeAvancar = true, nextLabel = "Avançar" }: {
  onBack?: () => void; onNext?: () => void; podeAvancar?: boolean; nextLabel?: string;
}) {
  return (
    <div className="mt-5 flex justify-between gap-2">
      {onBack ? (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
      ) : <span />}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!podeAvancar}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-foreground shadow-sm hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {nextLabel} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ModoStep({
  modo, setModo, produto, setProduto, clienteId, setClienteId, onNext,
}: {
  modo: Modo; setModo: (m: Modo) => void;
  produto: Produto; setProduto: (p: Produto) => void;
  clienteId: string; setClienteId: (s: string) => void;
  onNext: () => void;
}) {
  return (
    <Box>
      <h2 className="mb-3 text-sm font-bold text-graphite">Modo de simulação</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <ModoCard
          ativo={modo === "rapida"}
          onClick={() => setModo("rapida")}
          icon={Sparkles}
          titulo="Simulação rápida (sem cliente)"
          desc="Simule cenários sem selecionar cliente. Pode converter em cadastro depois."
        />
        <ModoCard
          ativo={modo === "vinculada"}
          onClick={() => setModo("vinculada")}
          icon={Users}
          titulo="Simulação vinculada a cliente"
          desc="Selecione um cliente existente ou crie um básico para seguir até a proposta."
        />
      </div>

      <h2 className="mt-5 mb-3 text-sm font-bold text-graphite">Produto</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <ModoCard
          ativo={produto === "Financiamento Imobiliário"}
          onClick={() => setProduto("Financiamento Imobiliário")}
          icon={Building2}
          titulo="Financiamento Imobiliário"
          desc="Aquisição de imóvel, com valor de entrada e financiado."
        />
        <ModoCard
          ativo={produto === "Home Equity"}
          onClick={() => setProduto("Home Equity")}
          icon={Calculator}
          titulo="Home Equity"
          desc="Crédito com garantia de imóvel já existente."
        />
      </div>

      {modo === "vinculada" && (
        <div className="mt-5">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Cliente <span className="text-direction">*</span>
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.cpf ? `— ${formatCpf(c.cpf)}` : c.cnpj ? `— ${c.cnpj}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <NavBtns onNext={onNext} podeAvancar={modo === "rapida" || !!clienteId} />
    </Box>
  );
}

function ModoCard({
  ativo, onClick, icon: Icon, titulo, desc,
}: {
  ativo: boolean; onClick: () => void;
  icon: typeof Sparkles; titulo: string; desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
        ativo ? "border-brand bg-brand/5 shadow-sm" : "border-border bg-background hover:border-brand/40"
      }`}
    >
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${ativo ? "bg-brand text-brand-foreground" : "bg-secondary text-graphite"}`}>
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-graphite">{titulo}</p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
      {ativo && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-brand" />}
    </button>
  );
}

function CampoMoeda({
  label, value, onChange, required = false, hint,
}: {
  label: string; value: number; onChange: (n: number) => void;
  required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-direction">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">R$</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
      </div>
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CampoPercent({
  label, value, onChange, hint,
}: { label: string; value: number; onChange: (n: number) => void; hint?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type="number" min={0} max={100} step={0.5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-10 w-full rounded-md border border-input bg-background pr-9 pl-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
      </div>
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function DadosStep(p: {
  produto: Produto;
  valorImovel: number; setValorImovel: (n: number) => void;
  valorEntrada: number; setValorEntrada: (n: number) => void;
  valorSolicitado: number; setValorSolicitado: (n: number) => void;
  rendaBruta: number; setRendaBruta: (n: number) => void;
  comprometimento: number; setComprometimento: (n: number) => void;
  onBack: () => void; onNext: () => void; podeAvancar: boolean;
}) {
  const isFin = p.produto === "Financiamento Imobiliário";
  const ltv = isFin
    ? ((p.valorImovel - p.valorEntrada) / p.valorImovel) * 100
    : (p.valorSolicitado / Math.max(1, p.valorImovel)) * 100;
  return (
    <Box>
      <h2 className="mb-3 text-sm font-bold text-graphite">Dados financeiros — {p.produto}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isFin ? (
          <>
            <CampoMoeda label="Valor do imóvel" value={p.valorImovel} onChange={p.setValorImovel} required />
            <CampoMoeda label="Valor de entrada" value={p.valorEntrada} onChange={p.setValorEntrada} required />
            <CampoMoeda label="Valor financiado" value={p.valorImovel - p.valorEntrada} onChange={() => {}}
              hint="Calculado automaticamente" />
          </>
        ) : (
          <>
            <CampoMoeda label="Valor estimado do imóvel (garantia)" value={p.valorImovel} onChange={p.setValorImovel} required />
            <CampoMoeda label="Valor solicitado" value={p.valorSolicitado} onChange={p.setValorSolicitado} required />
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LTV</label>
              <div className="flex h-10 items-center rounded-md border border-input bg-secondary px-3 text-sm font-bold text-graphite">
                {formatPercent(ltv)}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Loan-to-Value calculado.</p>
            </div>
          </>
        )}
        <CampoMoeda label="Renda bruta mensal" value={p.rendaBruta} onChange={p.setRendaBruta}
          hint="Usada para sugerir renda mínima e comprometimento." />
        <CampoPercent label="Comprometimento de renda máx." value={p.comprometimento} onChange={p.setComprometimento}
          hint="Padrão: 30%." />
      </div>
      <NavBtns onBack={p.onBack} onNext={p.onNext} podeAvancar={p.podeAvancar} />
    </Box>
  );
}

function CenariosStep(p: {
  bancosSel: string[]; setBancosSel: (a: string[]) => void;
  prazosSel: number[]; setPrazosSel: (a: number[]) => void;
  prazoCustom: string; setPrazoCustom: (s: string) => void;
  tabelasSel: Tabela[]; setTabelasSel: (a: Tabela[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const toggleBanco = (id: string) => p.setBancosSel(
    p.bancosSel.includes(id) ? p.bancosSel.filter((x) => x !== id) : [...p.bancosSel, id],
  );
  const togglePrazo = (n: number) => p.setPrazosSel(
    p.prazosSel.includes(n) ? p.prazosSel.filter((x) => x !== n) : [...p.prazosSel, n].sort((a, b) => a - b),
  );
  const toggleTabela = (t: Tabela) => p.setTabelasSel(
    p.tabelasSel.includes(t) ? p.tabelasSel.filter((x) => x !== t) : [...p.tabelasSel, t],
  );
  const addPrazoCustom = () => {
    const n = Number(p.prazoCustom);
    if (n > 0 && !p.prazosSel.includes(n)) {
      p.setPrazosSel([...p.prazosSel, n].sort((a, b) => a - b));
      p.setPrazoCustom("");
    }
  };

  return (
    <Box>
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-bold text-graphite">Bancos</h3>
          <div className="mb-2 flex gap-2 text-[11px]">
            <button onClick={() => p.setBancosSel(bancos.map((b) => b.id))}
              className="rounded border border-border bg-background px-2 py-1 font-semibold text-graphite hover:border-brand/40">Todos os bancos</button>
            <button onClick={() => p.setBancosSel([])}
              className="rounded border border-border bg-background px-2 py-1 font-semibold text-muted-foreground hover:border-brand/40">Limpar</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bancos.map((b) => {
              const ativo = p.bancosSel.includes(b.id);
              return (
                <button key={b.id} onClick={() => toggleBanco(b.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    ativo ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background text-graphite hover:border-brand/40"
                  }`}>{b.sigla} — {b.nome}</button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-graphite">Prazos (meses)</h3>
          <div className="flex flex-wrap gap-2">
            {PRAZOS_SUGERIDOS.map((n) => {
              const ativo = p.prazosSel.includes(n);
              return (
                <button key={n} onClick={() => togglePrazo(n)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    ativo ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background text-graphite hover:border-brand/40"
                  }`}>{n}m</button>
              );
            })}
            {p.prazosSel.filter((n) => !PRAZOS_SUGERIDOS.includes(n)).map((n) => (
              <button key={n} onClick={() => togglePrazo(n)}
                className="rounded-full border border-brand bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground">{n}m ×</button>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={p.prazoCustom}
                onChange={(e) => p.setPrazoCustom(e.target.value)}
                placeholder="Prazo custom"
                type="number"
                className="h-8 w-28 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-brand"
              />
              <button onClick={addPrazoCustom}
                className="h-8 rounded-md bg-graphite px-3 text-xs font-semibold text-white hover:bg-graphite/90">+</button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-graphite">Sistemas de amortização</h3>
          <div className="flex gap-2">
            {(["SAC", "PRICE"] as Tabela[]).map((t) => {
              const ativo = p.tabelasSel.includes(t);
              return (
                <button key={t} onClick={() => toggleTabela(t)}
                  className={`rounded-md border px-4 py-2 text-xs font-bold ${
                    ativo ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background text-graphite hover:border-brand/40"
                  }`}>{t}</button>
              );
            })}
          </div>
        </div>
      </div>
      <NavBtns onBack={p.onBack} onNext={p.onNext}
        podeAvancar={p.bancosSel.length > 0 && p.prazosSel.length > 0 && p.tabelasSel.length > 0} />
    </Box>
  );
}

function ResumoStep(p: {
  produto: Produto; clienteId: string;
  bancosSel: string[]; prazosSel: number[]; tabelasSel: Tabela[];
  principal: number; totalCenarios: number;
  onBack: () => void; onProcessar: () => void; podeProcessar: boolean;
}) {
  const cliente = clientes.find((c) => c.id === p.clienteId);
  return (
    <Box>
      <h2 className="mb-3 text-sm font-bold text-graphite">Resumo antes de processar</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ResumoItem icon={Building2} k="Produto" v={p.produto} />
        <ResumoItem icon={User} k="Cliente" v={cliente?.nome ?? "Sem cliente (simulação rápida)"} />
        <ResumoItem icon={Calculator} k="Principal" v={formatBRL(p.principal)} />
        <ResumoItem icon={Building2} k="Bancos" v={`${p.bancosSel.length}`} sub={p.bancosSel.map((id) => bancos.find((b) => b.id === id)?.sigla).join(", ")} />
        <ResumoItem icon={Calculator} k="Prazos" v={`${p.prazosSel.length}`} sub={p.prazosSel.map((n) => `${n}m`).join(", ")} />
        <ResumoItem icon={Calculator} k="Tabelas" v={`${p.tabelasSel.length}`} sub={p.tabelasSel.join(", ")} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-md border border-brand/30 bg-brand/5 p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Total de cenários a gerar</p>
          <p className="mt-1 text-2xl font-bold text-graphite">{p.totalCenarios}</p>
        </div>
        <BarChart3 className="h-8 w-8 text-brand" />
      </div>
      <NavBtns onBack={p.onBack} onNext={p.onProcessar} podeAvancar={p.podeProcessar} nextLabel="Processar simulação" />
    </Box>
  );
}

function ResumoItem({ icon: Icon, k, v, sub }: { icon: typeof Sparkles; k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {k}
      </div>
      <p className="mt-1 text-sm font-bold text-graphite">{v}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ProcessandoStep() {
  return (
    <Box>
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="relative h-16 w-48 overflow-hidden rounded-md border border-border bg-secondary">
          <div className="absolute inset-y-0 left-0 animate-[loading_1.5s_ease-in-out_infinite] bg-gradient-to-r from-brand via-info to-brand" style={{ width: "60%" }} />
          <div className="absolute inset-0 grid place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        </div>
        <p className="text-sm font-semibold text-graphite">Aguarde enquanto processamos sua solicitação</p>
        <p className="text-xs text-muted-foreground">Calculando cenários nos bancos selecionados…</p>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(180%); } }`}</style>
    </Box>
  );
}

function ResultadosStep({
  cenarios, favoritos, setFavoritos, selecionados, setSelecionados,
}: {
  cenarios: Cenario[];
  favoritos: Set<string>; setFavoritos: (s: Set<string>) => void;
  selecionados: Set<string>; setSelecionados: (s: Set<string>) => void;
}) {
  const toggleFav = (id: string) => {
    const next = new Set(favoritos);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFavoritos(next);
  };
  const toggleSel = (id: string) => {
    const next = new Set(selecionados);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelecionados(next);
  };

  const melhorParcela = useMemo(
    () => cenarios.reduce((m, c) => (m === null || c.parcelaInicial < m ? c.parcelaInicial : m), null as number | null),
    [cenarios],
  );

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <h2 className="text-sm font-bold text-graphite">{cenarios.length} cenários gerados</h2>
        <div className="ml-auto flex flex-wrap gap-1.5 text-[11px]">
          {selecionados.size > 0 && (
            <span className="rounded bg-brand/10 px-2 py-1 font-bold text-brand">{selecionados.size} selecionado(s)</span>
          )}
          <Acao icon={Download}>Baixar</Acao>
          <Acao icon={Share2}>Compartilhar</Acao>
          <Acao icon={BarChart3}>Comparar</Acao>
          <Acao icon={Send}>Enviar para proposta</Acao>
          <Acao icon={Copy}>Duplicar</Acao>
          <button onClick={() => setSelecionados(new Set())}
            className="rounded border border-border bg-background px-2 py-1 font-semibold uppercase tracking-wider text-muted-foreground hover:text-graphite">Limpar</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-xs">
          <thead>
            <tr className="bg-secondary">
              <th className="px-2 py-2"></th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Banco</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prazo</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tabela</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Taxa a.a.</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Parcela inicial</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Parcela final</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total pago</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Juros</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CET est.</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Renda mín.</th>
              <th className="px-2 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {cenarios.map((c) => {
              const banco = bancos.find((b) => b.id === c.bancoId);
              const sel = selecionados.has(c.id);
              const fav = favoritos.has(c.id);
              const melhor = c.parcelaInicial === melhorParcela;
              return (
                <tr key={c.id} className={`border-b border-border ${sel ? "bg-brand/5" : ""}`}>
                  <td className="px-2 py-2"><input type="checkbox" checked={sel} onChange={() => toggleSel(c.id)} /></td>
                  <td className="px-3 py-2 font-bold text-graphite">
                    {banco?.sigla}
                    {melhor && <span className="ml-2 rounded bg-success/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-success">Melhor parcela</span>}
                  </td>
                  <td className="px-3 py-2">{formatPrazoMeses(c.prazoMeses)}</td>
                  <td className="px-3 py-2">{c.tabela}</td>
                  <td className="px-3 py-2">{formatPercent(c.taxaAaPercent)}</td>
                  <td className="px-3 py-2 text-right font-bold text-graphite">{formatBRL(c.parcelaInicial)}</td>
                  <td className="px-3 py-2 text-right">{formatBRL(c.parcelaFinal)}</td>
                  <td className="px-3 py-2 text-right">{formatBRL(c.totalPago)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{formatBRL(c.totalJuros)}</td>
                  <td className="px-3 py-2 text-right">{formatPercent(c.cetPercent)}</td>
                  <td className="px-3 py-2 text-right">{formatBRL(c.rendaMinima)}</td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => toggleFav(c.id)} title="Favoritar"
                      className={`grid h-7 w-7 place-items-center rounded ${fav ? "bg-warning/15 text-warning" : "border border-border bg-background text-muted-foreground hover:text-warning"}`}>
                      <Star className={`h-3.5 w-3.5 ${fav ? "fill-warning" : ""}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Acao({ icon: Icon, children }: { icon: typeof Send; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 font-semibold uppercase tracking-wider text-graphite hover:border-brand/40 hover:text-brand">
      <Icon className="h-3 w-3" /> {children}
    </button>
  );
}
