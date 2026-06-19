import { createFileRoute } from "@tanstack/react-router";
import { CorretorDashboard } from "@/components/dashboards/corretor-dashboard";

export const Route = createFileRoute("/corretor/")({
  component: CorretorDashboard,
});
