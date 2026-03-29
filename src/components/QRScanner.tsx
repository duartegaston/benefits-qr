"use client";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const hasStartedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2, 10)}`);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

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
      } catch {
        // camera permission denied or unavailable
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
