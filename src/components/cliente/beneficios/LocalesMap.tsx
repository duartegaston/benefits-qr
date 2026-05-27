"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Map, AdvancedMarker, useMap, InfoWindow, useApiIsLoaded } from "@vis.gl/react-google-maps";
import { Store, AlertCircle } from "lucide-react";
import type { LocalConBeneficiosRaw } from "@/server/repositories/localesMapRepository";
import type { LatLng } from "@/lib/geo/distance";
import { formatDistance, haversineKm } from "@/lib/geo/distance";

const DEFAULT_CENTER: LatLng = { lat: -27.36693, lng: -55.89363 };
const DEFAULT_ZOOM = 12;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MapBoundsFitter({
  locales,
  userCoords,
}: {
  locales: LocalConBeneficiosRaw[];
  userCoords: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (userCoords) {
      map.panTo(userCoords);
      map.setZoom(13);
      return;
    }
    if (locales.length === 0) return;
    if (locales.length === 1) {
      map.panTo({ lat: locales[0].lat, lng: locales[0].lng });
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    for (const l of locales) bounds.extend({ lat: l.lat, lng: l.lng });
    map.fitBounds(bounds, 64);
  }, [map, locales, userCoords]);

  return null;
}

function LocalMarker({
  local,
  isSelected,
  onSelect,
}: {
  local: LocalConBeneficiosRaw;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const name = local.nombre ?? "Local adherido";
  const initials = getInitials(name) || "LO";
  return (
    <AdvancedMarker
      position={{ lat: local.lat, lng: local.lng }}
      onClick={() => onSelect(local.id)}
      title={name}
    >
      <div
        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 bg-surface text-primary shadow-lg transition-all duration-200 ${
          isSelected
            ? "scale-115 border-primary ring-4 ring-primary-soft/30 z-50"
            : "border-primary/50 hover:border-primary hover:scale-105"
        }`}
      >
        {local.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={local.logoUrl}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold">{initials}</span>
        )}
      </div>
    </AdvancedMarker>
  );
}

function UserMarker({ coords }: { coords: LatLng }) {
  return (
    <AdvancedMarker position={coords} title="Estás acá">
      <div className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute h-8 w-8 animate-ping rounded-full bg-primary/40" />
        <span className="relative h-4 w-4 rounded-full border-2 border-white bg-primary shadow-md" />
      </div>
    </AdvancedMarker>
  );
}

function MapErrorState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertCircle className="h-10 w-10 text-danger" />
      <div>
        <p className="font-semibold text-text-primary">No se pudo cargar el mapa</p>
        <p className="text-sm text-text-muted">
          Verificá que la API key de Google Maps esté configurada correctamente y que las APIs de Maps JavaScript y Places estén habilitadas en Google Cloud Console.
        </p>
      </div>
    </div>
  );
}

export default function LocalesMap({
  locales,
  userCoords,
}: {
  locales: LocalConBeneficiosRaw[];
  userCoords: LatLng | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const apiIsLoaded = useApiIsLoaded();

  // AdvancedMarker requiere obligatoriamente un mapId. Usamos DEMO_MAP_ID como fallback.
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

  // Log para debug en desarrollo
  if (process.env.NODE_ENV !== "production") {
    console.log("[LocalesMap] mapId:", mapId);
    console.log("[LocalesMap] apiIsLoaded:", apiIsLoaded);
  }

  const initialCenter = useMemo(() => {
    if (locales.length > 0) {
      return { lat: locales[0].lat, lng: locales[0].lng };
    }
    return DEFAULT_CENTER;
  }, [locales]);

  // Si la API no se cargó después de un tiempo, mostrar error
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!apiIsLoaded) {
        setShowError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [apiIsLoaded]);

  if (showError) {
    return (
      <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl border border-border-default bg-surface-muted shadow-sm">
        <MapErrorState />
      </div>
    );
  }

  const selected = selectedId
    ? locales.find((l) => l.id === selectedId) ?? null
    : null;

  const distanceLabel =
    selected && userCoords
      ? formatDistance(haversineKm(userCoords, { lat: selected.lat, lng: selected.lng }))
      : null;

  if (locales.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-border-default bg-surface-muted p-6 text-center text-sm text-text-muted">
        Todavía no hay locales con beneficios vigentes ubicados en el mapa.
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl border border-border-default bg-surface-muted shadow-sm">
      <Map
        defaultCenter={initialCenter}
        defaultZoom={DEFAULT_ZOOM}
        mapId={mapId}
        gestureHandling="greedy"
        disableDefaultUI={false}
        clickableIcons={false}
        reuseMaps
      >
        <MapBoundsFitter locales={locales} userCoords={userCoords} />
        {userCoords ? <UserMarker coords={userCoords} /> : null}
        {locales.map((local) => (
          <LocalMarker
            key={local.id}
            local={local}
            isSelected={selectedId === local.id}
            onSelect={setSelectedId}
          />
        ))}
        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelectedId(null)}
            pixelOffset={[0, -28]}
          >
            <div className="min-w-[200px] space-y-2 p-1">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-sm font-semibold text-text-primary">
                  {selected.nombre ?? "Local adherido"}
                </p>
              </div>
              <p className="text-xs text-text-muted">
                {selected.beneficiosCount}{" "}
                {selected.beneficiosCount === 1 ? "beneficio vigente" : "beneficios vigentes"}
                {distanceLabel ? ` · a ${distanceLabel}` : ""}
              </p>
              <Link
                href={`/beneficios?local=${encodeURIComponent(selected.id)}`}
                className="inline-block text-xs font-semibold text-primary hover:text-accent"
              >
                Ver beneficios →
              </Link>
            </div>
          </InfoWindow>
        ) : null}
      </Map>
    </div>
  );
}
