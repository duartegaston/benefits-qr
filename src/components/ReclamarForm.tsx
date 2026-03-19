"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import Button from "./ui/Button";

type Channel = "email" | "sms";
type Step = "form" | "otp" | "done";

export default function ReclamarForm({ beneficioId }: { beneficioId: string }) {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("email");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nombre, setNombre] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body =
      channel === "email"
        ? { beneficioId, email }
        : { beneficioId, phone, nombre };

    const res = await fetch("/api/reclamos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    if (data.requiresOtp) {
      setStep("otp");
    } else {
      setStep("done");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/cliente/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push(data.redirect || "/mis-beneficios");
  }

  if (step === "done") {
    return (
      <div className="bg-green-50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg aria-hidden="true" className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-green-800">¡Beneficio reclamado!</p>
        <p className="text-green-600 text-sm mt-1">Revisá tu email para acceder a tu QR</p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="text-center mb-2">
          <p className="text-sm text-gray-600">
            Te enviamos un código por WhatsApp a <strong>{phone}</strong>
          </p>
        </div>
        <Input
          label="Código de verificación"
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          error={error}
          maxLength={6}
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Verificar código
        </Button>
        <button
          type="button"
          onClick={() => { setStep("form"); setOtp(""); setError(""); }}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Channel tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => { setChannel("email"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            channel === "email"
              ? "bg-violet-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => { setChannel("sms"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            channel === "sms"
              ? "bg-violet-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          WhatsApp
        </button>
      </div>

      {channel === "email" ? (
        <Input
          label="Tu email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          error={error}
          required
        />
      ) : (
        <>
          <Input
            label="Tu nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
          <Input
            label="Tu WhatsApp"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+5411XXXXXXXX"
            error={error}
            required
          />
        </>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Reclamar beneficio
      </Button>
    </form>
  );
}
