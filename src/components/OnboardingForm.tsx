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
    <Card className="w-full max-w-md p-8 shadow-xl shadow-gray-200/60">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Completá tu perfil</h1>
        <p className="text-gray-500 text-sm">Esto es lo que verán tus clientes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center mb-2 gap-1">
          <LogoUpload
            currentLogoUrl={logoUrl}
            nombre={nombre || "?"}
            onUploaded={() => setHasLogo(true)}
          />
          {!hasLogo && (
            <p className="text-xs text-gray-400">Foto del local (requerida)</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
          <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            {email}
          </p>
        </div>

        <Input
          label="Nombre del local"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: La Panadería de Juan"
          required
        />

        <Input
          label="Dirección (opcional)"
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
        />

        <PhoneInput
          label="Teléfono"
          value={telefono}
          onChange={setTelefono}
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Guardar y continuar
        </Button>
      </form>
    </Card>
  );
}
