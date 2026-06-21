import { createFileRoute } from "@tanstack/react-router";
import { FlashIaView } from "@/components/crm/flash-ia";

export const Route = createFileRoute("/corretor/crm/flash-ia")({
  head: () => ({ meta: [{ title: "Flash IA — CRM Corretor" }] }),
  component: () => <FlashIaView scope="corretor" />,
});
