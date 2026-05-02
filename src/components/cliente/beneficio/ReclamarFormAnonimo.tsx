"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import Button from "@/components/ui/Button";
import QRDisplay from "@/components/cliente/beneficio/QRDisplay";

const STORAGE_KEY_PREFIX = "reclamo_anonimo_";

export default function ReclamarFormAnonimo({ beneficioId }: { beneficioId: string }) {
  const storageKey = `${STORAGE_KEY_PREFIX}${beneficioId}`;
  const [reclamoId, setReclamoId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return sessionStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleObtenerQR() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/reclamos/anonimo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beneficioId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    try {
      sessionStorage.setItem(storageKey, data.reclamoId);
    } catch {
      // sessionStorage no disponible
    }

    setReclamoId(data.reclamoId);
  }

  if (reclamoId) {
    return <QRDisplay reclamoId={reclamoId} />;
  }

  return (
    <div className="space-y-4 lg:space-y-3.5 2xl:space-y-4">
      <p className="text-sm text-text-muted lg:text-[13px] 2xl:text-sm">
        Generá tu QR personal para presentarlo en el local y canjear tu beneficio.
      </p>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button
        type="button"
        className="w-full"
        loading={loading}
        onClick={handleObtenerQR}
      >
        <Ticket className="mr-2 h-4 w-4" aria-hidden="true" />
        Obtener QR
      </Button>
    </div>
  );
}
