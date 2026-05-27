"use client";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Wrapper único para cargar el script de Google Maps + Places.
 * Cargar este provider sólo en árboles que realmente lo necesitan
 * (autocomplete de direcciones / mapa público) para no afectar el bundle inicial.
 */
export default function MapsProvider({ children }: { children: ReactNode }) {
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[MapsProvider] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada. Los componentes de mapas no funcionarán."
      );
    }
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-border-default bg-surface-muted p-6 text-center">
        <p className="text-sm text-text-muted">
          Configuración incompleta: falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </p>
      </div>
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[MapsProvider] Cargando Google Maps con API key:", apiKey?.slice(0, 10) + "...");
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]} language="es" region="AR">
      {children}
    </APIProvider>
  );
}
