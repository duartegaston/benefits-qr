"use client";
import { useId } from "react";
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
}

export default function PhoneInput({
  label,
  value,
  onChange,
  error,
  required,
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
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "group flex items-stretch rounded-xl border border-gray-200 bg-white shadow-sm",
          "focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-300",
          "transition-[border-color,box-shadow] duration-200",
          error &&
            "border-red-400 focus-within:border-red-400 focus-within:ring-red-300",
        )}
      >
        <div className="relative min-w-25 shrink-0 border-r border-gray-200 bg-gray-50/90">
          <Select
            value={matchedCountry.code}
            onValueChange={handleCountrySelect}
          >
            <SelectTrigger
              aria-label="Código de país"
              className={cn(error && "focus-visible:ring-red-300")}
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
          inputMode="numeric"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="911234567"
          required={required}
          className="w-full min-w-0 rounded-r-xl bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
