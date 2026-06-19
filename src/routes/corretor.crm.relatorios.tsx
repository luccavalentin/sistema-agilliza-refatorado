import { createFileRoute } from "@tanstack/react-router";
import { CrmRelatorios } from "@/components/crm/crm-relatorios";

export const Route = createFileRoute("/corretor/crm/relatorios")({
  component: () => <CrmRelatorios scope="corretor" />,
});
