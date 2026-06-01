"use client";
import { useState } from "react";
import Card, { CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/cliente/shared/GoogleButton";
import ClienteMagicLinkSentState from "@/components/cliente/shared/ClienteMagicLinkSentState";

export default function ClienteLoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "sent">("form");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim();

    const res = await fetch("/api/auth/cliente/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Hubo un error. Intentá de nuevo.");
      return;
    }

    setEmail(normalizedEmail);
    setStep("sent");
  }

  if (step === "sent") {
    return (
      <Card className="w-full max-w-md border-surface/80 bg-surface/90 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md lg:max-w-sm 2xl:max-w-md">
        <CardContent className="p-6 sm:p-8 lg:p-6 2xl:p-8">
          <ClienteMagicLinkSentState
            email={email}
            description={<>Te enviamos un link a</>}
            onReset={() => {
              setStep("form");
              setEmail("");
              setError("");
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-surface/80 bg-surface/90 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md lg:max-w-sm 2xl:max-w-md">
      <CardContent className="p-6 sm:p-8 lg:p-6 2xl:p-8">
        <GoogleButton redirect="/mis-beneficios" />

        <div className="my-4 flex items-center gap-3 lg:my-3.5 2xl:my-4">
          <span className="h-px flex-1 bg-border-default" />
          <span className="text-xs text-text-muted">o con tu email</span>
          <span className="h-px flex-1 bg-border-default" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-3.5 2xl:space-y-4">
          <Input
            label="Email"
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
            enterKeyHint="send"
            error={error}
            required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Enviar link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
