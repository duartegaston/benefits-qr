"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-200/70 blur-3xl" />

      <div className="w-full max-w-md relative animate-[fade-up_0.45s_ease-out_both]">
        {/* Brand mark */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Qupón" width={120} height={120} className="rounded-3xl shadow-xl shadow-violet-300/50" />
          </div>
          <p className="text-gray-500 text-sm mt-1">Accedé al dashboard de tu local</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-6 sm:p-8">
          {step === "pending-approval" ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                  ⏳
                </div>
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">Solicitud en revisión</h2>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4 leading-relaxed">
                Tu solicitud está siendo revisada. Recibirás tu código de acceso por email una vez que sea aprobada.
              </p>
              <button
                type="button"
                onClick={() => { setStep("otp"); setError(""); }}
                className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Ya recibí mi código
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setEmail(""); setError(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
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
