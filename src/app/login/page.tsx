"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function IconClock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "pending-approval" | "otp">("email");
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
    <main className="min-h-screen flex flex-col items-center px-4 pt-12 pb-16 relative overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-300/40 blur-3xl" />

      <div className="w-full max-w-md relative my-auto animate-[fade-up_0.45s_ease-out_both]">
        {/* Back link */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Inicio
          </Link>
        </div>

        {/* Brand */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Qupón"
              width={88}
              height={88}
              className="rounded-3xl shadow-2xl shadow-violet-500/30 ring-4 ring-white/60"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h1>
          <p className="text-gray-500 text-sm">Accedé al dashboard de tu negocio</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-xl shadow-violet-100/50 p-6 sm:p-8">
          {step === "pending-approval" ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                  <IconClock />
                </div>
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">Solicitud en revisión</h2>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4 leading-relaxed">
                Tu solicitud está siendo revisada. Te avisaremos por email cuando sea aprobada — ahí recibirás un link directo para completar tu registro.
              </p>
              <button
                type="button"
                onClick={() => { setStep("email"); setEmail(""); setError(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline cursor-pointer"
              >
                Usar otro email
              </button>
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Acceder
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-3 bg-violet-50 rounded-xl mb-2">
                <p className="text-sm text-violet-700">
                  Código enviado a{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              </div>
              <Input
                label="Código de acceso"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Ingresar
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setError(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline cursor-pointer"
              >
                Cambiar email
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
