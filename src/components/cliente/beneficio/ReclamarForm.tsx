"use client";

import { useState, useCallback, useEffect } from "react";
import { Ticket, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GoogleButton from "@/components/cliente/shared/GoogleButton";
import QRDisplay from "@/components/cliente/beneficio/QRDisplay";
import { DIRECT_QR_FLOW } from "@/lib/flows";

const STORAGE_KEY_PREFIX = "reclamo_anonimo_";

type ReclamarFormProps = {
  beneficioId: string;
  directFlow?: boolean;
  initialDirectRedeemed?: boolean;
  initialOrderNumber?: string | null;
  initialDirectErrorCode?: string | null;
};

function getDirectFlowErrorMessage(code: string): string {
  if (code === "BENEFICIO_EXPIRED") return "Este cupón ya expiró.";
  if (code === "BENEFICIO_MAX_USOS_REACHED") return "Este cupón ya alcanzó el máximo de usos.";
  if (code === "BENEFICIO_INVALID_DAY") return "Este cupón no se puede canjear hoy.";
  if (code === "BENEFICIO_NOT_FOUND") return "Cupón no encontrado.";
  if (code === "RECLAMO_CANCELLED") return "Este cupón ya no está disponible.";
  return "No se pudo completar el canje en este momento.";
}

export default function ReclamarForm({
  beneficioId,
  directFlow = false,
  initialDirectRedeemed = false,
  initialOrderNumber = null,
  initialDirectErrorCode = null,
}: ReclamarFormProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}${beneficioId}`;
  const [reclamoId, setReclamoId] = useState<string | null>(() => {
    if (directFlow) {
      return null;
    }

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
  const [error, setError] = useState<string | null>(
    initialDirectErrorCode ? getDirectFlowErrorMessage(initialDirectErrorCode) : null
  );
  const [canjeado, setCanjeado] = useState(initialDirectRedeemed);
  const [orderNumber, setOrderNumber] = useState<string | null>(initialOrderNumber);

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
      if (!directFlow && reclamoId) {
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
  }, [beneficioId, reclamoId, directFlow]);

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
        flow: directFlow ? DIRECT_QR_FLOW : undefined,
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

    if (directFlow) {
      setOrderNumber(typeof data.orderNumber === "string" ? data.orderNumber : null);
      setCanjeado(true);
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
            Mostrá esta confirmación en caja para validar tu canje.
          </p>
          {orderNumber ? (
            <p className="text-xs font-semibold tracking-wide text-text-primary lg:text-[11px] 2xl:text-xs">
              Nro. de orden: {orderNumber}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!directFlow && reclamoId) {
    return <QRDisplay reclamoId={reclamoId} onRedeemed={handleRedeemed} />;
  }

  return (
    <div className="space-y-4 lg:space-y-3.5 2xl:space-y-4">
      <div className="rounded-2xl border border-primary/20 bg-primary-soft/35 px-4 py-3 text-sm text-text-secondary lg:text-[13px] 2xl:text-sm">
        {directFlow
          ? "Ingresá con Google o seguí como invitado para confirmar el canje ahora."
          : "Te recomendamos ingresar con Google para guardar tus cupones y ver tu historial en una cuenta."}
      </div>

      <GoogleButton
        beneficioId={beneficioId}
        redirect={directFlow ? `/beneficio/${beneficioId}?flow=${DIRECT_QR_FLOW}` : "/mis-beneficios"}
        flow={directFlow ? DIRECT_QR_FLOW : undefined}
      />

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
                ? directFlow
                  ? "Ingresá tu nombre para confirmar el canje ahora."
                  : "Ingresá tu nombre para generar el QR y presentarlo en el local."
                : directFlow
                  ? "Confirmá el canje ahora y mostrá el comprobante al local."
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
              {directFlow ? "Canjear ahora" : "Obtener QR"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
