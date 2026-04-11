"use client";
import { useState } from "react";
import { QrCode, CircleAlert } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import QRDisplay from "@/components/cliente/beneficio/QRDisplay";
import Button from "@/components/ui/Button";
import { EstadoReclamo } from "@/lib/enums";
import { formatDateAR, formatDateTimeAR } from "@/lib/dates";
import { getReclamoStatusPresentation } from "@/lib/statusPresentation";
import { formatDiasValidosSentence, sortDiasValidos } from "@/lib/beneficioSchedule";

function getCurrentDayInArgentina(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      weekday: "short",
    })
      .format(new Date())
      .replace(/Sun/, "0")
      .replace(/Mon/, "1")
      .replace(/Tue/, "2")
      .replace(/Wed/, "3")
      .replace(/Thu/, "4")
      .replace(/Fri/, "5")
      .replace(/Sat/, "6")
  );
}

type Reclamo = {
  id: string;
  estado: EstadoReclamo;
  fechaReclamo: Date | string;
  fechaCanje: Date | string | null;
  beneficio: {
    descripcion: string;
    fechaExpiracion: Date | string;
    diasValidos: number[];
    local: { nombre: string | null; id: string };
  };
};

export default function MisBeneficiosList({
  reclamos,
}: {
  reclamos: Reclamo[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const todayIndex = getCurrentDayInArgentina();

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
        const status = getReclamoStatusPresentation(r.estado);
        const initials = (r.beneficio.local.nombre ?? "")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const isExpanded = expandedId === r.id;

        const diasValidos = r.beneficio.diasValidos;
        const isWrongDay =
          diasValidos.length > 0 && !diasValidos.includes(todayIndex);
        const isExpiredBeneficio =
          new Date(r.beneficio.fechaExpiracion) < new Date();
        const canShowQR = !isWrongDay && !isExpiredBeneficio;

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

              {r.estado === EstadoReclamo.PENDIENTE && canShowQR && (
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

              {r.estado === EstadoReclamo.PENDIENTE && !canShowQR && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning-border bg-warning-soft/60 px-3 py-2.5 text-xs text-warning">
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <p>
                    {isWrongDay
                      ? `Este cupón solo se puede canjear ${formatDiasValidosSentence(sortDiasValidos(diasValidos), { emptyLabel: "todos los días", prefix: "los", style: "full" })}.`
                      : "Este cupón ya no se puede canjear porque venció."}
                  </p>
                </div>
              )}

              {r.estado === EstadoReclamo.VENCIDO && (
                <p className="mt-3 text-xs text-danger">
                  Este cupón venció y ya no puede canjearse.
                </p>
              )}

              {r.estado === EstadoReclamo.CANJEADO && r.fechaCanje && (
                <p className="mt-3 text-xs text-success">
                  El local registró el canje el {formatDateTimeAR(r.fechaCanje)}.
                </p>
              )}

              {r.estado === EstadoReclamo.CANCELADO && (
                <p className="mt-3 text-xs text-text-muted">
                  Este cupón ya no está disponible porque el local lo dio de baja.
                </p>
              )}
            </div>

            {isExpanded && r.estado === EstadoReclamo.PENDIENTE && (
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
