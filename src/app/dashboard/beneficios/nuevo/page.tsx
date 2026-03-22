"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const DIAS = [
  { label: "Dom", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mié", value: 3 },
  { label: "Jue", value: 4 },
  { label: "Vie", value: 5 },
  { label: "Sáb", value: 6 },
];

export default function NuevoBeneficioPage() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [maxUsos, setMaxUsos] = useState("");
  // Empty array = todos los días
  const [diasValidos, setDiasValidos] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleDia(value: number) {
    setDiasValidos((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

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
        diasValidos,
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

  const todosLosDias = diasValidos.length === 0;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Link href="/dashboard" className="fixed top-5 left-5 sm:top-6 sm:left-6 z-40 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Dashboard
      </Link>
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Nuevo cupón</h1>

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
            min={new Date().toLocaleDateString("en-CA")}
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

          {/* Días válidos */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Días válidos</p>
            <div className="flex gap-2 flex-wrap">
              {DIAS.map((dia) => {
                const active = todosLosDias || diasValidos.includes(dia.value);
                return (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      active
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"
                    }`}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {todosLosDias
                ? "Aplica todos los días"
                : `Aplica los: ${diasValidos
                    .sort((a, b) => a - b)
                    .map((d) => DIAS.find((x) => x.value === d)!.label)
                    .join(", ")}`}
            </p>
            {!todosLosDias && (
              <button
                type="button"
                onClick={() => setDiasValidos([])}
                className="text-xs text-violet-600 hover:underline mt-1"
              >
                Seleccionar todos los días
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Crear cupón
          </Button>
        </form>
      </Card>
    </main>
  );
}
