import { createFileRoute } from "@tanstack/react-router";
import { CrmConsultas } from "@/components/crm/crm-consultas";

export const Route = createFileRoute("/corretor/crm/consultas")({
  component: () => <CrmConsultas scope="corretor" />,
});
