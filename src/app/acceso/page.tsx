import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import { ArrowLeft, Mail } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
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
    ? "Entrá para ver los cupónes que ya guardaste."
    : "Ingresá con tu email para recuperar tus cupónes guardados.";

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

      <div className="my-auto w-full max-w-md lg:max-w-sm 2xl:max-w-md">
        <Reveal y={14} amount={0.3}>
          <div className="mb-7 text-center lg:mb-6 2xl:mb-7">
            <div className="mb-4 flex justify-center lg:mb-3.5 2xl:mb-4">
              <BrandLogo priority />
            </div>

            <SectionHeader
              eyebrow="Acceso Cliente"
              title={pageTitle}
              description={pageDescription}
              className="mb-0"
            />
          </div>
        </Reveal>

        {!token && errorMessage ? (
          <Reveal delay={0.03} y={14} amount={0.35} className="mb-4">
            <div
              role="alert"
              className="rounded-2xl border border-danger-border bg-danger-soft/50 px-4 py-3 text-left text-sm text-danger lg:px-3.5 lg:py-2.5 lg:text-[13px] 2xl:px-4 2xl:py-3 2xl:text-sm"
            >
              {errorMessage}
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.06} y={16} amount={0.35}>
          {token ? (
            <Card className="border-surface/80 bg-surface/90 p-6 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md sm:p-8 lg:p-6 2xl:p-8">
              <div className="space-y-5 text-center lg:space-y-4 2xl:space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-soft to-primary-soft/70 flex items-center justify-center text-primary shadow-sm">
                    <Mail className="w-8 h-8" aria-hidden="true" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-text-primary lg:text-base 2xl:text-lg">
                    ¡Tu Qupon llegó!
                  </h2>
                  <p className="text-sm text-text-muted lg:text-[13px] 2xl:text-sm">
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
