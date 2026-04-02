"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <main className="px-4 pt-6 pb-8 sm:pt-8">
      <Card className="w-full max-w-md mx-auto p-6 sm:p-8">
        <h1 className="mb-8 text-2xl font-bold text-text-primary">Nuevo cupón</h1>

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
            <p className="mb-2 text-sm font-medium text-text-primary">Días válidos</p>
            <div className="flex gap-2 flex-wrap">
              {DIAS.map((dia) => {
                const active = todosLosDias || diasValidos.includes(dia.value);
                return (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border-default bg-surface text-text-muted hover:border-border-strong"
                    }`}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-text-muted">
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
                className="mt-1 text-xs text-primary hover:underline"
              >
                Seleccionar todos los días
              </button>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Crear cupón
          </Button>
        </form>
      </Card>
    </main>
  );
}
