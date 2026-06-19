import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  BarChart3,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/portal-shell";

const items: PortalNavItem[] = [
  { label: "Visão Geral", to: "/corretor", icon: LayoutDashboard },
  { label: "CRM e Gestão de Clientes", icon: Users },
  { label: "Operacional", icon: Briefcase },
  { label: "Gestão Financeira", icon: Wallet },
  { label: "Relatórios e Dashboards", icon: BarChart3 },
];

export const Route = createFileRoute("/corretor")({
  head: () => ({
    meta: [{ title: "Corretor — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="corretor" items={items}>
      <Outlet />
    </PortalShell>
  ),
});
