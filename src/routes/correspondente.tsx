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
  Wallet,
  Banknote,
  TrendingUp,
  RefreshCw,
  Layers,
  CheckSquare,
  Settings,
  BrainCircuit,
  ScanLine,
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
      { label: "Scan IA", to: "/correspondente/crm/scan-ia", icon: ScanLine },
      { label: "Flash IA", to: "/correspondente/crm/flash-ia", icon: BrainCircuit },
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
      { label: "Demandas & SLA", to: "/correspondente/operacional/demandas", icon: Clock },
      { label: "Minhas Tarefas", to: "/correspondente/operacional/tarefas", icon: ListChecks },
      { label: "Relatórios e Métricas Operacionais", to: "/correspondente/operacional/relatorios", icon: BarChart3 },
    ],
  },
  {
    label: "Gestão Financeira",
    items: [
      { label: "Painel Financeiro", to: "/correspondente/financeiro", icon: Wallet },
      { label: "Contas a Receber", to: "/correspondente/financeiro/receber", icon: ArrowDownCircle },
      { label: "Contas a Pagar", to: "/correspondente/financeiro/pagar", icon: ArrowUpCircle },
      { label: "Comissões", to: "/correspondente/financeiro/comissoes", icon: Banknote },
      { label: "Fluxo de Caixa", to: "/correspondente/financeiro/fluxo", icon: TrendingUp },
      { label: "Conciliação", to: "/correspondente/financeiro/conciliacao", icon: CheckSquare },
      { label: "Recorrências", to: "/correspondente/financeiro/recorrencias", icon: RefreshCw },
      { label: "Categorias Financeiras", to: "/correspondente/financeiro/categorias", icon: Layers },
      { label: "Relatórios Financeiros e Métricas Operacionais", to: "/correspondente/financeiro/relatorios", icon: FileBarChart },
    ],
  },
  {
    label: "Gestão Administrativa",
    items: [{ label: "Cadastros Gerais", to: "/correspondente/gestao", icon: Database }],
  },
  {
    label: "Configurações",
    items: [
      { label: "Configurações", to: "/correspondente/configuracoes", icon: Settings },
    ],
  },
  {
    label: "Backup",
    items: [
      { label: "Backup do Sistema", to: "/correspondente/backup", icon: Database },
    ],
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
