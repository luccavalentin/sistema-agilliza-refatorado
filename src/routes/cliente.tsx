import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PortalShell, type PortalNavItem } from "@/components/portal-shell";

const items: PortalNavItem[] = [
  { label: "Visão Geral", to: "/cliente", icon: LayoutDashboard },
];

export const Route = createFileRoute("/cliente")({
  head: () => ({
    meta: [{ title: "Cliente — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="cliente" items={items}>
      <Outlet />
    </PortalShell>
  ),
});
