import { createFileRoute } from "@tanstack/react-router";
import { CrmRelatorios } from "@/components/crm/crm-relatorios";

export const Route = createFileRoute("/correspondente/crm/relatorios")({
  component: () => <CrmRelatorios scope="correspondente" />,
});
