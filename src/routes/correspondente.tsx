import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  Zap,
  Users,
  Activity,
  Search,
  Calculator,
  CheckCircle2,
  Clock,
  
  ListChecks,
  BarChart3,
  ArrowDownCircle,
  ArrowUpCircle,
  FileBarChart,
  Database,
} from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Visão Geral",
    items: [
      { label: "Painel de Monitoramento", to: "/correspondente", icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM e Gestão de Cliente",
    items: [
      { label: "Scan IA", icon: Sparkles },
      { label: "Flash IA", icon: Zap },
      {
        label: "CRM de Clientes",
        icon: Users,
        children: [
          { label: "Dashboard de Clientes", to: "/correspondente/crm", icon: LayoutDashboard },
          { label: "Cadastro de Cliente", to: "/correspondente/crm/cadastro", icon: Users },
          { label: "Consultas", to: "/correspondente/crm/consultas", icon: Search },
          { label: "Relatórios", to: "/correspondente/crm/relatorios", icon: BarChart3 },
        ],
      },
    ],
  },
  {
    label: "Operacional",
    items: [
      { label: "Painel", to: "/correspondente/operacional", icon: Activity },
      { label: "Consultas", to: "/correspondente/operacional/consultas", icon: Search },
      { label: "Simulações", to: "/correspondente/operacional/simulacoes", icon: Calculator },
      { label: "Minhas Simulações", to: "/correspondente/operacional/minhas-simulacoes", icon: Sparkles },
      { label: "Propostas", to: "/correspondente/operacional/propostas", icon: CheckCircle2 },
      { label: "Demandas & SLA", icon: Clock },
      { label: "Minhas Tarefas", icon: ListChecks },
      { label: "Relatórios e Métricas Operacionais", icon: BarChart3 },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Contas a Pagar", icon: ArrowUpCircle },
      { label: "Contas a Receber", icon: ArrowDownCircle },
      { label: "Relatórios Financeiros e Métricas", icon: FileBarChart },
    ],
  },
  {
    label: "Gestão Administrativa",
    items: [{ label: "Cadastros Gerais", icon: Database }],
  },
];

export const Route = createFileRoute("/correspondente")({
  head: () => ({
    meta: [{ title: "Correspondente — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="correspondente" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
