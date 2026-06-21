/**
 * Módulo de Backup — Agilliza
 *
 * Exporta TODOS os dados do sistema em planilha .xlsx com múltiplas abas.
 * Suporta backup manual imediato e agendamento diário via localStorage.
 */
import { useState, useEffect, useCallback } from "react";
import {
  Download, Database, CheckCircle2, Clock, Calendar,
  FileSpreadsheet, RefreshCw, ShieldCheck, AlertTriangle,
  ChevronRight, ToggleLeft, ToggleRight, Info, Layers,
  TrendingUp, Users, FileText, Wallet, BarChart3,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { gerarBackupXLSX, getBackupMetadata, type BackupMetadata } from "@/lib/backup-engine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STORAGE_KEY_HISTORICO = "agilliza:backup:historico";
const STORAGE_KEY_AUTO = "agilliza:backup:auto";
const STORAGE_KEY_HORARIO = "agilliza:backup:horario";

interface BackupEntry {
  id: string;
  geradoEm: string;
  nomeArquivo: string;
  totalRegistros: number;
  tipo: "manual" | "automatico";
}

// ---------------------------------------------------------------------------
// Ícones por módulo
// ---------------------------------------------------------------------------
const MODULE_ICONS: Record<string, React.ReactNode> = {
  Clientes: <Users className="h-3.5 w-3.5" />,
  Simulações: <TrendingUp className="h-3.5 w-3.5" />,
  "Propostas (Kanban)": <Layers className="h-3.5 w-3.5" />,
  "Histórico de propostas": <FileText className="h-3.5 w-3.5" />,
  "Demandas / SLA": <AlertTriangle className="h-3.5 w-3.5" />,
  Tarefas: <CheckCircle2 className="h-3.5 w-3.5" />,
  "Contas a receber": <Wallet className="h-3.5 w-3.5" />,
  "Contas a pagar": <Wallet className="h-3.5 w-3.5" />,
  Comissões: <BarChart3 className="h-3.5 w-3.5" />,
  Recorrências: <RefreshCw className="h-3.5 w-3.5" />,
  "Conciliação bancária": <Database className="h-3.5 w-3.5" />,
  "Contas financeiras": <Database className="h-3.5 w-3.5" />,
  "Usuários / Equipe": <Users className="h-3.5 w-3.5" />,
  "Bancos parceiros": <Database className="h-3.5 w-3.5" />,
  "Categorias financeiras": <Layers className="h-3.5 w-3.5" />,
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function BackupModule() {
  const [gerando, setGerando] = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState<BackupEntry | null>(null);
  const [historico, setHistorico] = useState<BackupEntry[]>([]);
  const [autoBackup, setAutoBackup] = useState(false);
  const [horarioAuto, setHorarioAuto] = useState("06:00");
  const [meta] = useState<BackupMetadata>(getBackupMetadata);
  const [successAnim, setSuccessAnim] = useState(false);

  // Carrega histórico e config do localStorage
  useEffect(() => {
    try {
      const hist = localStorage.getItem(STORAGE_KEY_HISTORICO);
      if (hist) {
        const parsed: BackupEntry[] = JSON.parse(hist);
        setHistorico(parsed);
        if (parsed.length > 0) setUltimoBackup(parsed[0]);
      }
      const auto = localStorage.getItem(STORAGE_KEY_AUTO);
      if (auto) setAutoBackup(auto === "true");
      const horario = localStorage.getItem(STORAGE_KEY_HORARIO);
      if (horario) setHorarioAuto(horario);
    } catch {/* */}
  }, []);

  // Verifica backup automático diário
  useEffect(() => {
    if (!autoBackup) return;
    const checarHorario = () => {
      const agora = new Date();
      const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      const hoje = agora.toDateString();
      const ultimoAuto = localStorage.getItem("agilliza:backup:ultimoAuto");

      if (horaAtual === horarioAuto && ultimoAuto !== hoje) {
        localStorage.setItem("agilliza:backup:ultimoAuto", hoje);
        executarBackup("automatico");
      }
    };
    const interval = setInterval(checarHorario, 60_000); // checa a cada 1 min
    checarHorario(); // checa imediatamente ao montar
    return () => clearInterval(interval);
  }, [autoBackup, horarioAuto]); // eslint-disable-line react-hooks/exhaustive-deps

  const executarBackup = useCallback(async (tipo: "manual" | "automatico" = "manual") => {
    setGerando(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // animação mínima
      gerarBackupXLSX();

      const totalReg = meta.modulos.reduce((s, m) => s + m.registros, 0);
      const entrada: BackupEntry = {
        id: `bkp-${Date.now()}`,
        geradoEm: new Date().toLocaleString("pt-BR"),
        nomeArquivo: meta.nomeArquivo,
        totalRegistros: totalReg,
        tipo,
      };

      setHistorico((prev) => {
        const novo = [entrada, ...prev].slice(0, 30); // mantém os últimos 30
        localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(novo));
        return novo;
      });
      setUltimoBackup(entrada);
      setSuccessAnim(true);
      setTimeout(() => setSuccessAnim(false), 3000);
    } finally {
      setGerando(false);
    }
  }, [meta]);

  function toggleAutoBackup() {
    const novo = !autoBackup;
    setAutoBackup(novo);
    localStorage.setItem(STORAGE_KEY_AUTO, String(novo));
  }

  function salvarHorario(h: string) {
    setHorarioAuto(h);
    localStorage.setItem(STORAGE_KEY_HORARIO, h);
  }

  const totalRegistros = meta.modulos.reduce((s, m) => s + m.registros, 0);

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Sistema · Correspondente"
        title="Backup & Exportação"
        subtitle="Exportação completa de todos os dados do sistema em planilha Excel — nenhum registro omitido."
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {totalRegistros.toLocaleString("pt-BR")} registros mapeados
          </span>
        }
      />

      {/* Banner de sucesso */}
      {successAnim && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-5 py-4 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Backup gerado com sucesso!</p>
            <p className="text-xs text-emerald-700">
              {meta.nomeArquivo} · {totalRegistros.toLocaleString("pt-BR")} registros · {meta.modulos.length} abas
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Coluna principal */}
        <div className="space-y-5">

          {/* Card de ação principal */}
          <section className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-brand/5 to-card shadow-sm">
            <div className="flex items-start gap-5 p-6">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand shadow">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-graphite">Backup completo do sistema</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gera um arquivo <strong>.xlsx</strong> com <strong>{meta.modulos.length} abas</strong>, cobrindo{" "}
                  <strong>todos os módulos</strong> — incluindo registros finalizados, arquivados e histórico completo.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Clientes", "Propostas", "Kanban", "Financeiro", "Comissões", "SLA", "Tarefas", "Histórico"].map((t) => (
                    <span key={t} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-card/50 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-muted-foreground">
                {ultimoBackup ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Último backup: <strong className="text-graphite">{ultimoBackup.geradoEm}</strong>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-amber-500" />
                    Nenhum backup realizado ainda
                  </span>
                )}
              </div>
              <button
                onClick={() => executarBackup("manual")}
                disabled={gerando}
                className="inline-flex items-center gap-2.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground shadow hover:bg-brand/90 disabled:opacity-60 transition-all active:scale-95"
              >
                {gerando ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {gerando ? "Gerando planilha..." : "Gerar e baixar backup agora"}
              </button>
            </div>
          </section>

          {/* Módulos incluídos */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="border-b border-border bg-secondary/40 px-5 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Módulos incluídos no backup — {meta.modulos.length} abas · {totalRegistros.toLocaleString("pt-BR")} registros
              </p>
            </header>
            <div className="divide-y divide-border">
              {meta.modulos.map((m) => (
                <div key={m.nome} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-brand">{MODULE_ICONS[m.nome] ?? <Database className="h-3.5 w-3.5" />}</span>
                  <p className="flex-1 text-sm font-medium text-graphite">{m.nome}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full bg-brand/20"
                      style={{ width: `${Math.max(20, Math.min(120, (m.registros / Math.max(...meta.modulos.map(x => x.registros))) * 120))}px` }}
                    >
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(m.registros / Math.max(...meta.modulos.map(x => x.registros))) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-graphite">
                      {m.registros.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </section>

          {/* Resumo financeiro */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="border-b border-border bg-secondary/40 px-5 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Resumo financeiro no backup
              </p>
            </header>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                { label: "Saldo total das contas", value: brl(meta.totais.saldoContas), color: "text-brand" },
                { label: "Total a receber (pendente)", value: brl(meta.totais.totalReceber), color: "text-emerald-600" },
                { label: "Total a pagar (pendente)", value: brl(meta.totais.totalPagar), color: "text-red-600" },
                { label: "Total de comissões previstas", value: brl(meta.totais.totalComissoes), color: "text-amber-600" },
              ].map((item) => (
                <div key={item.label} className="px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className={`mt-1 text-xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Backup automático diário */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand" />
                <p className="text-xs font-bold text-graphite">Backup automático diário</p>
              </div>
              <button
                onClick={toggleAutoBackup}
                className={`transition-colors ${autoBackup ? "text-brand" : "text-muted-foreground"}`}
                title={autoBackup ? "Desativar" : "Ativar"}
              >
                {autoBackup ? (
                  <ToggleRight className="h-7 w-7" />
                ) : (
                  <ToggleLeft className="h-7 w-7" />
                )}
              </button>
            </header>
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                {autoBackup
                  ? "✅ Ativo — o sistema gerará e baixará o backup automaticamente no horário definido."
                  : "O backup automático está desativado. Ative para receber a planilha diariamente."}
              </p>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Horário diário
                </label>
                <input
                  type="time"
                  value={horarioAuto}
                  onChange={(e) => salvarHorario(e.target.value)}
                  disabled={!autoBackup}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand disabled:opacity-50"
                />
              </div>
              {autoBackup && (
                <div className="rounded-md border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-brand">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Próximo backup: hoje às <strong>{horarioAuto}</strong>
                  <br />
                  <span className="text-muted-foreground">⚠️ O sistema precisa estar aberto no navegador.</span>
                </div>
              )}
            </div>
          </section>

          {/* Histórico */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="border-b border-border bg-secondary/40 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Histórico de backups ({historico.length})
              </p>
            </header>
            {historico.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <Database className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Nenhum backup realizado ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
                {historico.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                      entry.tipo === "automatico" ? "bg-brand/10 text-brand" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {entry.tipo === "automatico" ? (
                        <Calendar className="h-3 w-3" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-graphite truncate">{entry.nomeArquivo}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.geradoEm} · {entry.tipo === "automatico" ? "Automático" : "Manual"}
                      </p>
                      <p className="text-[10px] text-brand font-semibold">
                        {entry.totalRegistros.toLocaleString("pt-BR")} registros exportados
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Informações */}
          <section className="rounded-xl border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
            <p className="font-semibold text-graphite flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-brand" />
              Sobre o backup
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 mt-0.5" />
                <span>Todos os registros exportados — nenhum omitido, incluindo concluídos e arquivados</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 mt-0.5" />
                <span>Formato .xlsx compatível com Excel, Google Sheets e LibreOffice</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 mt-0.5" />
                <span>Valores monetários formatados em BRL, datas em DD/MM/AAAA</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 mt-0.5" />
                <span>Histórico das propostas em aba separada</span>
              </li>
              <li className="flex items-start gap-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500 mt-0.5" />
                <span>O backup automático requer que o sistema esteja aberto no navegador</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
