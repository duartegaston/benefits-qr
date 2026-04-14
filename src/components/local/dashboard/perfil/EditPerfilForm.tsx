"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoUpload from "@/components/local/LogoUpload";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface EditPerfilFormProps {
  email: string;
  nombre: string;
  logoUrl?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

export default function EditPerfilForm({
  email,
  nombre: initialNombre,
  logoUrl: initialLogoUrl,
  direccion: initialDireccion,
  telefono: initialTelefono,
}: EditPerfilFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState(initialNombre ?? "");
  const [direccion, setDireccion] = useState(initialDireccion ?? "");
  const [telefono, setTelefono] = useState(initialTelefono ?? "+54");
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
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
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-surface/80 bg-surface/95 p-6 shadow-xl shadow-border-default/60 sm:bg-surface/85 sm:backdrop-blur-md sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="mb-1.5 flex flex-col items-center gap-1">
          <LogoUpload
            currentLogoUrl={logoUrl}
            nombre={nombre || "?"}
            onUploaded={(url) => setLogoUrl(url)}
          />
          <p className="text-center text-xs text-text-muted">
            Logo del local. Podés cambiarlo cuando quieras.
          </p>
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          readOnly
          aria-readonly="true"
          className="cursor-default border-border-default bg-surface-muted text-text-muted focus-visible:ring-2 focus-visible:ring-primary-soft"
        />

        <Input
          label="Nombre del local"
          type="text"
          name="nombre"
          autoComplete="organization"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: La Panadería de Juan"
          required
        />

        <Input
          label="Dirección"
          type="text"
          name="direccion"
          autoComplete="street-address"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
        />

        <PhoneInput
          label="Teléfono"
          name="telefono"
          autoComplete="tel"
          value={telefono}
          onChange={setTelefono}
          required
        />

        {error && (
          <p className="rounded-lg border border-danger-border bg-danger-soft px-3 py-2 text-sm font-medium text-danger" aria-live="polite">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Guardar cambios
        </Button>
      </form>
    </Card>
  );
}
