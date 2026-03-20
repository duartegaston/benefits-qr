"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import Button from "./ui/Button";
import PhoneInput from "./ui/PhoneInput";

type Channel = "email" | "whatsapp";
type Step = "form" | "otp";

export default function ReclamarForm({ beneficioId }: { beneficioId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [channel, setChannel] = useState<Channel>("email");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+54");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(selectedChannel: Channel) {
    setError("");
    setLoading(true);
    setChannel(selectedChannel);

    const res = await fetch("/api/reclamos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beneficioId, nombre, email, phone, channel: selectedChannel }),
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

    const body = channel === "email" ? { email, code: otp } : { phone, code: otp };

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
    <div className="space-y-4">
      <Input
        label="Tu nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Juan Pérez"
        required
      />
      <Input
        label="Tu email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />
      <PhoneInput
        label="Tu WhatsApp"
        value={phone}
        onChange={setPhone}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button
          type="button"
          loading={loading && channel === "email"}
          disabled={loading}
          onClick={() => handleSubmit("email")}
          className="flex-1"
          size="lg"
        >
          Recibir código por Email
        </Button>
        <Button
          type="button"
          loading={loading && channel === "whatsapp"}
          disabled={loading}
          onClick={() => handleSubmit("whatsapp")}
          className="flex-1"
          size="lg"
          variant="secondary"
        >
          Recibir código por WhatsApp
        </Button>
      </div>
    </div>
  );
}
