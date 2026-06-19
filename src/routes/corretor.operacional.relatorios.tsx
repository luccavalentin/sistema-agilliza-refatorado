import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosOperacionais } from "@/components/operacional/relatorios-operacionais";

export const Route = createFileRoute("/corretor/operacional/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios Operacionais — Corretor" }] }),
  component: () => <RelatoriosOperacionais escopo="corretor" />,
});
