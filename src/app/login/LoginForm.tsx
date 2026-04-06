"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Clock3, Mail } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "pending-approval" | "otp">(
    "email",
  );
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/local/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al enviar el código");
      return;
    }

    const data = await res.json();
    if (data.requiresApproval) {
      setStep("pending-approval");
      return;
    }
    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/local/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Código inválido");
      return;
    }

    router.push(data.redirect ?? "/dashboard");
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center px-4 py-8 relative">
      <div className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full bg-primary/20 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-125 h-125 rounded-full bg-primary-soft/70 blur-3xl hidden sm:block" />

      <LinkButton
        href="/"
        variant="subtle"
        size="sm"
        className="fixed top-5 left-5 sm:top-6 sm:left-6 z-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Inicio
      </LinkButton>

      <div className="w-full max-w-md flex-1 flex flex-col justify-center relative">
        <Reveal y={14} amount={0.3}>
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <div className="w-24">
                <Image
                  src="/logo.png"
                  alt="Qupón"
                  width={500}
                  height={450}
                  priority
                  className="w-full h-auto"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Bienvenido
            </h1>
            <p className="text-text-muted text-sm">
              Accedé al dashboard de tu negocio
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.06} y={16} amount={0.35}>
          <Card className="bg-surface/90 sm:bg-surface/80 sm:backdrop-blur-md border-surface/80 shadow-xl shadow-primary-soft/60 p-6 sm:p-8">
            {step === "pending-approval" ? (
              <div className="space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-warning-soft to-warning-soft/70 border border-warning-border/70 flex items-center justify-center text-warning shadow-sm">
                    <Clock3 className="w-8 h-8" aria-hidden="true" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="inline-flex items-center rounded-full border border-warning-border bg-warning-soft px-3 py-1 text-xs font-medium text-warning">
                    Pendiente de aprobación
                  </p>
                  <h2 className="font-semibold text-text-primary text-lg">
                    Solicitud en revisión
                  </h2>
                </div>
                <div className="rounded-xl border border-warning-border/70 bg-warning-soft/80 p-4 text-sm text-warning leading-relaxed">
                  Tu solicitud está siendo revisada. Te avisaremos por email
                  cuando sea aprobada y ahí vas a recibir un link directo para
                  completar tu registro.
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>{email}</span>
                </div>
                <Button
                  type="button"
                  variant="muted"
                  size="sm"
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                    setError("");
                  }}
                  className="w-full"
                >
                  Usar otro email
                </Button>
              </div>
            ) : step === "email" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Acceder
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center p-3 bg-primary-soft rounded-xl mb-2">
                  <p className="text-sm text-accent">
                    Código enviado a{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                </div>
                <Input
                  label="Código de acceso"
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  inputMode="numeric"
                  required
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Ingresar
                </Button>
                <Button
                  type="button"
                  variant="muted"
                  size="sm"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  className="w-full"
                >
                  Cambiar email
                </Button>
              </form>
            )}
          </Card>
        </Reveal>
      </div>
    </main>
  );
}
