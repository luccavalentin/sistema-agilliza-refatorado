import { createFileRoute } from "@tanstack/react-router";
import { LancamentosLista } from "@/components/financeiro/lancamentos-lista";
export const Route = createFileRoute("/corretor/financeiro/recebiveis")({ component: () => <LancamentosLista tipo="receber" escopo="corretor" /> });
