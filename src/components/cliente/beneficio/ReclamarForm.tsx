"use client";

import { useState, useCallback, useEffect } from "react";
import { Ticket, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleButton from "@/components/cliente/shared/GoogleButton";
import QRDisplay from "@/components/cliente/beneficio/QRDisplay";

const STORAGE_KEY_PREFIX = "reclamo_anonimo_";

export default function ReclamarForm({ beneficioId }: { beneficioId: string }) {
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
  const [checkingRequirement, setCheckingRequirement] = useState(true);
  const [requiresNombre, setRequiresNombre] = useState(true);
  const [showGuestAccess, setShowGuestAccess] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [canjeado, setCanjeado] = useState(false);

  const handleRedeemed = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // sessionStorage no disponible
    }
    setCanjeado(true);
  }, [storageKey]);

  useEffect(() => {
    let active = true;

    const checkRequirement = async () => {
      if (reclamoId) {
        if (active) {
          setCheckingRequirement(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/reclamos/anonimo?beneficioId=${beneficioId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!active) return;

        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "No pudimos iniciar el canje.");
          setRequiresNombre(true);
          return;
        }

        setRequiresNombre(Boolean(data.requiresNombre));
      } catch {
        if (!active) return;
        setError("No pudimos iniciar el canje.");
        setRequiresNombre(true);
      } finally {
        if (active) {
          setCheckingRequirement(false);
        }
      }
    };

    checkRequirement();

    return () => {
      active = false;
    };
  }, [beneficioId, reclamoId]);

  async function handleObtenerQR() {
    const normalizedNombre = nombre.trim().replace(/\s+/g, " ");

    if (requiresNombre && !normalizedNombre) {
      setError("Ingresá tu nombre para continuar.");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await fetch("/api/reclamos/anonimo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beneficioId,
        nombre: requiresNombre ? normalizedNombre : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data?.code === "NOMBRE_REQUIRED") {
        setRequiresNombre(true);
      }
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

  if (canjeado) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-default/70 bg-surface/80 px-6 py-10 text-center lg:px-5 lg:py-9 2xl:px-6 2xl:py-10">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary lg:text-[13px] 2xl:text-sm">
            ¡Beneficio canjeado!
          </p>
          <p className="text-xs text-text-muted lg:text-[11px] 2xl:text-xs">
            El local registró el canje exitosamente.
          </p>
        </div>
      </div>
    );
  }

  if (reclamoId) {
    return <QRDisplay reclamoId={reclamoId} onRedeemed={handleRedeemed} />;
  }

  return (
    <div className="space-y-4 lg:space-y-3.5 2xl:space-y-4">
      <div className="rounded-2xl border border-primary/20 bg-primary-soft/35 px-4 py-3 text-sm text-text-secondary lg:text-[13px] 2xl:text-sm">
        Te recomendamos ingresar con Google para guardar tus cupones y ver tu historial en una cuenta.
      </div>

      <GoogleButton beneficioId={beneficioId} redirect="/mis-beneficios" />

      <div className="pt-1">
        {!showGuestAccess ? (
          <button
            type="button"
            onClick={() => setShowGuestAccess(true)}
            className="text-xs text-text-muted underline-offset-2 transition-colors hover:text-text-secondary hover:underline"
          >
            Continuar como invitado
          </button>
        ) : checkingRequirement ? (
          <p className="text-sm text-text-muted lg:text-[13px] 2xl:text-sm">Preparando tu canje...</p>
        ) : (
          <div className="space-y-3 rounded-2xl border border-border-default/70 bg-surface-muted/50 p-4 lg:p-3.5 2xl:p-4">
            <p className="text-sm text-text-muted lg:text-[13px] 2xl:text-sm">
              {requiresNombre
                ? "Ingresá tu nombre para generar el QR y presentarlo en el local."
                : "Generá tu QR personal para presentarlo en el local y canjear tu beneficio."}
            </p>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            {requiresNombre ? (
              <Input
                label="Tu nombre"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                autoComplete="name"
                autoCapitalize="words"
                required
              />
            ) : null}

            <Button
              type="button"
              className="w-full"
              size="lg"
              loading={loading}
              onClick={handleObtenerQR}
            >
              <Ticket className="mr-2 h-4 w-4" aria-hidden="true" />
              Obtener QR
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
