import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosGerenciais } from "@/components/financeiro/relatorios-gerenciais";
export const Route = createFileRoute("/corretor/financeiro/relatorios")({ component: () => <RelatoriosGerenciais escopo="corretor" /> });
