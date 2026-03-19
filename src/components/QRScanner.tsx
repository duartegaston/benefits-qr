"use client";
import { useEffect, useRef } from "react";

const SCANNER_CONFIG = { fps: 10, qrbox: { width: 250, height: 250 } } as const;

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (!mountedRef.current) return;

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        SCANNER_CONFIG,
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // ignore scan errors (frequent during scanning)
        }
      );

      scannerRef.current = scanner;
    });

    return () => {
      mountedRef.current = false;
      scannerRef.current?.clear().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div id="qr-reader" className="w-full" />
    </div>
  );
}
