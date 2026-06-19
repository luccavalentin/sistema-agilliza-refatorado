import { createFileRoute } from "@tanstack/react-router";
import { SimulacaoWizard } from "@/components/operacional/simulacao-wizard";

export const Route = createFileRoute("/corretor/operacional/simulacoes")({
  component: () => <SimulacaoWizard escopo="corretor" />,
});
