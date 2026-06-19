import { createFileRoute } from "@tanstack/react-router";
import { LancamentosLista } from "@/components/financeiro/lancamentos-lista";
export const Route = createFileRoute("/correspondente/financeiro/pagar")({ component: () => <LancamentosLista tipo="pagar" escopo="correspondente" /> });
