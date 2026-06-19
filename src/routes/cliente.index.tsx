import { createFileRoute } from "@tanstack/react-router";
import { ClienteDashboard } from "@/components/dashboards/cliente-dashboard";

export const Route = createFileRoute("/cliente/")({
  component: ClienteDashboard,
});
