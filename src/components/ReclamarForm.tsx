"use client";
import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function ReclamarForm({ beneficioId }: { beneficioId: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/reclamos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beneficioId, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            aria-hidden="true"
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="font-semibold text-green-800">¡Beneficio reclamado!</p>
        <p className="text-green-600 text-sm mt-1">
          Revisá tu email para acceder a tu QR
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tu email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        error={error}
        required
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Reclamar beneficio
      </Button>
    </form>
  );
}
