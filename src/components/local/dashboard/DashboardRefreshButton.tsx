"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function DashboardRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      aria-label="Actualizar cupones"
      title="Actualizar cupones"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
      <span className="sr-only">Actualizar cupones</span>
    </Button>
  );
}
