"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import Button from "./ui/Button";
import LinkButton from "./ui/LinkButton";

export default function DashboardActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={handleLogout}
        variant="subtle"
        size="sm"
        className="fixed top-5 left-5 sm:top-6 sm:left-6 z-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Salir
      </Button>
      <LinkButton href="/dashboard/escanear" variant="light" size="sm">
        <QrCode className="h-4 w-4" aria-hidden="true" />
        Escanear QR
      </LinkButton>
    </>
  );
}
