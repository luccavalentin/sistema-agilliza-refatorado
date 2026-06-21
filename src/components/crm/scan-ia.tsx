/**
 * Scan IA — Extração real de dados de documentos via Google Gemini Vision.
 *
 * Fluxo:
 * 1. Usuário seleciona o tipo e faz upload do documento
 * 2. Frontend converte para Base64 e chama a Edge Function `scan-documento`
 * 3. Gemini Vision lê o documento e retorna JSON estruturado
 * 4. Dados são exibidos e podem ser enviados ao CRM via sessionStorage
 *
 * Configuração necessária (Supabase Dashboard → Edge Functions → Secrets):
 *   GEMINI_API_KEY = sua chave em https://aistudio.google.com/apikey
 */
import { useState, useRef, useCallback } from "react";
import {
  BrainCircuit, CheckCircle2, ChevronRight, Clock, FileText,
  UploadCloud, User, X, Zap, AlertTriangle, Loader2,
  Plus, Copy, Check, ArrowRight, Eye, RotateCcw, Settings,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { useNavigate } from "@tanstack/react-router";
import type { CrmScope } from "@/components/crm/crm-dashboard";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type DocTipo =
  | "rg" | "cnh" | "cpf_doc"
  | "comprovante_renda" | "comprovante_endereco"
  | "extrato_bancario" | "declaracao_ir" | "outro";

type StatusExtracao = "aguardando" | "processando" | "concluido" | "erro";

interface DadosExtraidos {
  tipo_documento?: string;
  nome_completo?: string;
  cpf?: string;
  rg?: string;
  orgao_expedidor?: string;
  data_nascimento?: string;
  nome_mae?: string;
  nome_pai?: string;
  naturalidade?: string;
  nacionalidade?: string;
  data_expedicao?: string;
  validade?: string;
  cnh_numero?: string;
  cnh_categoria?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_municipio?: string;
  endereco_uf?: string;
  endereco_cep?: string;
  renda_mensal?: string;
  empregador?: string;
  cnpj_empregador?: string;
  cargo?: string;
  mes_referencia?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  confianca?: "alta" | "media" | "baixa";
  observacoes?: string;
}

interface DocProcessado {
  id: string;
  nome: string;
  tipo: DocTipo;
  status: StatusExtracao;
  preview?: string;          // URL.createObjectURL
  dadosExtraidos?: DadosExtraidos;
  erro?: string;
  processadoEm?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/scan-documento`;

const TIPOS_DOC: { value: DocTipo; label: string; hint: string; icon: string }[] = [
  { value: "rg", label: "RG", hint: "Frente e verso — digitalizado ou foto nítida", icon: "🪪" },
  { value: "cnh", label: "CNH", hint: "Frente visível — dados e foto", icon: "🚗" },
  { value: "cpf_doc", label: "CPF (físico)", hint: "Comprovante de CPF emitido pela RF", icon: "📋" },
  { value: "comprovante_renda", label: "Comprovante de renda", hint: "Holerite, extrato bancário ou DECORE", icon: "💰" },
  { value: "comprovante_endereco", label: "Comprovante de endereço", hint: "Conta de luz, água, gás ou telefone", icon: "🏠" },
  { value: "extrato_bancario", label: "Extrato bancário", hint: "Últimos 3 meses", icon: "🏦" },
  { value: "declaracao_ir", label: "Declaração de IR", hint: "Capa + resumo da declaração", icon: "📑" },
  { value: "outro", label: "Outro documento", hint: "Qualquer documento com dados cadastrais", icon: "📄" },
];

// Labels para exibição dos campos extraídos
const FIELD_LABELS: Record<string, string> = {
  tipo_documento: "Tipo detectado",
  nome_completo: "Nome completo",
  cpf: "CPF",
  rg: "RG",
  orgao_expedidor: "Órgão expedidor",
  data_nascimento: "Data de nascimento",
  nome_mae: "Nome da mãe",
  nome_pai: "Nome do pai",
  naturalidade: "Naturalidade",
  nacionalidade: "Nacionalidade",
  data_expedicao: "Data de expedição",
  validade: "Validade",
  cnh_numero: "Nº CNH",
  cnh_categoria: "Categoria CNH",
  endereco_logradouro: "Logradouro",
  endereco_numero: "Número",
  endereco_complemento: "Complemento",
  endereco_bairro: "Bairro",
  endereco_municipio: "Município",
  endereco_uf: "UF",
  endereco_cep: "CEP",
  renda_mensal: "Renda mensal",
  empregador: "Empregador",
  cnpj_empregador: "CNPJ empregador",
  cargo: "Cargo",
  mes_referencia: "Mês de referência",
  banco: "Banco",
  agencia: "Agência",
  conta: "Conta",
  observacoes: "Observações",
};

// ---------------------------------------------------------------------------
// Converte File para Base64
// ---------------------------------------------------------------------------
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove prefixo "data:image/jpeg;base64,"
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Chamada à Edge Function
// ---------------------------------------------------------------------------
async function chamarScanIA(file: File): Promise<DadosExtraidos> {
  const base64 = await fileToBase64(file);
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      base64,
      mimeType: file.type || "image/jpeg",
    }),
  });

  const data = await res.json() as { sucesso?: boolean; dados?: DadosExtraidos; erro?: string };
  if (!res.ok || !data.sucesso) {
    throw new Error(data.erro ?? `Erro ${res.status}`);
  }
  return data.dados ?? {};
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function ScanIaView({ scope }: { scope: CrmScope }) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocProcessado[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<DocTipo>("rg");
  const [docSelecionado, setDocSelecionado] = useState<DocProcessado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [apiKeyFaltando, setApiKeyFaltando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processarArquivo = useCallback(async (file: File) => {
    const doc: DocProcessado = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: file.name,
      tipo: tipoSelecionado,
      status: "processando",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    };

    setDocs((prev) => [doc, ...prev]);
    setDocSelecionado(doc);

    try {
      const dados = await chamarScanIA(file);
      const docAtualizado: DocProcessado = {
        ...doc,
        status: "concluido",
        dadosExtraidos: dados,
        processadoEm: new Date().toLocaleTimeString("pt-BR"),
      };
      setDocs((prev) => prev.map((d) => d.id === doc.id ? docAtualizado : d));
      setDocSelecionado(docAtualizado);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      const isApiKey = msg.toLowerCase().includes("gemini_api_key") || msg.toLowerCase().includes("api_key");
      if (isApiKey) setApiKeyFaltando(true);

      const docErro: DocProcessado = {
        ...doc,
        status: "erro",
        erro: isApiKey
          ? "GEMINI_API_KEY não configurada. Vá ao Supabase Dashboard → Edge Functions → Secrets."
          : msg,
      };
      setDocs((prev) => prev.map((d) => d.id === doc.id ? docErro : d));
      setDocSelecionado(docErro);
    }
  }, [tipoSelecionado]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf",
    );
    files.forEach(processarArquivo);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach(processarArquivo);
    e.target.value = "";
  }

  function irParaCadastro() {
    if (!docSelecionado?.dadosExtraidos) return;
    const d = docSelecionado.dadosExtraidos;

    // Monta lead no formato que o CRM Cadastro espera
    const lead = {
      nomeCompleto: d.nome_completo ?? "",
      cpf: d.cpf ?? "",
      cnpj: "",
      dataNascimento: d.data_nascimento
        ? converterDataParaISO(d.data_nascimento)
        : "",
      email: "",
      telefone: "",
      uf: d.endereco_uf ?? "",
      municipio: d.endereco_municipio ?? "",
      nomeMae: d.nome_mae ?? "",
      rg: d.rg ?? "",
      orgaoExpedidor: d.orgao_expedidor ?? "",
      endereco: [d.endereco_logradouro, d.endereco_numero, d.endereco_complemento]
        .filter(Boolean).join(", "),
      bairro: d.endereco_bairro ?? "",
      cep: d.endereco_cep ?? "",
      tipo: "PF" as const,
      origem: "scan-ia",
    };

    sessionStorage.setItem("agilliza:flash-ia-lead", JSON.stringify(lead));
    const base = scope === "correspondente" ? "/correspondente" : "/corretor";
    navigate({ to: `${base}/crm/cadastro` as never });
  }

  function copiarDados() {
    if (!docSelecionado?.dadosExtraidos) return;
    const linhas = Object.entries(docSelecionado.dadosExtraidos)
      .filter(([k, v]) => v && k !== "confianca")
      .map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`);
    navigator.clipboard.writeText(linhas.join("\n")).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function retentarDoc(docId: string) {
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return;
    // Não temos o File original, então apenas reseta e pede novo upload
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    setDocSelecionado(null);
  }

  const concluidos = docs.filter((d) => d.status === "concluido");
  const processando = docs.filter((d) => d.status === "processando");
  const erros = docs.filter((d) => d.status === "erro");

  const confiancaColor = {
    alta: "text-emerald-700 bg-emerald-50 border-emerald-200",
    media: "text-amber-700 bg-amber-50 border-amber-200",
    baixa: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`CRM · ${scope === "correspondente" ? "Correspondente" : "Corretor"}`}
        title="Scan IA"
        subtitle="Envie documentos do cliente — Gemini Vision extrai os dados automaticamente e pré-preenche o cadastro."
        right={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              <BrainCircuit className="h-3.5 w-3.5" />
              Gemini Vision
            </span>
          </div>
        }
      />

      {/* Banner: API Key faltando */}
      {apiKeyFaltando && (
        <section className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-5 py-4">
          <Settings className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">Configuração necessária</p>
            <p className="mt-1 text-xs text-red-800">
              A chave do Gemini não está configurada. Siga os passos:
            </p>
            <ol className="mt-2 space-y-1 text-xs text-red-800 list-decimal list-inside">
              <li>Obtenha sua chave grátis em <strong>aistudio.google.com/apikey</strong></li>
              <li>Acesse <strong>Supabase Dashboard → Edge Functions → Secrets</strong></li>
              <li>Adicione: <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY = sua_chave</code></li>
              <li>Faça deploy da função: <code className="bg-red-100 px-1 rounded">supabase functions deploy scan-documento</code></li>
            </ol>
          </div>
          <button onClick={() => setApiKeyFaltando(false)} className="rounded p-1 text-red-600 hover:bg-red-100">
            <X className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* KPIs */}
      {docs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Processados", value: concluidos.length, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { label: "Processando", value: processando.length, color: "text-amber-600 bg-amber-50 border-amber-200" },
            { label: "Com erro", value: erros.length, color: "text-red-600 bg-red-50 border-red-200" },
          ].map((k) => (
            <div key={k.label} className={`rounded-lg border px-4 py-3 text-center ${k.color}`}>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* Coluna principal */}
        <div className="space-y-4">
          {/* Seletor de tipo */}
          <section className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de documento
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIPOS_DOC.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTipoSelecionado(t.value)}
                  className={[
                    "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                    tipoSelecionado === t.value
                      ? "border-brand bg-brand/5 ring-1 ring-brand/20"
                      : "border-border bg-background hover:border-brand/30",
                  ].join(" ")}
                >
                  <span className="text-xl mb-1">{t.icon}</span>
                  <span className="text-xs font-bold text-graphite">{t.label}</span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{t.hint}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Dropzone */}
          <section
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-brand/30 bg-gradient-to-b from-brand/3 to-transparent p-10 transition-all hover:border-brand/60 hover:from-brand/5"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand shadow-sm">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-graphite">
                Arraste o documento ou clique para selecionar
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                PNG, JPG, WEBP ou PDF · máx. 10 MB por arquivo
              </p>
              <p className="mt-1 text-[11px] font-semibold text-brand">
                O Gemini Vision vai ler e extrair os dados automaticamente
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </section>

          {/* Lista de documentos */}
          {docs.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Documentos ({docs.length})
              </p>
              {docs.map((doc) => {
                const tipoInfo = TIPOS_DOC.find((t) => t.value === doc.tipo);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setDocSelecionado(doc)}
                    className={[
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                      docSelecionado?.id === doc.id
                        ? "border-brand bg-brand/5 shadow-sm"
                        : "border-border bg-card",
                    ].join(" ")}
                  >
                    {/* Preview ou ícone */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                      {doc.preview ? (
                        <img src={doc.preview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                          {tipoInfo?.icon ?? "📄"}
                        </div>
                      )}
                      {/* Status overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center rounded-lg ${
                        doc.status === "processando"
                          ? "bg-amber-500/70"
                          : doc.status === "erro"
                          ? "bg-red-500/70"
                          : "bg-emerald-500/0"
                      }`}>
                        {doc.status === "processando" && (
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        )}
                        {doc.status === "erro" && (
                          <AlertTriangle className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-graphite">{doc.nome}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {tipoInfo?.label}
                        {doc.status === "processando" && " · Analisando..."}
                        {doc.status === "concluido" && doc.processadoEm && ` · ${doc.processadoEm}`}
                        {doc.status === "erro" && " · Erro na extração"}
                      </p>
                      {doc.status === "concluido" && doc.dadosExtraidos?.confianca && (
                        <span className={`inline-block mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${confiancaColor[doc.dadosExtraidos.confianca]}`}>
                          Confiança {doc.dadosExtraidos.confianca}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.status === "concluido" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (docSelecionado?.id === doc.id) setDocSelecionado(null);
                          setDocs((p) => p.filter((d) => d.id !== doc.id));
                          if (doc.preview) URL.revokeObjectURL(doc.preview);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-graphite"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {docs.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-semibold text-graphite">Nenhum documento enviado</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecione o tipo acima e arraste o documento
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Painel lateral — dados extraídos */}
        <aside className="space-y-4">
          <div className="sticky top-4 space-y-4">

            {/* Processando */}
            {docSelecionado?.status === "processando" && (
              <section className="overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3 border-b border-amber-200 px-4 py-3 bg-amber-100/50">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <p className="text-xs font-bold text-amber-800">Gemini está analisando...</p>
                </div>
                <div className="p-5 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 grid place-items-center rounded-full bg-amber-100">
                    <BrainCircuit className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-amber-900">Lendo o documento</p>
                  <p className="mt-1 text-xs text-amber-700">
                    O Gemini Vision está identificando e extraindo todos os campos...
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Erro */}
            {docSelecionado?.status === "erro" && (
              <section className="rounded-lg border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs font-bold">Erro na extração</p>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">{docSelecionado.erro}</p>
                <button
                  onClick={() => retentarDoc(docSelecionado.id)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  Remover e tentar novamente
                </button>
              </section>
            )}

            {/* Dados extraídos */}
            {docSelecionado?.status === "concluido" && docSelecionado.dadosExtraidos && (
              <section className="overflow-hidden rounded-lg border border-emerald-200 bg-card">
                <header className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-700" />
                    <p className="text-xs font-bold text-emerald-800">Dados extraídos pelo Gemini</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {docSelecionado.dadosExtraidos.confianca && (
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${confiancaColor[docSelecionado.dadosExtraidos.confianca]}`}>
                        {docSelecionado.dadosExtraidos.confianca}
                      </span>
                    )}
                    <button onClick={copiarDados} title="Copiar todos os dados" className="rounded p-1.5 text-muted-foreground hover:bg-secondary">
                      {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </header>

                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {Object.entries(docSelecionado.dadosExtraidos)
                    .filter(([k, v]) => v && v !== "null" && k !== "confianca" && k !== "tipo_documento")
                    .map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {FIELD_LABELS[k] ?? k}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-graphite break-words">{String(v)}</p>
                        </div>
                      </div>
                    ))}
                </div>

                {docSelecionado.dadosExtraidos.observacoes && (
                  <div className="border-t border-amber-200 bg-amber-50/50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Observação da IA</p>
                    <p className="mt-0.5 text-xs text-amber-800">{docSelecionado.dadosExtraidos.observacoes}</p>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="border-t border-border p-4 flex flex-col gap-2">
                  <button
                    onClick={irParaCadastro}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-xs font-bold text-brand-foreground hover:bg-brand/90 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Cadastrar Cliente com estes dados
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={copiarDados}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand transition-colors"
                  >
                    {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiado ? "Copiado!" : "Copiar dados"}
                  </button>
                </div>
              </section>
            )}

            {/* Estado idle */}
            {!docSelecionado && (
              <section className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-graphite">Aguardando documento</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Após o envio, os dados extraídos aparecerão aqui
                  </p>
                </div>
              </section>
            )}

            {/* Info */}
            <div className="rounded-lg border border-border bg-card p-4 text-xs">
              <p className="font-semibold text-graphite mb-2">Como funciona</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <UploadCloud className="h-3 w-3 shrink-0 text-brand" />
                  Faça upload da foto ou PDF do documento
                </li>
                <li className="flex items-center gap-1.5">
                  <BrainCircuit className="h-3 w-3 shrink-0 text-brand" />
                  Gemini Vision identifica e lê todos os campos
                </li>
                <li className="flex items-center gap-1.5">
                  <Eye className="h-3 w-3 shrink-0 text-brand" />
                  Revise os dados extraídos na tela
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-brand" />
                  Cadastre o cliente com os dados pré-preenchidos
                </li>
              </ul>
              <div className="mt-3 flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1.5">
                <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground">Tempo médio: 3–8 segundos por documento</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Converte DD/MM/AAAA para YYYY-MM-DD
function converterDataParaISO(data: string): string {
  const match = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}
