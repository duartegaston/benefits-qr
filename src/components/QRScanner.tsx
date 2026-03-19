"use client";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const mountedRef = useRef(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    mountedRef.current = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!mountedRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScanRef.current(decodedText);
          },
          () => {
            // ignore per-frame errors
          }
        )
        .catch(() => {
          // camera permission denied or unavailable
        });

      scannerRef.current = scanner;
    });

    return () => {
      mountedRef.current = false;
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="w-full">
      <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
    </div>
  );
}
