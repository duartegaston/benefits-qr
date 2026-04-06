import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Image from "next/image";
import { ArrowLeft, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import ClienteLoginForm from "@/components/cliente/acceso/ClienteLoginForm";

async function verifyMagicLink(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;

  if (!token) redirect("/acceso?error=invalid");

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date() || session.userType !== UserType.CLIENTE) {
    redirect("/acceso?error=expired");
  }

  await prisma.session.delete({ where: { token } });
  const newSession = await createSession(session.userId, UserType.CLIENTE);

  const cookieStore = await cookies();
  cookieStore.set("cliente_session", newSession.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect("/mis-beneficios");
}

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const session = await getClienteSessionFromCookies();

  if (!token && session?.userType === UserType.CLIENTE) {
    redirect("/mis-beneficios");
  }

  const errorMessage =
    error === "invalid"
      ? "Ese enlace no es válido. Pedí uno nuevo para ingresar a tus cupones."
      : error === "expired"
        ? "Ese enlace venció o ya fue usado. Pedí uno nuevo para ingresar a tus cupones."
        : null;

  const pageTitle = token ? "Tu acceso está listo" : "Mis cupones";
  const pageDescription = token
    ? "Entrá para ver los beneficios que ya guardaste."
    : "Ingresá con tu email para recuperar tus beneficios guardados.";

  return (
    <main className="relative min-h-screen overflow-x-hidden sm:overflow-hidden flex flex-col items-center px-4 py-14">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/25 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-soft/80 blur-3xl hidden sm:block" />

      <LinkButton
        href="/"
        variant="subtle"
        size="sm"
        className="absolute top-5 left-5 sm:top-6 sm:left-6 z-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Inicio
      </LinkButton>

      <div className="my-auto w-full max-w-md">
        <Reveal y={14} amount={0.3}>
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <div className="w-24">
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
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              {pageTitle}
            </h1>
            <p className="text-text-muted text-sm">{pageDescription}</p>
          </div>
        </Reveal>

        {!token && errorMessage ? (
          <Reveal delay={0.03} y={14} amount={0.35} className="mb-4">
            <div
              role="alert"
              className="rounded-2xl border border-danger-border bg-danger-soft/50 px-4 py-3 text-left text-sm text-danger"
            >
              {errorMessage}
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.06} y={16} amount={0.35}>
          {token ? (
            <Card className="bg-surface/90 sm:bg-surface/80 sm:backdrop-blur-md border-surface/80 shadow-xl shadow-primary-soft/60 p-6 sm:p-8">
              <div className="space-y-5 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-soft to-primary-soft/70 flex items-center justify-center text-primary shadow-sm">
                    <Mail className="w-8 h-8" aria-hidden="true" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge color="info">Enlace listo para usar</Badge>
                  <h2 className="text-lg font-semibold text-text-primary">
                    ¡Tu Qupón llegó!
                  </h2>
                  <p className="text-sm text-text-muted">
                    Hacé clic para acceder a tus cupones guardados.
                  </p>
                </div>

                <form action={verifyMagicLink} className="pt-1">
                  <input type="hidden" name="token" value={token} />
                  <Button type="submit" className="w-full" size="lg">
                    Ver mis cupones
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <ClienteLoginForm />
          )}
        </Reveal>
      </div>
    </main>
  );
}
