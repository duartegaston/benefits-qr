"use client";
import { useState } from "react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function ClienteLoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "sent">("form");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/cliente/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Hubo un error. Intentá de nuevo.");
      return;
    }

    setStep("sent");
  }

  if (step === "sent") {
    return (
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <div className="w-14 h-14 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Revisá tu email</h2>
          <p className="text-text-muted text-sm mb-6">
            Te enviamos un link a <strong>{email}</strong>. Hacé clic en él para acceder a tus cupones.
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStep("form");
              setEmail("");
              setError("");
            }}
            className="h-auto p-0 text-sm text-text-muted hover:text-text-primary hover:bg-transparent"
          >
            ← Usar otro email
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Mis cupones</h1>
        <p className="text-text-muted text-sm">
          Ingresá tu email para recibir un link de acceso
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tu email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          error={error}
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Enviar link
        </Button>
      </form>
    </Card>
  );
}
