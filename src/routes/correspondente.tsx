import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  Settings2,
} from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/portal-shell";

const items: PortalNavItem[] = [
  { label: "Visão Geral", to: "/correspondente", icon: LayoutDashboard },
  { label: "CRM e Gestão de Cliente", icon: Users },
  { label: "Operacional", icon: Briefcase },
  { label: "Gestão Financeira", icon: Wallet },
  { label: "Gestão Administrativa", icon: Settings2 },
];

export const Route = createFileRoute("/correspondente")({
  head: () => ({
    meta: [{ title: "Correspondente — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="correspondente" items={items}>
      <Outlet />
    </PortalShell>
  ),
});
