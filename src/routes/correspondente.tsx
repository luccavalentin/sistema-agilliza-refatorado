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
  Kanban,
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
      { label: "CRM de Clientes", icon: Users },
    ],
  },
  {
    label: "Operacional",
    items: [
      { label: "Painel", icon: Activity },
      { label: "Consultas", icon: Search },
      { label: "Simulações", icon: Calculator },
      { label: "Aprovações", icon: CheckCircle2 },
      { label: "Demandas & SLA", icon: Clock },
      { label: "Backlog (Kanban)", icon: Kanban },
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
