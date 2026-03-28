"use client";
import { QrCode } from "lucide-react";
import LinkButton from "./ui/LinkButton";

export default function DashboardActions() {
  return (
    <LinkButton href="/dashboard/escanear" variant="light" size="sm">
      <QrCode className="h-4 w-4" aria-hidden="true" />
      Escanear QR
    </LinkButton>
  );
}
