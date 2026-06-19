import { createFileRoute } from "@tanstack/react-router";
import { OverviewPlaceholder } from "@/components/overview-placeholder";

export const Route = createFileRoute("/cliente/")({
  component: () => (
    <OverviewPlaceholder
      kind="cliente"
      title="Visão Geral"
      subtitle="Acompanhe o seu processo de crédito com segurança e clareza."
    />
  ),
});
