import { createFileRoute } from "@tanstack/react-router";
import { OverviewPlaceholder } from "@/components/overview-placeholder";

export const Route = createFileRoute("/correspondente/")({
  component: () => (
    <OverviewPlaceholder
      kind="correspondente"
      title="Visão Geral"
      subtitle="Painel administrativo do ecossistema. Indicadores e operações consolidadas do correspondente."
    />
  ),
});
