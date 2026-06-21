import { createFileRoute } from "@tanstack/react-router";
import { BackupModule } from "@/components/backup/backup-module";

export const Route = createFileRoute("/corretor/backup")({
  head: () => ({ meta: [{ title: "Backup do Sistema — Corretor" }] }),
  component: () => <BackupModule />,
});
