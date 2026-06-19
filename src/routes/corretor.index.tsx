import { createFileRoute } from "@tanstack/react-router";
import { OverviewPlaceholder } from "@/components/overview-placeholder";

export const Route = createFileRoute("/corretor/")({
  component: () => (
    <OverviewPlaceholder
      kind="corretor"
      title="Visão Geral"
      subtitle="Acompanhamento comercial, carteira de clientes e desempenho operacional."
    />
  ),
});
