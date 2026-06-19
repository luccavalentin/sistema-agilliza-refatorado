import { createFileRoute } from "@tanstack/react-router";
import { ConsultasOperacionais } from "@/components/operacional/consultas-operacionais";

export const Route = createFileRoute("/correspondente/operacional/consultas")({
  component: () => <ConsultasOperacionais escopo="correspondente" />,
});
