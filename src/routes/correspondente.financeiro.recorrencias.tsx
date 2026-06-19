import { createFileRoute } from "@tanstack/react-router";
import { RecorrenciasView } from "@/components/financeiro/recorrencias-view";
export const Route = createFileRoute("/correspondente/financeiro/recorrencias")({ component: () => <RecorrenciasView escopo="correspondente" /> });
