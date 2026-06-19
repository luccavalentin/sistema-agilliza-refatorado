import { createFileRoute } from "@tanstack/react-router";
import { ConfiguracoesCorrespondente } from "@/components/configuracoes/configuracoes-correspondente";

export const Route = createFileRoute("/correspondente/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Correspondente" }] }),
  component: () => <ConfiguracoesCorrespondente />,
});
