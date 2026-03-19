"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import Button from "./ui/Button";

type Channel = "email" | "whatsapp";
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

    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body =
      channel === "email"
        ? { email, code: otp }
        : { phone, code: otp };

    const res = await fetch("/api/auth/cliente/verify-otp", {
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

    router.push(data.redirect || "/mis-beneficios");
  }

  if (step === "otp") {
    const contact = channel === "email" ? email : phone;
    const via = channel === "email" ? "email" : "WhatsApp";

    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="text-center mb-2">
          <p className="text-sm text-gray-600">
            Te enviamos un código por {via} a <strong>{contact}</strong>
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
          onClick={() => { setChannel("whatsapp"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            channel === "whatsapp"
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
