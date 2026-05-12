import Badge from "@/components/ui/Badge";
import type { TopCupon } from "@/server/services/dashboardStatsService";

interface TopCuponesProps {
  cupones: TopCupon[];
}

export default function TopCupones({ cupones }: TopCuponesProps) {
  if (cupones.length === 0) {
    return (
      <p className="text-sm text-text-muted">Sin datos suficientes para calcular top cupones.</p>
    );
  }

  return (
    <div className="space-y-2.5">
      {cupones.map((cupon, index) => (
        <div key={cupon.id} className="rounded-xl border border-surface/70 bg-surface-muted/45 p-2.5">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-text-primary">
              #{index + 1} {cupon.descripcion}
            </p>
            <Badge variant={cupon.statusVariant}>{cupon.statusLabel}</Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-text-muted sm:text-xs">
            <div className="flex items-center gap-3">
              <p>Reclamos: {cupon.totalReclamos}</p>
              <p>Canjes: {cupon.canjeados}</p>
            </div>
            <p className="shrink-0 font-semibold text-text-primary">{cupon.tasa}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}
