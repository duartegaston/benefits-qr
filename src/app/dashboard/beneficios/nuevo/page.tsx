"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function NuevoBeneficioPage() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [maxUsos, setMaxUsos] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/beneficios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion,
        fechaExpiracion,
        maxUsos: maxUsos ? parseInt(maxUsos) : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo beneficio</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: 20% de descuento en todos los productos"
            required
          />
          <Input
            label="Fecha de expiración"
            type="date"
            value={fechaExpiracion}
            onChange={(e) => setFechaExpiracion(e.target.value)}
            required
          />
          <Input
            label="Máximo de usos (opcional)"
            type="number"
            value={maxUsos}
            onChange={(e) => setMaxUsos(e.target.value)}
            placeholder="Sin límite si se deja vacío"
            min="1"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Crear beneficio
          </Button>
        </form>
      </Card>
    </main>
  );
}
