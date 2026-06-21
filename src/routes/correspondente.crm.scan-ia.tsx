import { createFileRoute } from "@tanstack/react-router";
import { ScanIaView } from "@/components/crm/scan-ia";

export const Route = createFileRoute("/correspondente/crm/scan-ia")({
  head: () => ({ meta: [{ title: "Scan IA — CRM" }] }),
  component: () => <ScanIaView scope="correspondente" />,
});
