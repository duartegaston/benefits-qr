"use client";
import { useEffect, useState, useCallback, useRef } from "react";

interface QRDisplayProps {
  reclamoId: string;
}

export default function QRDisplay({ reclamoId }: QRDisplayProps) {
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateQR = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reclamos/${reclamoId}/qr`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.qrDataURL) {
        setQrDataURL(data.qrDataURL);
        setSecondsLeft(120);
      }
    } finally {
      setLoading(false);
    }
  }, [reclamoId]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  useEffect(() => {
    if (!qrDataURL) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          generateQR();
          return 120;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrDataURL, generateQR]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 20;

  if (loading && !qrDataURL) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div role="status" aria-label="Cargando código QR">
          <div aria-hidden="true" className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {qrDataURL && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataURL} alt="QR Code" className="w-full max-w-[256px] aspect-square rounded-xl" />
      )}
      <div
        className={`text-2xl font-mono font-bold tabular-nums ${
          isUrgent ? "text-red-500" : "text-gray-700"
        }`}
      >
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
      <p className="text-xs text-gray-400 text-center">
        El QR se renueva automáticamente al expirar
      </p>
    </div>
  );
}
