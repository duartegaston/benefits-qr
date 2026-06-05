"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo iniciar sesión");
      return;
    }

    router.refresh();
    router.replace("/admin");
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-14">
      <div className="my-auto w-full max-w-md">
        <Reveal y={10} amount={0.3}>
          <SectionHeader
            eyebrow="Administración"
            title="Panel global Qupon"
            description="Ingresá con credenciales de administrador para ver métricas globales."
            align="center"
            className="!mb-6"
          />
        </Reveal>

        <Reveal delay={0.06} y={14} amount={0.35}>
          <Card className="border-surface/80 bg-surface/90 p-6 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Ingresar al admin
              </Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </main>
  );
}
