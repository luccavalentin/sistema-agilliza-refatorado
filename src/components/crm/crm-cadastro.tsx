import { useState, type ReactNode } from "react";
import {
  User2,
  IdCard,
  MapPin,
  Building2,
  Heart,
  Users,
  LinkIcon,
  Store,
  Home,
  FileText,
  Plus,
  Paperclip,
  Save,
  CheckCircle2,
  X,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import type { CrmScope } from "./crm-dashboard";

type SectionKey =
  | "identificacao"
  | "documento"
  | "endereco"
  | "pj"
  | "conjuge"
  | "composicao"
  | "vinculos"
  | "vendedor"
  | "imovel"
  | "documentos";

const sections: { key: SectionKey; label: string; icon: typeof User2 }[] = [
  { key: "identificacao", label: "Identificação", icon: User2 },
  { key: "documento", label: "Documento", icon: IdCard },
  { key: "endereco", label: "Endereço", icon: MapPin },
  { key: "pj", label: "Pessoa Jurídica", icon: Building2 },
  { key: "conjuge", label: "Cônjuge", icon: Heart },
  { key: "composicao", label: "Composição de renda", icon: Users },
  { key: "vinculos", label: "Vínculos operacionais", icon: LinkIcon },
  { key: "vendedor", label: "Vendedor", icon: Store },
  { key: "imovel", label: "Imóvel", icon: Home },
  { key: "documentos", label: "Documentos", icon: FileText },
];

function Field({
  label,
  children,
  required,
  span = "md:col-span-1",
}: {
  label: string;
  children?: ReactNode;
  required?: boolean;
  span?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${span}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-direction">*</span>}
      </span>
      {children ?? (
        <input
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          placeholder=" "
        />
      )}
    </label>
  );
}

function Select({ options }: { options: string[] }) {
  return (
    <select className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function Chip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-[11px] font-semibold text-brand">
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remover">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function SectionCard({
  title,
  icon: Icon,
  badge,
  children,
  action,
}: {
  title: string;
  icon: typeof User2;
  badge?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-bold tracking-tight text-graphite">{title}</h2>
          {badge && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        {action}
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">{children}</div>
    </section>
  );
}

export function CrmCadastro({ scope }: { scope: CrmScope }) {
  const [active, setActive] = useState<SectionKey>("identificacao");
  const creatorRole = scope === "correspondente" ? "Correspondente" : "Corretor";

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow={`CRM · ${scope === "correspondente" ? "Correspondente" : "Corretor"}`}
        title="Cadastro de Cliente"
        subtitle="Cadastro completo preparado para simulação, aprovação, financiamento imobiliário e home equity."
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            Cadastro auditável
          </span>
        }
      />

      {/* Audit strip */}
      <section className="grid gap-2 rounded-lg border border-border bg-card p-4 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Criado por", v: "—" },
          { l: "Perfil criador", v: creatorRole },
          { l: "Data / hora", v: "—" },
          { l: "Origem", v: "Manual" },
          { l: "Atualizado por", v: "—" },
          { l: "Última atualização", v: "—" },
          { l: "Imobiliária", v: "—" },
          { l: "Corretor responsável", v: scope === "corretor" ? "Você" : "—" },
        ].map((r) => (
          <div key={r.l} className="rounded border border-border bg-background px-2 py-1.5">
            <p className="font-semibold uppercase tracking-wider text-muted-foreground">{r.l}</p>
            <p className="mt-0.5 font-bold text-graphite">{r.v}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <nav className="space-y-1 rounded-lg border border-border bg-card p-2">
          {sections.map((s) => {
            const A = s.icon;
            const on = active === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={[
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] font-medium",
                  on ? "bg-brand text-brand-foreground" : "text-graphite hover:bg-secondary",
                ].join(" ")}
              >
                <A className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-5">
          {active === "identificacao" && (
            <SectionCard title="Identificação do cliente" icon={User2}>
              <Field label="Tipo de pessoa" required>
                <Select options={["Pessoa Física", "Pessoa Jurídica"]} />
              </Field>
              <Field label="Nome completo / Razão social" required span="md:col-span-2" />
              <Field label="CPF / CNPJ" required />
              <Field label="Data de nascimento / abertura" />
              <Field label="Sexo">
                <Select options={["Feminino", "Masculino", "Não informar"]} />
              </Field>
              <Field label="Nome da mãe" span="md:col-span-2" />
              <Field label="E-mail" required />
              <Field label="Celular" required />
              <Field label="Telefone secundário" />
              <Field label="Estado civil">
                <Select options={["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"]} />
              </Field>
              <Field label="Regime de casamento">
                <Select options={["Comunhão parcial", "Comunhão universal", "Separação total", "Participação final"]} />
              </Field>
              <Field label="Nacionalidade" />
              <Field label="Naturalidade" />
              <Field label="Profissão" />
              <Field label="Cargo" />
              <Field label="Empresa / atividade profissional" span="md:col-span-2" />
              <Field label="Renda bruta mensal" />
              <Field label="Tipo de renda">
                <Select options={["Formal", "Informal", "Formal + Informal"]} />
              </Field>
              <Field label="Usa FGTS">
                <Select options={["Não", "Sim"]} />
              </Field>
              <Field label="Saldo aproximado de FGTS" />
              <Field label="Autorização de uso e compartilhamento de dados" span="md:col-span-3">
                <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[color:var(--brand)]" />
                  Cliente autoriza o uso e compartilhamento de dados para análise de crédito.
                </label>
              </Field>
            </SectionCard>
          )}

          {active === "documento" && (
            <SectionCard title="Documento de identidade" icon={IdCard}>
              <Field label="Tipo de documento" required>
                <Select options={["RG", "CNH"]} />
              </Field>
              <Field label="Número do documento" required />
              <Field label="Data de expedição" />
              <Field label="Órgão expedidor" />
              <Field label="UF de expedição" />
            </SectionCard>
          )}

          {active === "endereco" && (
            <SectionCard title="Endereço do cliente" icon={MapPin}>
              <Field label="CEP" required />
              <Field label="Logradouro" span="md:col-span-2" />
              <Field label="Número" />
              <Field label="Complemento" />
              <Field label="Bairro" />
              <Field label="Município" />
              <Field label="UF" />
            </SectionCard>
          )}

          {active === "pj" && (
            <SectionCard title="Dados de Pessoa Jurídica" icon={Building2} badge="Somente PJ">
              <Field label="Tipo de empresa" />
              <Field label="Data de registro" />
              <Field label="Faturamento" />
              <Field label="Patrimônio líquido" />
              <Field label="Capital social" />
              <Field label="Responsável legal" span="md:col-span-2" />
              <Field label="CPF do responsável" />
              <Field label="E-mail do responsável" />
              <Field label="Celular do responsável" />
            </SectionCard>
          )}

          {active === "conjuge" && (
            <SectionCard title="Cônjuge" icon={Heart} badge="Quando aplicável">
              <Field label="Nome completo" span="md:col-span-2" />
              <Field label="CPF" />
              <Field label="Data de nascimento" />
              <Field label="Sexo">
                <Select options={["Feminino", "Masculino", "Não informar"]} />
              </Field>
              <Field label="E-mail" />
              <Field label="Celular" />
              <Field label="Profissão" />
              <Field label="Renda bruta" />
              <Field label="Empresa / atividade" span="md:col-span-2" />
              <Field label="Tipo de documento">
                <Select options={["RG", "CNH"]} />
              </Field>
              <Field label="Número do documento" />
              <Field label="Data de expedição" />
              <Field label="Órgão expedidor" />
              <Field label="UF de expedição" />
            </SectionCard>
          )}

          {active === "composicao" && (
            <SectionCard
              title="Composição de renda"
              icon={Users}
              badge="Múltiplos participantes"
              action={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground hover:bg-brand-strong"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar participante
                </button>
              }
            >
              <Field label="Nome completo" span="md:col-span-2" />
              <Field label="CPF / CNPJ" />
              <Field label="Tipo de pessoa">
                <Select options={["PF", "PJ"]} />
              </Field>
              <Field label="Data de nascimento" />
              <Field label="Estado civil">
                <Select options={["Solteiro(a)", "Casado(a)", "União estável"]} />
              </Field>
              <Field label="Profissão" />
              <Field label="Renda bruta" />
              <Field label="E-mail" />
              <Field label="Celular" />
              <Field label="Endereço completo" span="md:col-span-3" />
              <Field label="Grau de vínculo">
                <Select options={["Cônjuge", "Pai/Mãe", "Filho(a)", "Irmão(ã)", "Outro"]} />
              </Field>
              <Field label="Participa da proposta">
                <Select options={["Sim", "Não"]} />
              </Field>
              <Field label="Percentual de composição (%)" />
              <Field label="Autorização de dados" span="md:col-span-3">
                <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[color:var(--brand)]" /> Autoriza análise de crédito.
                </label>
              </Field>
            </SectionCard>
          )}

          {active === "vinculos" && (
            <SectionCard title="Vínculos operacionais" icon={LinkIcon} badge="Permissões aplicadas">
              <Field label="Imobiliária vinculada" />
              <Field label="Correspondente responsável" />
              <Field label="Comercial responsável" />
              <Field label="Backoffice responsável" />
              <Field label="Origem do cliente">
                <Select options={["Indicação corretor", "Site / formulário", "Parceiro imobiliária", "Marketing", "Indicação cliente", "Outros"]} />
              </Field>
              <Field label="Usuário criador">
                <input
                  defaultValue={creatorRole === "Corretor" ? "Você (Corretor)" : "Você (Correspondente)"}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-graphite"
                  readOnly
                />
              </Field>
              <Field label="Corretores vinculados" span="md:col-span-3">
                <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-2">
                  {scope === "corretor" && <Chip>Você</Chip>}
                  <Chip onRemove={() => {}}>Mariana Lopes</Chip>
                  <Chip onRemove={() => {}}>Rafael Souza</Chip>
                  <button type="button" className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline">
                    <Plus className="h-3 w-3" /> Adicionar
                  </button>
                </div>
              </Field>
              <Field label="Analistas vinculados" span="md:col-span-3">
                <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-2">
                  <Chip onRemove={() => {}}>Camila Duarte</Chip>
                  <button type="button" className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline">
                    <Plus className="h-3 w-3" /> Adicionar
                  </button>
                </div>
              </Field>
              <Field label="Parceiros relacionados" span="md:col-span-3">
                <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-2">
                  <button type="button" className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline">
                    <Plus className="h-3 w-3" /> Adicionar parceiro
                  </button>
                </div>
              </Field>

              <div className="md:col-span-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Histórico de alteração de vínculos
                </p>
                <ul className="space-y-2 text-[12px]">
                  {[
                    { who: creatorRole, what: "Criou o cadastro", when: "Hoje · 14:22" },
                    { who: "Camila Duarte", what: "Adicionada como analista", when: "Hoje · 14:24" },
                    { who: "Rafael Souza", what: "Vinculado como corretor", when: "Hoje · 14:25" },
                  ].map((h, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold text-graphite">{h.who}</span>
                      <span className="text-muted-foreground">{h.what}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground">{h.when}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          )}

          {active === "vendedor" && (
            <SectionCard
              title="Cadastro do vendedor"
              icon={Store}
              badge="Um ou mais"
              action={
                <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground hover:bg-brand-strong">
                  <Plus className="h-3.5 w-3.5" /> Adicionar vendedor
                </button>
              }
            >
              <Field label="Tipo de pessoa">
                <Select options={["Pessoa Física", "Pessoa Jurídica"]} />
              </Field>
              <Field label="Nome / Razão social" span="md:col-span-2" />
              <Field label="CPF / CNPJ" />
              <Field label="Data nascimento / abertura" />
              <Field label="E-mail" />
              <Field label="Celular" />
              <Field label="Telefone secundário" />
              <Field label="Estado civil">
                <Select options={["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"]} />
              </Field>
              <Field label="Regime de casamento">
                <Select options={["Comunhão parcial", "Comunhão universal", "Separação total"]} />
              </Field>
              <Field label="Nome da mãe" span="md:col-span-2" />
              <Field label="Profissão" />
              <Field label="Renda (se aplicável)" />
              <Field label="Tipo de documento">
                <Select options={["RG", "CNH"]} />
              </Field>
              <Field label="Número do documento" />
              <Field label="Data de expedição" />
              <Field label="Órgão expedidor" />
              <Field label="UF de expedição" />
              <Field label="Endereço completo" span="md:col-span-3" />
              <Field label="Vendedor principal">
                <Select options={["Sim", "Não"]} />
              </Field>
              <Field label="Percentual de participação (%)" />
              <Field label="Representante legal (PJ)" />
              <Field label="Observações" span="md:col-span-3">
                <textarea className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
              </Field>
            </SectionCard>
          )}

          {active === "imovel" && (
            <SectionCard
              title="Cadastro do imóvel"
              icon={Home}
              action={
                <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground hover:bg-brand-strong">
                  <Plus className="h-3.5 w-3.5" /> Adicionar imóvel
                </button>
              }
            >
              <Field label="Tipo de imóvel">
                <Select options={["Apartamento", "Casa", "Galpão", "Terreno", "Terreno em condomínio", "Comercial", "Outros"]} />
              </Field>
              <Field label="Uso do imóvel">
                <Select options={["Residencial", "Comercial"]} />
              </Field>
              <Field label="Situação do imóvel">
                <Select options={["Novo", "Usado", "Quitado", "Financiado", "Alienado", "Em garantia", "Em inventário", "Outro"]} />
              </Field>
              <Field label="Valor do imóvel" />
              <Field label="Valor de compra e venda" />
              <Field label="Valor estimado de garantia (HE)" />
              <Field label="CEP" />
              <Field label="Logradouro" span="md:col-span-2" />
              <Field label="Número" />
              <Field label="Complemento" />
              <Field label="Bairro" />
              <Field label="Município" />
              <Field label="UF" />
              <Field label="Matrícula do imóvel" />
              <Field label="Cartório de registro" />
              <Field label="Número do IPTU" />
              <Field label="Inscrição municipal" />
              <Field label="Em nome do cliente">
                <Select options={["Sim", "Não"]} />
              </Field>
              <Field label="Mais de um proprietário">
                <Select options={["Não", "Sim"]} />
              </Field>
              <Field label="Possui ônus / alienação">
                <Select options={["Não", "Sim"]} />
              </Field>
              <Field label="Possui dívida ativa">
                <Select options={["Não", "Sim"]} />
              </Field>
              <Field label="Banco atual da dívida" />
              <Field label="Saldo devedor aproximado" />
              <Field label="Valor da parcela atual" />
              <Field label="Prazo restante (meses)" />
              <Field label="Quitar dívida com novo crédito (HE)">
                <Select options={["Não", "Sim"]} />
              </Field>
              <Field label="Observações do imóvel" span="md:col-span-3">
                <textarea className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>
            </SectionCard>
          )}

          {active === "documentos" && (
            <SectionCard
              title="Documentos"
              icon={FileText}
              badge="Checklist por categoria"
              action={
                <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 px-3 py-1.5 text-[11px] font-semibold text-brand hover:bg-brand/5">
                  <Paperclip className="h-3.5 w-3.5" /> Anexar
                </button>
              }
            >
              <div className="md:col-span-3 space-y-4">
                {[
                  { cat: "Cliente", items: ["Documento de identificação", "Comprovante de renda", "Comprovante de endereço", "Certidão de casamento", "Extrato FGTS", "Imposto de renda"] },
                  { cat: "Cônjuge", items: ["Documento de identificação", "Comprovante de renda", "Comprovante de endereço"] },
                  { cat: "Composição de renda", items: ["Documento de identificação", "Comprovante de renda", "Autorização de dados"] },
                  { cat: "Vendedor", items: ["Documento de identificação", "Certidão do vendedor", "Comprovante de endereço", "Documentos do cônjuge do vendedor", "Documentos societários (PJ)"] },
                  { cat: "Imóvel", items: ["Matrícula atualizada", "IPTU", "Escritura", "Contrato de compra e venda", "Certidões do imóvel", "Laudo / avaliação"] },
                  { cat: "Home Equity", items: ["Matrícula atualizada", "IPTU", "Comprovante de propriedade", "Contrato de financiamento atual", "Saldo devedor", "Documentos dos demais proprietários", "Autorização de análise da garantia"] },
                  { cat: "Adicionais", items: ["Outros documentos"] },
                ].map((g) => (
                  <div key={g.cat} className="rounded-md border border-border bg-background">
                    <header className="flex items-center justify-between border-b border-border px-3 py-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand">{g.cat}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {g.items.length} itens
                      </span>
                    </header>
                    <ul className="divide-y divide-border">
                      {g.items.map((d, i) => {
                        const status = i % 4 === 0 ? "Aprovado" : i % 4 === 1 ? "Pendente" : i % 4 === 2 ? "Reprovado" : "Aguardando";
                        const tone =
                          status === "Aprovado"
                            ? "text-emerald-700 bg-emerald-50"
                            : status === "Reprovado"
                              ? "text-red-700 bg-red-50"
                              : status === "Pendente"
                                ? "text-amber-700 bg-amber-50"
                                : "text-slate-600 bg-slate-100";
                        return (
                          <li key={d} className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-graphite">{d}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>{status}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">Responsável: —</span>
                            <button type="button" className="rounded border border-border px-2 py-1 text-[10px] font-semibold text-graphite hover:border-brand/40 hover:text-brand">
                              <Paperclip className="mr-1 inline h-3 w-3" /> Anexar
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Action bar */}
          <div className="sticky bottom-2 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              <Save className="h-3.5 w-3.5" /> Salvar rascunho
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:bg-brand-strong">
              <CheckCircle2 className="h-3.5 w-3.5" /> Salvar cliente
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Salvar e continuar
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Salvar e criar simulação
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Salvar e adicionar vendedor
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Salvar e adicionar imóvel
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Ver pendências
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Validar para simulação
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand">
              Validar para aprovação
            </button>
            <button type="button" className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-direction hover:bg-direction/5">
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
