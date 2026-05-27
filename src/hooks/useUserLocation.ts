"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/geo/distance";

export type UserLocationStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export type UseUserLocationResult = {
  coords: LatLng | null;
  status: UserLocationStatus;
  error: string | null;
  request: () => void;
  clear: () => void;
};

export function useUserLocation(): UseUserLocationResult {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      setError("Tu dispositivo no soporta geolocalización.");
      return;
    }

    setStatus("prompting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted.current) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        if (!mounted.current) return;
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Permitiste el permiso desde el navegador para usar esta función.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus("unavailable");
          setError("No pudimos obtener tu ubicación.");
        } else {
          setStatus("error");
          setError("Hubo un problema al obtener tu ubicación.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { coords, status, error, request, clear };
}
