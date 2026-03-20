"use client";
import { useState, useId } from "react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "+54", label: "🇦🇷 +54", name: "Argentina" },
  { code: "+55", label: "🇧🇷 +55", name: "Brasil" },
  { code: "+56", label: "🇨🇱 +56", name: "Chile" },
  { code: "+595", label: "🇵🇾 +595", name: "Paraguay" },
  { code: "+598", label: "🇺🇾 +598", name: "Uruguay" },
];

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (fullPhone: string) => void;
  error?: string;
  required?: boolean;
}

export default function PhoneInput({ label, value, onChange, error, required }: PhoneInputProps) {
  const id = useId();

  // Derive countryCode and localNumber from the controlled value
  const matchedCountry = COUNTRIES.find((c) => value.startsWith(c.code)) ?? COUNTRIES[0];
  const localNumber = value.startsWith(matchedCountry.code)
    ? value.slice(matchedCountry.code.length)
    : value;

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value + localNumber);
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    onChange(matchedCountry.code + digits);
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={cn(
        "flex border border-gray-200 rounded-xl overflow-hidden bg-white",
        "focus-within:ring-2 focus-within:ring-violet-300 focus-within:border-violet-400",
        "transition-all duration-200",
        error && "border-red-400 focus-within:ring-red-300"
      )}>
        <select
          value={matchedCountry.code}
          onChange={handleCountryChange}
          aria-label="Código de país"
          className="bg-gray-50 border-r border-gray-200 text-sm text-gray-700 px-2 py-2 focus:outline-none cursor-pointer"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="911234567"
          required={required}
          className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
