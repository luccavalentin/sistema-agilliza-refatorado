import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, FileSearch } from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Visão Geral",
    items: [
      { label: "Painel de Monitoramento", to: "/cliente", icon: LayoutDashboard },
      { label: "Acompanhar Minha Proposta", icon: FileSearch },
    ],
  },
];

export const Route = createFileRoute("/cliente")({
  head: () => ({
    meta: [{ title: "Cliente — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="cliente" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
