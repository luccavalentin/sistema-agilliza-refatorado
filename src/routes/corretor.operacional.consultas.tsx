import { createFileRoute } from "@tanstack/react-router";
import { ConsultasOperacionais } from "@/components/operacional/consultas-operacionais";

export const Route = createFileRoute("/corretor/operacional/consultas")({
  component: () => <ConsultasOperacionais escopo="corretor" />,
});
