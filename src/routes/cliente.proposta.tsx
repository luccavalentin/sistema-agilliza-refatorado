import { createFileRoute } from "@tanstack/react-router";
import { ClienteAcompanhamento } from "@/components/cliente/cliente-acompanhamento";

export const Route = createFileRoute("/cliente/proposta")({
  head: () => ({ meta: [{ title: "Minha Proposta — Cliente" }] }),
  component: ClienteAcompanhamento,
});
