import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/corretor/financeiro")({ component: () => <Outlet /> });
