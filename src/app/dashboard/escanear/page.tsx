"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  ),
});

type ScanState = "scanning" | "confirming" | "success" | "error";

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
    <main className="min-h-screen p-4 sm:p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Escanear QR</h1>
      </div>

      <Card className="p-6">
        {state === "scanning" && (
          <div>
            <p className="text-gray-500 text-sm mb-4 text-center">
              Apuntá la cámara al código QR del cliente
            </p>
            <QRScanner onScan={handleScan} />
          </div>
        )}

        {state === "confirming" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              QR detectado
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              ¿Confirmás el canje de este cupón?
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Canje exitoso!
            </h2>
            <Button onClick={reset} className="mt-4">
              Escanear otro
            </Button>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-red-500 text-sm mb-4">{message}</p>
            <Button onClick={reset}>Intentar de nuevo</Button>
          </div>
        )}
      </Card>
    </main>
  );
}
