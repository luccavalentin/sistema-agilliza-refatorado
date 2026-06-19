import { createFileRoute } from "@tanstack/react-router";
import { PainelOperacional } from "@/components/operacional/painel-operacional";

export const Route = createFileRoute("/correspondente/operacional/")({
  component: () => <PainelOperacional escopo="correspondente" />,
});
