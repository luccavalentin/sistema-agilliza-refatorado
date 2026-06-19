import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/correspondente/operacional")({
  component: () => <Outlet />,
});
