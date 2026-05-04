"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";

const RUBRO_ALL = "__all__";

type Rubro = { id: number | string; nombre: string };

export default function PublicBenefitsFilters({ rubros }: { rubros: Rubro[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentRubro = searchParams.get("rubro") ?? "";
  const currentSoloHoy = searchParams.get("soloHoy") === "1";
  const currentSoloDisponibles = searchParams.get("soloDisponibles") === "1";

  const [inputValue, setInputValue] = useState(currentQ);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep search input in sync when navigating back/forward
  useEffect(() => {
    setInputValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Derive Select value and label entirely from the URL — single source of truth.
  // Local state (rubroValue) caused desync: the Suspense remount on RSC navigation
  // would reinitialize useState before searchParams updated, losing the selection.
  const selectRubroValue = currentRubro || RUBRO_ALL;
  const selectedRubroLabel = !currentRubro
    ? null
    : (rubros.find((r) => String(r.id) === currentRubro)?.nombre ?? null);

  const activeCount =
    (currentQ ? 1 : 0) +
    (currentRubro ? 1 : 0) +
    (currentSoloHoy ? 1 : 0) +
    (currentSoloDisponibles ? 1 : 0);

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = {
        q: currentQ || undefined,
        rubro: currentRubro || undefined,
        soloHoy: currentSoloHoy ? "1" : undefined,
        soloDisponibles: currentSoloDisponibles ? "1" : undefined,
        ...overrides,
      };
      for (const [key, value] of Object.entries(merged)) {
        if (value) params.set(key, value);
      }
      const qs = params.toString();
      return qs ? `/beneficios?${qs}` : "/beneficios";
    },
    [currentQ, currentRubro, currentSoloHoy, currentSoloDisponibles]
  );

  function handleQChange(value: string) {
    setInputValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      router.push(buildUrl({ q: value || undefined }));
    }, 300);
  }

  function handleRubroChange(value: string) {
    router.push(buildUrl({ rubro: value === RUBRO_ALL ? undefined : value }));
  }

  function handleToggleSoloHoy() {
    router.push(buildUrl({ soloHoy: currentSoloHoy ? undefined : "1" }));
  }

  function handleToggleSoloDisponibles() {
    router.push(buildUrl({ soloDisponibles: currentSoloDisponibles ? undefined : "1" }));
  }

  function handleClear() {
    setInputValue("");
    router.push("/beneficios");
  }

  const toggle = (active: boolean) =>
    cn(
      "flex h-10 shrink-0 cursor-pointer select-none items-center rounded-xl border px-4 text-sm font-medium whitespace-nowrap transition-all duration-200",
      active
        ? "border-primary bg-primary text-white shadow-sm"
        : "border-border-default bg-surface text-text-secondary hover:border-primary/40 hover:bg-primary-soft/20 hover:text-text-primary"
    );

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Búsqueda por nombre */}
      <div className="relative min-w-[190px] flex-[2]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar local..."
          value={inputValue}
          onChange={(e) => handleQChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-border-default bg-surface py-2 pl-9 pr-3 text-sm text-text-primary shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft"
        />
      </div>

      {/* Rubro — label computed from props, not from Radix item-text */}
      <div className="min-w-[165px] flex-1">
        <Select value={selectRubroValue} onValueChange={handleRubroChange}>
          <SelectTrigger>
            <span className={cn("truncate text-sm", !selectedRubroLabel && "text-text-muted font-normal")}>
              {selectedRubroLabel ?? "Todos los rubros"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RUBRO_ALL}>Todos los rubros</SelectItem>
            {rubros.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separador visual solo desktop */}
      <div className="hidden h-5 w-px shrink-0 bg-border-default sm:block" />

      <button type="button" onClick={handleToggleSoloHoy} className={toggle(currentSoloHoy)}>
        Disponible hoy
      </button>

      <button type="button" onClick={handleToggleSoloDisponibles} className={toggle(currentSoloDisponibles)}>
        Solo activos
      </button>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-text-muted transition-colors hover:text-danger"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-6">
      {/* Mobile: collapsible */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full items-center gap-2 overflow-hidden rounded-2xl border border-surface/80 bg-surface/95 px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm shadow-primary-soft/25"
        >
          <Filter className="h-4 w-4 shrink-0 text-text-muted" />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="mt-2 rounded-xl border border-border-default bg-surface p-3 shadow-sm">
            {controls}
          </div>
        )}
      </div>

      {/* Desktop: card container — same visual DNA as PublicBenefitCard */}
      <div className="hidden sm:block">
        <div className="overflow-hidden rounded-2xl border border-surface/80 bg-surface/95 shadow-sm shadow-primary-soft/25 sm:bg-surface/85 sm:backdrop-blur-md">
          <div className="h-1 bg-gradient-to-r from-primary to-accent" />
          <div className="px-4 py-3">{controls}</div>
        </div>
      </div>
    </div>
  );
}
