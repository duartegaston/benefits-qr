"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import { cn } from "@/lib/utils";

export type SelectedAddress = {
  direccion: string;
  lat: number;
  lng: number;
  placeId: string | null;
};

interface AddressAutocompleteProps {
  label?: string;
  required?: boolean;
  initialValue?: string;
  /**
   * Si la dirección inicial ya existe (caso edit) y el usuario no la modifica,
   * no es necesario re-elegir. onChange sólo se dispara cuando hay nueva selección.
   */
  onChange: (value: SelectedAddress | null) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

const COUNTRY_RESTRICTIONS = ["ar"];

export default function AddressAutocomplete({
  label = "Dirección",
  required,
  initialValue = "",
  onChange,
  placeholder = "Ej: Av. Corrientes 1234, Buenos Aires",
  error,
  helperText,
}: AddressAutocompleteProps) {
  const inputId = useId();
  const places = useMapsLibrary("places");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [selectionMade, setSelectionMade] = useState(initialValue.trim() !== "");
  const [resolving, setResolving] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    debounce: 350,
    cache: 60 * 60 * 24,
    requestOptions: {
      componentRestrictions: { country: COUNTRY_RESTRICTIONS },
      types: ["address"],
    },
    initOnMount: false,
    defaultValue: initialValue,
  });

  useEffect(() => {
    if (places && !ready) {
      init();
    }
  }, [places, ready, init]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSelect(prediction: google.maps.places.AutocompletePrediction) {
    setValue(prediction.description, false);
    clearSuggestions();
    setOpen(false);
    setResolving(true);
    try {
      const details = (await getDetails({
        placeId: prediction.place_id,
        fields: ["geometry", "formatted_address", "place_id"],
      })) as google.maps.places.PlaceResult;

      const lat = details.geometry?.location?.lat();
      const lng = details.geometry?.location?.lng();
      const direccion = details.formatted_address ?? prediction.description;
      const placeId = details.place_id ?? prediction.place_id ?? null;

      if (typeof lat === "number" && typeof lng === "number") {
        setSelectionMade(true);
        onChange({ direccion, lat, lng, placeId });
        setValue(direccion, false);
      } else {
        setSelectionMade(false);
        onChange(null);
      }
    } catch {
      setSelectionMade(false);
      onChange(null);
    } finally {
      setResolving(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
    if (selectionMade) {
      // El usuario empezó a editar el texto: la selección anterior ya no es válida.
      setSelectionMade(false);
      onChange(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || data.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, data.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < data.length) {
        e.preventDefault();
        handleSelect(data[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showSuggestions = open && status === "OK" && data.length > 0;
  const noApiKey = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-text-primary lg:text-[13px] 2xl:text-sm"
        >
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={!ready && !noApiKey}
          role="combobox"
          aria-invalid={Boolean(error)}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={`${inputId}-listbox`}
          className={cn(
            "w-full min-w-0 rounded-xl border border-border-default bg-surface px-3 py-2.5 text-base text-text-primary shadow-sm outline-none transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm lg:px-3.5 lg:py-2 2xl:px-4 2xl:py-2.5",
            error && "border-danger-border focus-visible:ring-danger-soft"
          )}
        />
        {showSuggestions && (
          <ul
            id={`${inputId}-listbox`}
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border-default bg-surface py-1 shadow-lg"
          >
            {data.map((suggestion, idx) => {
              const {
                place_id,
                structured_formatting: { main_text, secondary_text },
              } = suggestion;
              const isActive = idx === activeIndex;
              return (
                <li key={place_id} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(suggestion)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors",
                      isActive ? "bg-primary-soft text-text-primary" : "hover:bg-surface-muted"
                    )}
                  >
                    <span className="font-medium text-text-primary">{main_text}</span>
                    {secondary_text && (
                      <span className="text-xs text-text-muted">{secondary_text}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-danger lg:text-[11px] 2xl:text-xs">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-muted lg:text-[11px] 2xl:text-xs">{helperText}</p>
      ) : null}
      {resolving && (
        <p className="mt-1 text-xs text-text-muted">Verificando dirección…</p>
      )}
      {noApiKey && (
        <p className="mt-1 text-xs text-warning">
          Mapas no configurados. Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </p>
      )}
    </div>
  );
}
