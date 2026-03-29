"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoUpload from "@/components/LogoUpload";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
    <Card className="w-full max-w-md p-6 sm:p-7 shadow-xl shadow-gray-200/60 bg-white/95 sm:bg-white/85 sm:backdrop-blur-md border-white/80">
      <div className="mb-6 text-center sm:mb-7">
        <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Completá tu perfil</h1>
        <p className="text-gray-500 text-sm">Esto es lo que verán tus clientes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="mb-1.5 flex flex-col items-center gap-1">
          <LogoUpload
            currentLogoUrl={logoUrl}
            nombre={nombre || "?"}
            onUploaded={() => setHasLogo(true)}
          />
          {!hasLogo && (
            <p className="text-xs text-gray-400">Foto del local (requerida)</p>
          )}
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          readOnly
          aria-readonly="true"
          className="bg-gray-50 text-gray-700 border-gray-200 cursor-default focus-visible:ring-2 focus-visible:ring-violet-200"
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
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Guardar y continuar
        </Button>

        <p className="text-center text-xs text-gray-500">
          Podés editar estos datos después desde tu dashboard.
        </p>
      </form>
    </Card>
  );
}
