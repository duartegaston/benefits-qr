"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
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
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-100/50 blur-3xl" />

      <div className="w-full max-w-md relative animate-[fade-up_0.45s_ease-out_both]">
        {/* Brand mark */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30 mb-4">
            <svg aria-hidden="true" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4-6h2v2h-2v-2zm2 2h2v2h-2v-2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">BenefitQR</h1>
          <p className="text-gray-500 text-sm mt-1">Accedé al dashboard de tu local</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-8">
          {step === "email" ? (
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
                Enviar código
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
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
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
