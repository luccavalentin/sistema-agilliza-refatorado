import { createFileRoute } from "@tanstack/react-router";
import { CorrespondenteDashboard } from "@/components/dashboards/correspondente-dashboard";

export const Route = createFileRoute("/correspondente/")({
  component: CorrespondenteDashboard,
});
