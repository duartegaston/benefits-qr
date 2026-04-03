"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import QRDisplay from "@/components/cliente/QRDisplay";
import Button from "@/components/ui/Button";

type Reclamo = {
  id: string;
  estado: "PENDIENTE" | "CANJEADO" | "VENCIDO" | "CANCELADO";
  fechaReclamo: Date | string;
  fechaCanje: Date | string | null;
  beneficio: {
    descripcion: string;
    fechaExpiracion: Date | string;
    local: { nombre: string | null; logoUrl: string | null };
  };
};

const estadoBadge: Record<Reclamo["estado"], "violet" | "green" | "red" | "gray"> = {
  PENDIENTE: "violet",
  CANJEADO: "green",
  VENCIDO: "red",
  CANCELADO: "gray",
};

export default function MisBeneficiosList({
  reclamos,
}: {
  reclamos: Reclamo[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (reclamos.length === 0) {
    return (
      <Card className="border-border-default/70 bg-surface/90 p-12 text-center sm:bg-surface/75 sm:backdrop-blur-md">
        <p className="text-text-muted">No tenés cupones reclamados aún</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reclamos.map((r) => {
        const initials = (r.beneficio.local.nombre ?? "")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <Card key={r.id} className="overflow-hidden border-border-default/70 bg-surface/90 transition-all duration-200 hover:-translate-y-0.5 sm:bg-surface/75 sm:backdrop-blur-md">
            <div className="h-1 bg-gradient-to-r from-primary to-accent" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary-soft flex items-center justify-center shrink-0">
                      {r.beneficio.local.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.beneficio.local.logoUrl}
                          alt={r.beneficio.local.nombre ?? ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-xs">{initials}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-primary">
                      {r.beneficio.local.nombre}
                    </p>
                  </div>
                  <h3 className="font-semibold text-text-primary truncate">
                    {r.beneficio.descripcion}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Reclamado:{" "}
                    {new Date(r.fechaReclamo).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge color={estadoBadge[r.estado]}>{r.estado}</Badge>
              </div>

              {r.estado === "PENDIENTE" && (
                <Button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === r.id ? null : r.id)
                  }
                  variant="ghost"
                  className="mt-4 w-full h-auto py-2 text-sm font-medium text-primary bg-primary-soft rounded-xl hover:bg-accent-soft transition-colors active:scale-100"
                >
                  {expandedId === r.id ? "Ocultar QR" : "Mostrar QR"}
                </Button>
              )}

              {r.estado === "CANJEADO" && r.fechaCanje && (
                <p className="text-xs text-success mt-3">
                  Canjeado:{" "}
                  {new Date(r.fechaCanje).toLocaleString("es-AR")}
                </p>
              )}

              {r.estado === "CANCELADO" && (
                <p className="text-xs text-gray-400 mt-3">
                  Cupón no disponible
                </p>
              )}
            </div>

            {expandedId === r.id && r.estado === "PENDIENTE" && (
              <div className="border-t border-border-default/70 p-5">
                <QRDisplay reclamoId={r.id} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
