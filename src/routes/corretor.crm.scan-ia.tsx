import { createFileRoute } from "@tanstack/react-router";
import { ScanIaView } from "@/components/crm/scan-ia";

export const Route = createFileRoute("/corretor/crm/scan-ia")({
  head: () => ({ meta: [{ title: "Scan IA — CRM Corretor" }] }),
  component: () => <ScanIaView scope="corretor" />,
});
