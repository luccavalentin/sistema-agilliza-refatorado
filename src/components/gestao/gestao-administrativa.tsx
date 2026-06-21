/**
 * Gestão Administrativa — Cadastros Gerais do correspondente.
 * Centraliza bancos, imobiliárias, produtos, equipe e parâmetros operacionais.
 * TODO: integrar com Supabase — tabelas de configuração por correspondente.
 */
import {
  Banknote, Building2, Briefcase, ChevronRight,
  Database, Package, Settings, Users2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PanelHeader } from "@/components/dashboards/primitives";
import { bancos, usuarios } from "@/lib/operacional/mock-data";

const cards = [
  {
    title: "Bancos Parceiros",
    description: "Configure os bancos parceiros, taxas, prazos e produtos disponíveis para cada instituição.",
    icon: Banknote,
    accent: "#001bbf",
    count: bancos.length,
    label: "bancos ativos",
    to: "/correspondente/configuracoes",
  },
  {
    title: "Imobiliárias e Parceiros",
    description: "Imobiliárias, construtoras e parceiros comerciais vinculados ao correspondente.",
    icon: Building2,
    accent: "#0a8fdc",
    count: 3,
    label: "imobiliárias ativas",
    to: "/correspondente/configuracoes",
  },
  {
    title: "Produtos Financeiros",
    description: "Financiamento Imobiliário e Home Equity: prazos, LTV, FGTS e regras por produto.",
    icon: Package,
    accent: "#7a7af1",
    count: 2,
    label: "produtos configurados",
    to: "/correspondente/configuracoes",
  },
  {
    title: "Equipe Interna",
    description: "Analistas, backoffice, financeiro e comercial. Responsáveis padrão por etapa.",
    icon: Briefcase,
    accent: "#00b35a",
    count: usuarios.filter((u) => u.papel === "analista" || u.papel === "backoffice").length,
    label: "colaboradores ativos",
    to: "/correspondente/configuracoes",
  },
  {
    title: "Usuários e Permissões",
    description: "Controle de acesso por módulo e ação. Perfis, grupos e auditoria de alterações.",
    icon: Users2,
    accent: "#ff8a00",
    count: usuarios.length,
    label: "usuários no sistema",
    to: "/correspondente/configuracoes",
  },
  {
    title: "Parâmetros do Sistema",
    description: "Preferências visuais, SLAs padrão, notificações, portal do cliente e segurança.",
    icon: Settings,
    accent: "#e02323",
    count: undefined,
    label: "configurações gerais",
    to: "/correspondente/configuracoes",
  },
];

export function GestaoAdministrativa() {
  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="GESTÃO ADMINISTRATIVA"
        title="Cadastros Gerais"
        subtitle="Gerencie todos os parâmetros do ecossistema do correspondente: bancos, imobiliárias, produtos, equipe, usuários e configurações operacionais."
        right={
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            Administração
          </span>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Bancos ativos", value: bancos.length, accent: "#001bbf" },
          { label: "Imobiliárias", value: 3, accent: "#0a8fdc" },
          { label: "Usuários", value: usuarios.length, accent: "#00b35a" },
          { label: "Produtos", value: 2, accent: "#7a7af1" },
        ].map((k) => (
          <div
            key={k.label}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="h-1 w-full" style={{ backgroundColor: k.accent }} />
            <div className="p-4">
              <p className="text-2xl font-bold text-graphite">{k.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cards de módulos */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.to as "/correspondente/configuracoes"}
              className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className="grid h-10 w-10 place-items-center rounded-lg"
                  style={{ backgroundColor: `${c.accent}18`, color: c.accent }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                {c.count !== undefined && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: `${c.accent}18`, color: c.accent }}
                  >
                    {c.count} {c.label}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-graphite group-hover:text-brand transition-colors">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-brand">
                Acessar configurações
                <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Atividade recente */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-bold text-graphite">Últimas alterações administrativas</h2>
        <ul className="divide-y divide-border text-xs">
          {[
            { who: "Marcos Andrade", what: "Banco Inter adicionado como parceiro", when: "Hoje · 10:15" },
            { who: "Marcos Andrade", what: "SLA padrão alterado de 3 para 5 dias", when: "Ontem · 16:42" },
            { who: "Ana Beatriz Lima", what: "Rafael Torres inativado", when: "16/06 · 09:30" },
            { who: "Marcos Andrade", what: "Imob. Verde adicionada", when: "14/06 · 14:22" },
            { who: "Marcos Andrade", what: "Produto Home Equity habilitado para Santander", when: "12/06 · 11:00" },
          ].map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <div className="h-2 w-2 shrink-0 rounded-full bg-brand/40" />
              <span className="font-semibold text-graphite">{a.who}</span>
              <span className="text-muted-foreground">{a.what}</span>
              <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{a.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
