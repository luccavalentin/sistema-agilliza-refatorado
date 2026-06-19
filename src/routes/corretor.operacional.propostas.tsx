import { createFileRoute } from "@tanstack/react-router";
import { PropostasKanban } from "@/components/operacional/propostas-kanban";

export const Route = createFileRoute("/corretor/operacional/propostas")({
  component: () => <PropostasKanban escopo="corretor" />,
});
