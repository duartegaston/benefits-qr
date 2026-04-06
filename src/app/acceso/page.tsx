import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ClienteLoginForm from "@/components/cliente/ClienteLoginForm";

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

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-14 relative">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/25 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-soft/80 blur-3xl hidden sm:block" />

      <div className="my-auto w-full max-w-md text-center animate-[fade-up_0.45s_ease-out_both]">
        <div className="flex justify-center mb-6">
          <div className="w-20">
            <Image
              src="/logo.png"
              alt="Qupón"
              width={250}
              height={180}
              className="w-full h-auto"
            />
          </div>
        </div>

        {token ? (
          <div className="bg-surface/90 sm:bg-surface/80 sm:backdrop-blur-md rounded-2xl border border-surface/80 shadow-xl shadow-primary-soft/60 p-8">
            <div className="w-14 h-14 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                aria-hidden="true"
                className="w-7 h-7 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">¡Tu Qupón llegó!</h1>
            <p className="text-sm text-text-muted mb-6">
              Hacé clic para acceder a tus cupones guardados
            </p>

            <form action={verifyMagicLink}>
              <input type="hidden" name="token" value={token} />
              <Button type="submit" className="w-full" size="lg">
                Ver mis cupones →
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMessage ? (
              <div className="rounded-2xl border border-danger-border bg-danger-soft/50 px-4 py-3 text-left text-sm text-danger">
                {errorMessage}
              </div>
            ) : null}
            <ClienteLoginForm />
          </div>
        )}

        <Link
          href="/"
          className="block mt-4 text-sm text-text-muted/80 hover:text-text-muted transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
