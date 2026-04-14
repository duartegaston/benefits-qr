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
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";

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
    <main className="relative min-h-screen overflow-x-hidden sm:overflow-hidden flex flex-col items-center px-4 py-14">
      <div className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full bg-primary/20 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-125 h-125 rounded-full bg-primary-soft/70 blur-3xl hidden sm:block" />

      <LinkButton
        href="/"
        variant="subtle"
        size="sm"
        className="absolute top-5 left-5 sm:top-6 sm:left-6 z-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Inicio
      </LinkButton>

      <div className="my-auto w-full max-w-md lg:max-w-sm 2xl:max-w-md">
        <Reveal y={14} amount={0.3}>
          <div className="mb-7 text-center lg:mb-6 2xl:mb-7">
            <div className="mb-4 flex justify-center lg:mb-3.5 2xl:mb-4">
              <div className="w-24 lg:w-22 2xl:w-24">
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
            <SectionHeader
              eyebrow="Acceso del negocio"
              title="Bienvenido"
              description="Accedé al dashboard de tu negocio"
              align="center"
              className="!mb-0"
            />
          </div>
        </Reveal>

        <Reveal delay={0.06} y={16} amount={0.35}>
          <Card className="border-surface/80 bg-surface/90 p-6 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md sm:p-8 lg:p-6 2xl:p-8">
            {step === "pending-approval" ? (
              <div className="space-y-5 text-center lg:space-y-4 2xl:space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-warning-soft to-warning-soft/70 flex items-center justify-center text-warning shadow-sm">
                    <Clock3 className="w-8 h-8" aria-hidden="true" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge variant="warning">
                    Pendiente de aprobación
                  </Badge>
                  <h2 className="text-lg font-semibold text-text-primary lg:text-base 2xl:text-lg">
                    Solicitud en revisión
                  </h2>
                  <p className="text-sm text-text-muted lg:text-[13px] 2xl:text-sm">
                    Estamos validando tu negocio antes de habilitar el acceso.
                  </p>
                </div>
                <div className="rounded-2xl bg-warning-soft/80 px-4 py-3 text-sm leading-relaxed text-warning lg:px-3.5 lg:py-2.5 lg:text-[13px] 2xl:px-4 2xl:py-3 2xl:text-sm">
                  Tu solicitud está siendo revisada. Te avisaremos por email
                  cuando sea aprobada y ahí vas a recibir un link directo para
                  completar tu registro.
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted lg:text-[11px] 2xl:text-xs">
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
              <form onSubmit={handleRequestOtp} className="space-y-4 lg:space-y-3.5 2xl:space-y-4">
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
                  required
                />
                {error && <p className="text-sm text-danger lg:text-[13px] 2xl:text-sm">{error}</p>}
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
              <form onSubmit={handleVerifyOtp} className="space-y-4 lg:space-y-3.5 2xl:space-y-4">
                <div className="mb-2 rounded-2xl bg-primary-soft/80 px-4 py-3 text-center lg:px-3.5 lg:py-2.5 2xl:px-4 2xl:py-3">
                  <p className="text-sm text-accent lg:text-[13px] 2xl:text-sm">
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
                {error && <p className="text-sm text-danger lg:text-[13px] 2xl:text-sm">{error}</p>}
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
