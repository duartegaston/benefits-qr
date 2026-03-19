"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

type Channel = "email" | "sms";

export default function ClienteLoginForm() {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp" | "sent">("form");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = channel === "email" ? { email } : { phone };

    const res = await fetch("/api/auth/cliente/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Hubo un error. Intentá de nuevo.");
      return;
    }

    setStep(channel === "email" ? "sent" : "otp");
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

  if (step === "sent") {
    return (
      <Card className="w-full max-w-md p-6 sm:p-8 text-center">
        <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg aria-hidden="true" className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Revisá tu email</h2>
        <p className="text-gray-500 text-sm">
          Te enviamos un enlace de acceso a <strong>{email}</strong>
        </p>
        <button
          onClick={() => { setStep("form"); setEmail(""); }}
          className="mt-6 text-sm text-violet-600 hover:underline"
        >
          Usar otro email
        </button>
      </Card>
    );
  }

  if (step === "otp") {
    return (
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ingresá el código</h2>
          <p className="text-gray-500 text-sm">
            Te enviamos un código por WhatsApp a <strong>{phone}</strong>
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
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
            Ingresar
          </Button>
          <button
            type="button"
            onClick={() => { setStep("form"); setOtp(""); setError(""); }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            ← Usar otro número
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis beneficios</h1>
        <p className="text-gray-500 text-sm">
          Ingresá tu email o WhatsApp para acceder
        </p>
      </div>

      {/* Channel tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input
            label="Tu WhatsApp"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+5411XXXXXXXX"
            error={error}
            required
          />
        )}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {channel === "email" ? "Enviar enlace de acceso" : "Enviar código"}
        </Button>
      </form>
    </Card>
  );
}
