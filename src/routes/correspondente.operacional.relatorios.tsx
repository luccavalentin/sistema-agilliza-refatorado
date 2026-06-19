import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosOperacionais } from "@/components/operacional/relatorios-operacionais";

export const Route = createFileRoute("/correspondente/operacional/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios Operacionais — Correspondente" }] }),
  component: () => <RelatoriosOperacionais escopo="correspondente" />,
});
