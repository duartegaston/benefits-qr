"use client";
import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import PhoneInput from "./ui/PhoneInput";

type Step = "form" | "sent";

export default function ReclamarForm({ beneficioId }: { beneficioId: string }) {
  const [step, setStep] = useState<Step>("form");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+54");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/reclamos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beneficioId, nombre, email, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setStep("sent");
  }

  if (step === "sent") {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-primary-soft rounded-full flex items-center justify-center mx-auto">
          <svg aria-hidden="true" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-text-primary">Revisá tu email</p>
          <p className="text-sm text-text-muted mt-1">
            Te enviamos un link a <strong>{email}</strong> para acceder a tu cupón.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setStep("form");
            setError("");
          }}
          className="h-auto p-0 text-sm text-text-muted hover:text-text-primary hover:bg-transparent"
        >
          ← Usar otro email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Tu nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Juan Pérez"
        required
      />
      <Input
        label="Tu email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />
      <PhoneInput
        label="Tu teléfono"
        value={phone}
        onChange={setPhone}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        Recibir link de acceso
      </Button>
    </form>
  );
}
