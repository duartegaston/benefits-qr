"use client";
import { useId, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const COUNTRIES = [
  { code: "+54", label: "🇦🇷 +54", shortName: "AR" },
  { code: "+55", label: "🇧🇷 +55", shortName: "BR" },
  { code: "+56", label: "🇨🇱 +56", shortName: "CL" },
  { code: "+595", label: "🇵🇾 +595", shortName: "PY" },
  { code: "+598", label: "🇺🇾 +598", shortName: "UY" },
];

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (fullPhone: string) => void;
  error?: string;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  enterKeyHint?: HTMLAttributes<HTMLInputElement>["enterKeyHint"];
}

export default function PhoneInput({
  label,
  value,
  onChange,
  error,
  required,
  name,
  autoComplete,
  enterKeyHint,
}: PhoneInputProps) {
  const id = useId();

  // Derive countryCode and localNumber from the controlled value
  const matchedCountry =
    COUNTRIES.find((c) => value.startsWith(c.code)) ?? COUNTRIES[0];
  const localNumber = value.startsWith(matchedCountry.code)
    ? value.slice(matchedCountry.code.length)
    : value;

  function handleCountrySelect(countryCode: string) {
    onChange(countryCode + localNumber);
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    onChange(matchedCountry.code + digits);
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-text-primary lg:text-[13px] 2xl:text-sm"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "group flex items-stretch rounded-xl border border-border-default bg-surface shadow-sm",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft",
          "transition-[border-color,box-shadow] duration-200",
          error &&
            "border-danger focus-within:border-danger focus-within:ring-danger-soft",
        )}
      >
        <div className="relative min-w-25 shrink-0 border-r border-border-default bg-surface-muted/90">
          <Select
            value={matchedCountry.code}
            onValueChange={handleCountrySelect}
          >
            <SelectTrigger
              aria-label="Código de país"
              className={cn(
                "h-full rounded-none rounded-l-xl border-0 bg-transparent shadow-none",
                error && "focus-visible:ring-danger-soft",
              )}
            >
              <SelectValue aria-label={matchedCountry.label}>
                {matchedCountry.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center justify-between gap-3 pr-2">
                    <span>{country.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <input
          id={id}
          type="tel"
          name={name}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          inputMode="numeric"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="911234567"
          required={required}
          className="w-full min-w-0 rounded-r-xl bg-surface px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:outline-none sm:text-sm lg:px-3.5 lg:py-2 2xl:px-4 2xl:py-2.5"
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger lg:text-[11px] 2xl:text-xs">{error}</p>}
    </div>
  );
}
