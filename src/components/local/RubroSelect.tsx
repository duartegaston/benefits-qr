"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface Rubro {
  id: number;
  nombre: string;
}

interface RubroSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function RubroSelect({ value, onChange, required }: RubroSelectProps) {
  const [rubros, setRubros] = useState<Rubro[]>([]);

  useEffect(() => {
    fetch("/api/rubros")
      .then((r) => r.json())
      .then((data: Rubro[]) => setRubros(data));
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">
        Rubro{required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccioná un rubro" />
        </SelectTrigger>
        <SelectContent>
          {rubros.map((r) => (
            <SelectItem key={r.id} value={String(r.id)}>
              {r.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
