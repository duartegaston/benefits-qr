"use client";
import { useMemo } from "react";
import LinkButton from "@/components/ui/LinkButton";
import PublicBenefitCardCompact from "@/components/public-benefits/PublicBenefitCardCompact";
import UbicacionToggle from "@/components/cliente/beneficios/UbicacionToggle";
import { useUserLocation } from "@/hooks/useUserLocation";
import { haversineKm, formatDistance, type LatLng } from "@/lib/geo/distance";
import type { PublicBenefitCardData } from "@/server/services/publicBenefitsService";

export type LocalCoordsByName = Record<string, LatLng>;

export default function BeneficiosListConCercania({
  beneficios,
  localCoordsByName,
  page,
  totalPages,
  total,
  filterParamsString,
  emptyMessage,
}: {
  beneficios: PublicBenefitCardData[];
  localCoordsByName: LocalCoordsByName;
  page: number;
  totalPages: number;
  total: number;
  filterParamsString: string;
  emptyMessage?: string;
}) {
  const location = useUserLocation();

  const ordered = useMemo(() => {
    const userCoords = location.coords;
    if (!userCoords) return beneficios;
    return [...beneficios]
      .map((b) => {
        const key = b.local.nombre ?? "";
        const coords = key ? localCoordsByName[key] : undefined;
        const km = coords ? haversineKm(userCoords, coords) : Number.POSITIVE_INFINITY;
        return { b, km };
      })
      .sort((a, z) => a.km - z.km)
      .map((x) => x.b);
  }, [beneficios, localCoordsByName, location.coords]);

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  function buildPageUrl(p: number) {
    const next = new URLSearchParams(filterParamsString);
    next.set("page", String(p));
    return `/beneficios?${next.toString()}`;
  }

  return (
    <div className="flex flex-col gap-3">
      <UbicacionToggle location={location} />

      {ordered.length > 0 ? (
        ordered.map((benefit) => {
          const userCoords = location.coords;
          let distanceLabel: string | null = null;
          if (userCoords) {
            const key = benefit.local.nombre ?? "";
            const coords = key ? localCoordsByName[key] : undefined;
            if (coords) distanceLabel = formatDistance(haversineKm(userCoords, coords));
          }
          return (
            <PublicBenefitCardCompact
              key={benefit.id}
              benefit={benefit}
              distanceLabel={distanceLabel}
            />
          );
        })
      ) : (
        <div className="rounded-2xl border border-border-default bg-surface/80 p-6 text-center text-sm text-text-muted">
          {emptyMessage ?? "No hay beneficios que coincidan con los filtros."}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <LinkButton
            href={hasPrevious ? buildPageUrl(page - 1) : buildPageUrl(1)}
            variant="secondary"
            size="sm"
            className={hasPrevious ? "w-full sm:w-auto" : "pointer-events-none w-full opacity-50 sm:w-auto"}
            aria-disabled={!hasPrevious}
          >
            ← Anterior
          </LinkButton>

          <p className="text-center text-sm text-text-muted">
            Página {Math.min(page, Math.max(totalPages, 1))} de {totalPages} · {total}
          </p>

          <LinkButton
            href={hasNext ? buildPageUrl(page + 1) : buildPageUrl(page)}
            variant="secondary"
            size="sm"
            className={hasNext ? "w-full sm:w-auto" : "pointer-events-none w-full opacity-50 sm:w-auto"}
            aria-disabled={!hasNext}
          >
            Siguiente →
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}
