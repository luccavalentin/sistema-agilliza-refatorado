import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calculator,
  CheckCircle2,
  Clock,
  ListChecks,
  RefreshCw,
  BarChart3,
  Wallet,
  PieChart,
  Settings,
  Search,
} from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Visão Geral",
    items: [
      { label: "Painel de Monitoramento", to: "/corretor", icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM e Gestão de Cliente",
    items: [
      {
        label: "CRM de Clientes",
        icon: Users,
        children: [
          { label: "Dashboard de Clientes", to: "/corretor/crm", icon: LayoutDashboard },
          { label: "Cadastro de Cliente", to: "/corretor/crm/cadastro", icon: Users },
          { label: "Consultas", to: "/corretor/crm/consultas", icon: Search },
          { label: "Relatórios", to: "/corretor/crm/relatorios", icon: PieChart },
        ],
      },
    ],
  },
  {
    label: "Operacional",
    items: [
      { label: "Simulações", icon: Calculator },
      { label: "Aprovação", icon: CheckCircle2 },
      { label: "Demandas & SLA", icon: Clock },
      { label: "Minhas Tarefas", icon: ListChecks },
      { label: "Atualizar Status de Proposta", icon: RefreshCw },
      { label: "Relatórios e Métricas Operacionais", icon: BarChart3 },
    ],
  },
  {
    label: "Financeiro Pessoal",
    items: [{ label: "Contas a Pagar e Receber", icon: Wallet }],
  },
  {
    label: "Relatórios e Dashboards",
    items: [{ label: "Relatórios Completos", icon: PieChart }],
  },
  {
    label: "Configurações",
    items: [{ label: "Configurações", icon: Settings }],
  },
];

export const Route = createFileRoute("/corretor")({
  head: () => ({
    meta: [{ title: "Corretor — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="corretor" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
