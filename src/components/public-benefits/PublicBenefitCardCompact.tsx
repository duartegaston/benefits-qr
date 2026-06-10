import Link from "next/link";
import { ArrowRight, CalendarDays, Ticket } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
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

export default function PublicBenefitCardCompact({
  benefit,
}: {
  benefit: PublicBenefitCardData;
}) {
  const localName = benefit.local.nombre ?? "Local adherido";
  const initials = getInitials(localName);

  return (
    <Link
      href={`/beneficio/${benefit.id}`}
      aria-label={`Ver beneficio ${benefit.descripcion}`}
      className="group block"
    >
      <Card className="overflow-hidden border-surface/80 bg-surface/95 shadow-sm shadow-primary-soft/25 transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md sm:bg-surface/85 sm:backdrop-blur-md">
        <div className="flex items-center gap-3 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary shadow-sm">
            {benefit.local.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={benefit.local.logoUrl} alt={localName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold">{initials || "LO"}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 line-clamp-2 text-xs font-medium text-text-muted">{localName}</p>
              <Badge
                variant={benefit.availability.badgeVariant}
                className="shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
              >
                {benefit.availability.badgeLabel}
              </Badge>
            </div>
            <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-text-primary">
              {benefit.descripcion}
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-muted">
              <p className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                Vence {formatDateAR(benefit.fechaExpiracion)}
              </p>
              {benefit.maxUsos !== null ? (
                <p className="flex items-center gap-1">
                  <Ticket className="h-3 w-3" aria-hidden="true" />
                  {benefit.canjeados}/{benefit.maxUsos} usos
                </p>
              ) : null}
            </div>
          </div>

          <ArrowRight
            className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
            aria-hidden="true"
          />
        </div>
      </Card>
    </Link>
  );
}