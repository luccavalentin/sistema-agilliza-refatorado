import { createFileRoute } from "@tanstack/react-router";
import { CrmCadastro } from "@/components/crm/crm-cadastro";

export const Route = createFileRoute("/corretor/crm/cadastro")({
  component: () => <CrmCadastro scope="corretor" />,
});
