"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoUpload, { type LogoFieldState } from "@/components/local/LogoUpload";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import RubroSelect from "@/components/local/RubroSelect";
import MapsProvider from "@/components/maps/MapsProvider";
import AddressAutocomplete, { type SelectedAddress } from "@/components/maps/AddressAutocomplete";

interface OnboardingFormProps {
  email: string;
  initialLogoSrc?: string | null;
}

const LOGO_ERROR_CODES = new Set([
  "INVALID_FILE",
  "INVALID_FILE_TYPE",
  "FILE_TOO_LARGE",
  "IMAGE_PROCESSING_FAILED",
  "IMAGE_TOO_HEAVY_AFTER_OPTIMIZATION",
]);

function createInitialLogoFieldState(src: string | null | undefined): LogoFieldState {
  return {
    src: src ?? null,
    persistedSrc: src ?? null,
    status: "idle",
    message: null,
    file: null,
  };
}

export default function OnboardingForm({ email, initialLogoSrc }: OnboardingFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [address, setAddress] = useState<SelectedAddress | null>(null);
  const [telefono, setTelefono] = useState("+54");
  const [rubroId, setRubroId] = useState("");
  const [logoField, setLogoField] = useState<LogoFieldState>(() => createInitialLogoFieldState(initialLogoSrc));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasLogoReady = Boolean(logoField.persistedSrc || logoField.file);
  const submitDisabled = loading || logoField.status === "error";

  const logoFeedback =
    logoField.status === "error"
      ? {
          tone: "text-danger",
          text: "Resolvé el logo para continuar.",
        }
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!hasLogoReady) {
      setError("Por favor subí una foto del local");
      return;
    }

    if (!address) {
      setError("Seleccioná una dirección de la lista de sugerencias");
      return;
    }

    if (!rubroId) {
      setError("Por favor seleccioná un rubro");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("nombre", nombre);
    form.append("direccion", address.direccion);
    form.append("lat", String(address.lat));
    form.append("lng", String(address.lng));
    form.append("telefono", telefono);
    form.append("rubroId", rubroId);

    if (address.placeId) {
      form.append("placeId", address.placeId);
    }

    if (logoField.file) {
      form.append("logo", logoField.file);
    }

    const res = await fetch("/api/local/me", {
      method: "PATCH",
      body: form,
    });

    const data = (await res.json()) as { error?: string; code?: string };
    setLoading(false);

    if (!res.ok) {
      if (data.code && LOGO_ERROR_CODES.has(data.code)) {
        setLogoField((current) => ({
          ...current,
          status: "error",
          message: data.error ?? "No se pudo guardar el logo. Elegí otra imagen.",
          file: null,
        }));
      }

      setError(data.error ?? "Error al guardar");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <MapsProvider>
    <Card className="w-full max-w-md border-surface/80 bg-surface/95 p-6 shadow-xl shadow-border-default/60 sm:bg-surface/85 sm:backdrop-blur-md sm:p-7 lg:max-w-sm lg:p-6 2xl:max-w-md 2xl:p-7">
      <SectionHeader
        eyebrow="Onboarding del negocio"
        title="Completá tu perfil"
        description="Esto es lo que verán tus clientes"
        align="center"
        className="!mb-6 sm:!mb-7 lg:!mb-6 2xl:!mb-7"
      />

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-4 2xl:space-y-5">
        <div className="mb-1.5 flex flex-col items-center gap-1 lg:mb-1 2xl:mb-1.5">
          <LogoUpload
            currentLogoUrl={logoField.persistedSrc}
            nombre={nombre || "?"}
            value={logoField}
            onChange={(state) => {
              setError("");
              setLogoField(state);
            }}
          />
          {logoFeedback && (
            <p aria-live="polite" className={`text-center text-xs ${logoFeedback.tone} lg:text-[11px] 2xl:text-xs`}>
              {logoFeedback.text}
            </p>
          )}
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          readOnly
          aria-readonly="true"
          className="cursor-default border-border-default bg-surface-muted text-text-muted focus-visible:ring-2 focus-visible:ring-primary-soft"
        />

        <Input
          label="Nombre del local"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: La Panadería de Juan"
          maxLength={50}
          required
        />

        <AddressAutocomplete
          label="Dirección"
          required
          onChange={setAddress}
          helperText="Empezá a escribir y elegí una opción de la lista."
        />

        <PhoneInput
          label="Teléfono"
          value={telefono}
          onChange={setTelefono}
          required
        />

        <RubroSelect value={rubroId} onChange={setRubroId} required />

        {error && (
          <p className="rounded-lg border border-danger-border bg-danger-soft px-3 py-2 text-sm font-medium text-danger lg:text-[13px] 2xl:text-sm" aria-live="polite">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} disabled={submitDisabled} className="w-full" size="lg">
          Guardar y continuar
        </Button>

        <p className="text-center text-xs text-text-muted lg:text-[11px] 2xl:text-xs">
          Podés editar estos datos después desde tu dashboard.
        </p>
      </form>
    </Card>
    </MapsProvider>
  );
}
