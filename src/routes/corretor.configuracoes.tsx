import { createFileRoute } from "@tanstack/react-router";
import { ConfiguracoesCorretor } from "@/components/configuracoes/configuracoes-corretor";

export const Route = createFileRoute("/corretor/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Corretor" }] }),
  component: () => <ConfiguracoesCorretor />,
});
