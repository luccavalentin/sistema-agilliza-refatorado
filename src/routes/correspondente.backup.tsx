import { createFileRoute } from "@tanstack/react-router";
import { BackupModule } from "@/components/backup/backup-module";

export const Route = createFileRoute("/correspondente/backup")({
  head: () => ({ meta: [{ title: "Backup do Sistema — Correspondente" }] }),
  component: () => <BackupModule />,
});
