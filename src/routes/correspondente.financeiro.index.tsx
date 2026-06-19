import { createFileRoute } from "@tanstack/react-router";
import { PainelFinanceiro } from "@/components/financeiro/painel-financeiro";
export const Route = createFileRoute("/correspondente/financeiro/")({ component: () => <PainelFinanceiro escopo="correspondente" /> });
