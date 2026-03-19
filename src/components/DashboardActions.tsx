"use client";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";

export default function DashboardActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/escanear")}
      >
        Escanear QR
      </Button>
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Salir
      </Button>
    </div>
  );
}
