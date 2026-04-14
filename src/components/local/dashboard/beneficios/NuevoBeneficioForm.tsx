"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  BENEFICIO_WEEKDAYS,
  formatDiasValidosSentence,
  sortDiasValidos,
} from "@/lib/beneficioSchedule";
import { cn } from "@/lib/utils";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NuevoBeneficioForm() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [maxUsos, setMaxUsos] = useState("");
  const [diasValidos, setDiasValidos] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const minDate = getTodayDateString();
  const todosLosDias = diasValidos.length === 0;

  const diasSeleccionados = useMemo(() => sortDiasValidos(diasValidos), [diasValidos]);

  function handleDiaToggle(value: number) {
    setDiasValidos((prev) => {
      if (prev.length === 0) {
        return [value];
      }

      if (prev.includes(value)) {
        const next = prev.filter((day) => day !== value);
        return next.length === 0 ? [] : next;
      }

      return [...prev, value];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fechaExpiracion) {
      setError("Seleccioná una fecha de expiración.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/beneficios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion,
        fechaExpiracion,
        maxUsos: maxUsos ? parseInt(maxUsos, 10) : undefined,
        diasValidos,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        eyebrow="Nuevo cupón"
        title="Creá un beneficio"
        description="Completá la información básica y elegí cómo querés manejar la vigencia."
        align="left"
        className="!mb-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Descripción"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Ej: 20% de descuento en todos los productos"
            required
          />
        </div>

        <DatePicker
          label="Fecha de expiración"
          value={fechaExpiracion}
          onChange={setFechaExpiracion}
          min={minDate}
          required
        />

        <Input
          label="Máximo de usos"
          type="number"
          value={maxUsos}
          onChange={(event) => setMaxUsos(event.target.value)}
          placeholder="Sin límite si se deja vacío"
          min="1"
          inputMode="numeric"
        />
      </div>

      <section className="rounded-2xl border border-border-default/80 bg-surface-muted/50 p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="rounded-xl bg-primary-soft p-2 text-primary">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary">Días disponibles</h2>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={todosLosDias ? "primary" : "secondary"}
              size="sm"
              onClick={() => setDiasValidos([])}
            >
              Todos los días
            </Button>

            {BENEFICIO_WEEKDAYS.map((day) => {
              const selected = !todosLosDias && diasValidos.includes(day.value);

              return (
                <Button
                  key={day.value}
                  type="button"
                  variant={selected ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleDiaToggle(day.value)}
                  aria-pressed={selected}
                  className={cn("min-w-12 px-3", todosLosDias && "border-dashed")}
                >
                  {day.shortLabel}
                </Button>
              );
            })}
          </div>

          <p className="text-sm text-text-muted">
            {formatDiasValidosSentence(diasSeleccionados, {
              emptyLabel: "Aplica todos los días.",
              prefix: "Aplica los",
            })}
          </p>

          {!todosLosDias ? (
            <p className="text-xs text-text-muted">
              Tocá un día para quitarlo. Si desmarcás el último, vuelve a “Todos los días”.
            </p>
          ) : null}
        </div>
      </section>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard") }>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="sm:min-w-40">
          Crear cupón
        </Button>
      </div>
    </form>
  );
}
