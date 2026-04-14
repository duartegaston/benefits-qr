"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoUpload from "@/components/local/LogoUpload";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

interface OnboardingFormProps {
  localId: string;
  email: string;
  logoUrl?: string | null;
}

export default function OnboardingForm({ email, logoUrl }: OnboardingFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("+54");
  const [hasLogo, setHasLogo] = useState(!!logoUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!hasLogo) {
      setError("Por favor subí una foto del local");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/local/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, direccion, telefono }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
      return;
    }

    router.push("/dashboard");
  }

  return (
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
            currentLogoUrl={logoUrl}
            nombre={nombre || "?"}
            onUploaded={() => setHasLogo(true)}
          />
          {!hasLogo && (
            <p className="text-xs text-text-muted lg:text-[11px] 2xl:text-xs">Foto del local (requerida)</p>
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
          required
        />

        <Input
          label="Dirección"
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
          required
        />

        <PhoneInput
          label="Teléfono"
          value={telefono}
          onChange={setTelefono}
          required
        />

        {error && (
          <p className="rounded-lg border border-danger-border bg-danger-soft px-3 py-2 text-sm font-medium text-danger lg:text-[13px] 2xl:text-sm">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Guardar y continuar
        </Button>

        <p className="text-center text-xs text-text-muted lg:text-[11px] 2xl:text-xs">
          Podés editar estos datos después desde tu dashboard.
        </p>
      </form>
    </Card>
  );
}
