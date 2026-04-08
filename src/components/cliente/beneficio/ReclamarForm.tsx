"use client";
import { useState } from "react";
import { Ticket } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import ClienteMagicLinkSentState from "@/components/cliente/shared/ClienteMagicLinkSentState";

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

    const normalizedNombre = nombre.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const res = await fetch("/api/reclamos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beneficioId,
        nombre: normalizedNombre,
        email: normalizedEmail,
        phone,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setNombre(normalizedNombre);
    setEmail(normalizedEmail);
    setStep("sent");
  }

  if (step === "sent") {
    return (
      <ClienteMagicLinkSentState
        email={email}
        description={<>Te enviamos un link a</>}
        onReset={() => {
          setStep("form");
          setError("");
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={loading} className="space-y-4 disabled:opacity-100">
        <Input
          label="Tu nombre"
          type="text"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Juan Pérez"
          autoComplete="name"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="next"
          required
        />

        <Input
          label="Tu email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="email"
          enterKeyHint="next"
          required
        />

        <PhoneInput
          label="Tu teléfono"
          name="telefono"
          value={phone}
          onChange={setPhone}
          autoComplete="tel-national"
          enterKeyHint="send"
          required
        />
      </fieldset>

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-2xl border border-danger-border bg-danger-soft/60 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        <Ticket className="h-4 w-4" aria-hidden="true" />
        Recibir link de acceso
      </Button>
    </form>
  );
}
