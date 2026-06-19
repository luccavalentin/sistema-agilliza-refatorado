import { createFileRoute } from "@tanstack/react-router";
import { PainelFinanceiro } from "@/components/financeiro/painel-financeiro";
export const Route = createFileRoute("/corretor/financeiro/")({ component: () => <PainelFinanceiro escopo="corretor" /> });
