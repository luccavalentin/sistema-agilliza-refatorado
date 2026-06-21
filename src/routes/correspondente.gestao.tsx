import { createFileRoute } from "@tanstack/react-router";
import { GestaoAdministrativa } from "@/components/gestao/gestao-administrativa";

export const Route = createFileRoute("/correspondente/gestao")({
  head: () => ({ meta: [{ title: "Cadastros Gerais — Gestão Administrativa" }] }),
  component: GestaoAdministrativa,
});
