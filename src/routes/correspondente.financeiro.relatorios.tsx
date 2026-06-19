import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosGerenciais } from "@/components/financeiro/relatorios-gerenciais";
export const Route = createFileRoute("/correspondente/financeiro/relatorios")({ component: () => <RelatoriosGerenciais escopo="correspondente" /> });
