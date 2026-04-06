"use client";
import { useState } from "react";
import { Mail } from "lucide-react";
import Card, { CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

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
      <Card className="w-full max-w-md bg-surface/90 sm:bg-surface/80 sm:backdrop-blur-md border-surface/80 shadow-xl shadow-primary-soft/60">
        <CardContent className="p-6 sm:p-8">
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-soft to-primary-soft/70 flex items-center justify-center text-primary shadow-sm">
                  <Mail className="w-8 h-8" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-2">
                <Badge color="info">
                  Link enviado
                </Badge>
                <h2 className="text-lg font-semibold text-text-primary">
                  Revisá tu email
                </h2>
              </div>
              <div className="rounded-2xl bg-primary-soft/80 px-4 py-3 text-sm leading-relaxed text-accent">
                Te enviamos un link a <strong>{email}</strong>. Hacé clic en él para
                acceder a tus cupones.
              </div>
            <Button
              type="button"
              variant="muted"
              size="sm"
              onClick={() => {
                setStep("form");
                setEmail("");
                setError("");
              }}
              className="w-full"
            >
              Usar otro email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-surface/90 sm:bg-surface/80 sm:backdrop-blur-md border-surface/80 shadow-xl shadow-primary-soft/60">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
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
