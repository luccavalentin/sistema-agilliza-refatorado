import { createFileRoute } from "@tanstack/react-router";
import { AtualizacaoProposta } from "@/components/operacional/atualizacao-proposta";

export const Route = createFileRoute("/corretor/operacional/atualizacao")({
  head: () => ({ meta: [{ title: "Atualização de Proposta — Corretor" }] }),
  component: AtualizacaoProposta,
});
