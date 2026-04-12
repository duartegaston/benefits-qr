"use client";
import { useState } from "react";
import { QrCode, CircleAlert } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import QRDisplay from "@/components/cliente/beneficio/QRDisplay";
import Button from "@/components/ui/Button";
import type { ReclamoEffectiveStatus } from "@/lib/couponStatus";
import { formatDateAR, formatDateTimeAR } from "@/lib/dates";
import { getReclamoStatusPresentation } from "@/lib/statusPresentation";

type Reclamo = {
  id: string;
  effectiveStatus: ReclamoEffectiveStatus;
  canShowQr: boolean;
  blockedMessage: string | null;
  fechaReclamo: Date | string;
  fechaCanje: Date | string | null;
  beneficio: {
    descripcion: string;
    fechaExpiracion: Date | string;
    local: { nombre: string | null; id: string };
  };
};

export default function MisBeneficiosList({
  reclamos,
}: {
  reclamos: Reclamo[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (reclamos.length === 0) {
    return (
      <Card className="border-surface/80 bg-surface/95 p-10 text-center shadow-sm shadow-accent-soft/25 sm:bg-surface/85 sm:p-12">
        <p className="text-text-muted">No tenés cupones reclamados aún</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reclamos.map((r) => {
        const status = getReclamoStatusPresentation(r.effectiveStatus);
        const initials = (r.beneficio.local.nombre ?? "")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const isExpanded = expandedId === r.id;

        return (
          <Card
            key={r.id}
            className="overflow-hidden border-surface/80 bg-surface/95 shadow-sm shadow-accent-soft/25 sm:bg-surface/85"
          >
            <div className="h-1 bg-gradient-to-r from-primary to-accent" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary shadow-sm">
                      <span className="text-xs font-bold">{initials || "LO"}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/locales/${r.beneficio.local.id}/logo`}
                        alt={r.beneficio.local.nombre ?? ""}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">
                        {r.beneficio.local.nombre ?? "Local adherido"}
                      </p>
                      <p className="text-xs text-text-muted">
                        Reclamo: {formatDateAR(r.fechaReclamo)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="line-clamp-2 text-base font-semibold text-text-primary">
                    {r.beneficio.descripcion}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span>Vence: {formatDateAR(r.beneficio.fechaExpiracion)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={status.badgeVariant}>{status.label}</Badge>
              </div>

              {r.canShowQr && (
                <Button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  variant="light"
                  className="mt-4 w-full"
                >
                  <QrCode className="h-4 w-4" aria-hidden="true" />
                  {isExpanded ? "Ocultar QR" : "Mostrar QR"}
                </Button>
              )}

              {!r.canShowQr && r.blockedMessage && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning-border bg-warning-soft/60 px-3 py-2.5 text-xs text-warning">
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <p>{r.blockedMessage}</p>
                </div>
              )}

              {r.effectiveStatus === "VENCIDO" && (
                <p className="mt-3 text-xs text-danger">
                  Este cupón venció y ya no puede canjearse.
                </p>
              )}

              {r.effectiveStatus === "CANJEADO" && r.fechaCanje && (
                <p className="mt-3 text-xs text-success">
                  El local registró el canje el {formatDateTimeAR(r.fechaCanje)}.
                </p>
              )}

              {r.effectiveStatus === "CANCELADO" && (
                <p className="mt-3 text-xs text-text-muted">
                  Este cupón ya no está disponible porque el local lo dio de baja.
                </p>
              )}
            </div>

            {isExpanded && r.canShowQr && (
              <div className="border-t border-border-default/70 bg-surface-muted/35 p-4 sm:p-5">
                <QRDisplay reclamoId={r.id} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
