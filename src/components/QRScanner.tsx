"use client";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (message: string) => void;
}

function getCameraStartErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error ?? "");
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes("permission") ||
    normalized.includes("notallowed") ||
    normalized.includes("denied")
  ) {
    return "No pudimos acceder a la cámara. Revisá los permisos del navegador e intentá de nuevo.";
  }

  if (
    normalized.includes("notfound") ||
    normalized.includes("no camera") ||
    normalized.includes("devicesnotfound")
  ) {
    return "No encontramos una cámara disponible en este dispositivo.";
  }

  return "No se pudo iniciar la cámara para escanear. Intentá nuevamente.";
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const hasStartedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2, 10)}`);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    let isCancelled = false;

    import("html5-qrcode").then(async ({ Html5Qrcode }) => {
      if (isCancelled || !containerRef.current) return;

      const scanner = new Html5Qrcode(readerIdRef.current);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScanRef.current(decodedText);
          },
          () => {
            // ignore per-frame errors
          }
        );

        if (isCancelled) {
          await scanner.stop().catch(() => {});
          return;
        }

        hasStartedRef.current = true;
      } catch (error) {
        onErrorRef.current?.(getCameraStartErrorMessage(error));
      }
    });

    return () => {
      isCancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner && hasStartedRef.current) {
        hasStartedRef.current = false;
        void scanner.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        id={readerIdRef.current}
        className="w-full rounded-xl overflow-hidden"
      />
    </div>
  );
}
