import { createFileRoute } from "@tanstack/react-router";
import { MinhasSimulacoes } from "@/components/operacional/minhas-simulacoes";

export const Route = createFileRoute("/correspondente/operacional/minhas-simulacoes")({
  component: () => <MinhasSimulacoes escopo="correspondente" />,
});
