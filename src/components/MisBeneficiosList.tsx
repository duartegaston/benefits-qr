"use client";
import { useState } from "react";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import QRDisplay from "./QRDisplay";

type Reclamo = {
  id: string;
  estado: "PENDIENTE" | "CANJEADO" | "VENCIDO";
  fechaReclamo: Date | string;
  fechaCanje: Date | string | null;
  beneficio: {
    descripcion: string;
    fechaExpiracion: Date | string;
    local: { nombre: string | null; logoUrl: string | null };
  };
};

const estadoBadge: Record<Reclamo["estado"], "violet" | "green" | "red"> = {
  PENDIENTE: "violet",
  CANJEADO: "green",
  VENCIDO: "red",
};

export default function MisBeneficiosList({
  reclamos,
}: {
  reclamos: Reclamo[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (reclamos.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/75 backdrop-blur-md border-white/70">
        <p className="text-gray-400">No tenés cupones reclamados aún</p>
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
          <Card key={r.id} className="overflow-hidden bg-white/75 backdrop-blur-md border-white/70 hover:-translate-y-0.5 transition-all duration-200">
            <div className="h-1 bg-gradient-to-r from-violet-600 to-violet-400" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-violet-100 flex items-center justify-center shrink-0">
                      {r.beneficio.local.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.beneficio.local.logoUrl}
                          alt={r.beneficio.local.nombre ?? ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-violet-600 font-bold text-xs">{initials}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-violet-600">
                      {r.beneficio.local.nombre}
                    </p>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {r.beneficio.descripcion}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Reclamado:{" "}
                    {new Date(r.fechaReclamo).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge color={estadoBadge[r.estado]}>{r.estado}</Badge>
              </div>

              {r.estado === "PENDIENTE" && (
                <button
                  onClick={() =>
                    setExpandedId(expandedId === r.id ? null : r.id)
                  }
                  className="mt-4 w-full py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
                >
                  {expandedId === r.id ? "Ocultar QR" : "Mostrar QR"}
                </button>
              )}

              {r.estado === "CANJEADO" && r.fechaCanje && (
                <p className="text-xs text-green-600 mt-3">
                  Canjeado:{" "}
                  {new Date(r.fechaCanje).toLocaleString("es-AR")}
                </p>
              )}
            </div>

            {expandedId === r.id && r.estado === "PENDIENTE" && (
              <div className="border-t border-gray-100 p-5">
                <QRDisplay reclamoId={r.id} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
