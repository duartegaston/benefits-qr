import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Store, Ticket } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { formatDiasValidosSentence } from "@/lib/beneficioSchedule";
import { formatDateAR } from "@/lib/dates";
import type { PublicBenefitCardData } from "@/server/services/publicBenefitsService";

function getInitials(localName: string) {
  return localName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PublicBenefitCard({
  benefit,
  distanceLabel,
}: {
  benefit: PublicBenefitCardData;
  distanceLabel?: string | null;
}) {
  const localName = benefit.local.nombre ?? "Local adherido";
  const initials = getInitials(localName);

  return (
    <Link
      href={`/beneficio/${benefit.id}`}
      aria-label={`Ver beneficio ${benefit.descripcion}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden border-surface/80 bg-surface/95 shadow-sm shadow-primary-soft/25 transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md sm:bg-surface/85 sm:backdrop-blur-md">
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <Store className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">{localName}</span>
              </p>
              <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
                {benefit.descripcion}
              </h3>
            </div>

            <Badge variant={benefit.availability.badgeVariant} className="shrink-0 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
              {benefit.availability.badgeLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border-default/70 bg-surface-muted/70 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary shadow-sm">
              {benefit.local.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={benefit.local.logoUrl} alt={localName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold">{initials || "LO"}</span>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-sm font-semibold text-text-primary">{localName}</p>
                {benefit.local.rubroNombre && (
                  <Badge variant="muted" className="shrink-0 px-2 py-0 text-[10px]">
                    {benefit.local.rubroNombre}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-muted">{formatDiasValidosSentence(benefit.diasValidos)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {distanceLabel ? (
              <Badge variant="primary" className="gap-1.5 px-3 py-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {distanceLabel}
              </Badge>
            ) : null}
            <Badge variant="muted" className="gap-1.5 px-3 py-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Vence {formatDateAR(benefit.fechaExpiracion)}
            </Badge>

            {benefit.maxUsos !== null ? (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                {benefit.canjeados}/{benefit.maxUsos} usos
              </Badge>
            ) : null}
          </div>

          {benefit.availability.message ? (
            <div
              className={`rounded-2xl border px-3 py-2 text-xs ${
                benefit.availability.badgeVariant === "danger"
                  ? "border-danger-border bg-danger-soft/60 text-danger"
                  : "border-warning-border bg-warning-soft/60 text-warning"
              }`}
            >
              {benefit.availability.message}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between pt-1 text-sm font-semibold text-primary transition-colors group-hover:text-accent">
            <span>{benefit.requiereDatos ? "Ver beneficio" : "Abrir beneficio"}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
