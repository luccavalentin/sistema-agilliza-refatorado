import { createFileRoute } from "@tanstack/react-router";
import { RecorrenciasView } from "@/components/financeiro/recorrencias-view";
export const Route = createFileRoute("/corretor/financeiro/recorrencias")({ component: () => <RecorrenciasView escopo="corretor" /> });
