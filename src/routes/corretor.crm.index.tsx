import { createFileRoute } from "@tanstack/react-router";
import { CrmDashboard } from "@/components/crm/crm-dashboard";

export const Route = createFileRoute("/corretor/crm/")({
  component: () => <CrmDashboard scope="corretor" />,
});
