"use client";
import { LocateFixed, MapPin, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { UseUserLocationResult } from "@/hooks/useUserLocation";

export default function UbicacionToggle({
  location,
  className,
}: {
  location: UseUserLocationResult;
  className?: string;
}) {
  const { coords, status, error, request, clear } = location;
  const isLoading = status === "prompting";
  const isActive = status === "granted" && coords !== null;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {isActive ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-accent">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Mostrando por cercanía
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clear}
              aria-label="Quitar ubicación"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Quitar
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={request}
            loading={isLoading}
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            Ver cerca mío
          </Button>
        )}
      </div>
      <p className="mt-1 text-[11px] text-text-muted">
        Solo se usa en tu dispositivo, no guardamos tu ubicación.
      </p>
      {error && status !== "granted" ? (
        <p className="mt-1 text-[11px] text-warning">{error}</p>
      ) : null}
    </div>
  );
}
