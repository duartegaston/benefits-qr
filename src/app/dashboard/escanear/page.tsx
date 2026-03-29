"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleAlert, QrCode, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  ),
});

type ScanState = "scanning" | "confirming" | "success" | "error";

type StatusState = Exclude<ScanState, "scanning">;

const STATUS_CONFIG: Record<
  StatusState,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    iconBgClassName: string;
    iconClassName: string;
  }
> = {
  confirming: {
    title: "QR detectado",
    description: "¿Confirmás el canje de este cupón?",
    icon: CircleAlert,
    iconBgClassName: "bg-violet-100",
    iconClassName: "text-violet-600",
  },
  success: {
    title: "¡Canje exitoso!",
    description: "El cupón se canjeó correctamente.",
    icon: CheckCircle2,
    iconBgClassName: "bg-green-100",
    iconClassName: "text-green-600",
  },
  error: {
    title: "Error",
    description: "No se pudo completar el canje.",
    icon: XCircle,
    iconBgClassName: "bg-red-100",
    iconClassName: "text-red-600",
  },
};

export default function EscanearPage() {
  const [state, setState] = useState<ScanState>("scanning");
  const [message, setMessage] = useState("");
  const [scannedData, setScannedData] = useState<{
    reclamoId: string;
    qrToken: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleScan(data: string) {
    if (state !== "scanning") return;

    try {
      const parsed = JSON.parse(data);
      if (parsed.reclamoId && parsed.qrToken) {
        setScannedData(parsed);
        setState("confirming");
      }
    } catch {
      setMessage("QR inválido");
      setState("error");
    }
  }

  async function handleCanjear() {
    if (!scannedData) return;
    setLoading(true);

    const res = await fetch(`/api/reclamos/${scannedData.reclamoId}/canjear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: scannedData.qrToken }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setState("success");
    } else {
      setState("error");
      setMessage(data.error || "Error al canjear");
    }
  }

  function reset() {
    setState("scanning");
    setMessage("");
    setScannedData(null);
  }

  return (
    <main className="mx-auto max-w-xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8">
      <SectionHeader
        eyebrow="Escanear cupón"
        title="Escanear QR"
        description="Escaneá el código del cliente para confirmar el canje del cupón."
        align="left"
        className="mb-6 sm:mb-8"
      />

      <Card className="p-6">
        {state === "scanning" && (
          <div className="space-y-4">
            <p className="flex items-center justify-center gap-2 text-center text-sm text-gray-500">
              <QrCode className="h-4 w-4 text-violet-600" aria-hidden="true" />
              Apuntá la cámara al código QR del cliente
            </p>
            <QRScanner onScan={handleScan} />
          </div>
        )}

        {state === "confirming" && (
          <div className="text-center py-8">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                STATUS_CONFIG.confirming.iconBgClassName
              }`}
            >
              <STATUS_CONFIG.confirming.icon
                className={`h-8 w-8 ${STATUS_CONFIG.confirming.iconClassName}`}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {STATUS_CONFIG.confirming.title}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {STATUS_CONFIG.confirming.description}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={reset}>
                Cancelar
              </Button>
              <Button onClick={handleCanjear} loading={loading}>
                Confirmar canje
              </Button>
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="text-center py-8">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                STATUS_CONFIG.success.iconBgClassName
              }`}
            >
              <STATUS_CONFIG.success.icon
                className={`h-8 w-8 ${STATUS_CONFIG.success.iconClassName}`}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {STATUS_CONFIG.success.title}
            </h2>
            <p className="text-gray-500 text-sm mb-4">{STATUS_CONFIG.success.description}</p>
            <Button onClick={reset} className="mt-4">
              Escanear otro
            </Button>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-8">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                STATUS_CONFIG.error.iconBgClassName
              }`}
            >
              <STATUS_CONFIG.error.icon
                className={`h-8 w-8 ${STATUS_CONFIG.error.iconClassName}`}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{STATUS_CONFIG.error.title}</h2>
            <p className="text-gray-500 text-sm mb-2">{STATUS_CONFIG.error.description}</p>
            <p className="text-red-500 text-sm mb-4">{message}</p>
            <Button onClick={reset}>Intentar de nuevo</Button>
          </div>
        )}
      </Card>
    </main>
  );
}
