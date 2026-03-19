"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoUpload from "@/components/LogoUpload";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface OnboardingFormProps {
  localId: string;
  logoUrl?: string | null;
}

export default function OnboardingForm({ logoUrl }: OnboardingFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
        <div className="flex justify-center mb-2">
          <LogoUpload currentLogoUrl={logoUrl} nombre={nombre || "?"} />
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

        <Input
          label="Teléfono (opcional)"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej: +54 11 1234-5678"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Guardar y continuar
        </Button>
      </form>
    </Card>
  );
}
