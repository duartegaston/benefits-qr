import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

async function verifyOnboardingLink(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;

  if (!token) redirect("/login?error=invalid");

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date() || session.userType !== UserType.LOCAL) {
    redirect("/login?error=expired");
  }

  await prisma.session.delete({ where: { token } });
  const newSession = await createSession(session.userId, UserType.LOCAL);

  const cookieStore = await cookies();
  cookieStore.set("local_session", newSession.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect("/onboarding");
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center justify-center px-4 relative">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/25 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-soft/80 blur-3xl hidden sm:block" />

        <div className="w-full max-w-sm text-center animate-[fade-up_0.45s_ease-out_both] lg:max-w-xs 2xl:max-w-sm">
          <div className="mb-6 flex justify-center lg:mb-5 2xl:mb-6">
            <div className="w-20 lg:w-[4.5rem] 2xl:w-20">
              <Image
                src="/logo.png"
                alt="Qupón"
                width={250}
                height={180}
                className="w-full h-auto"
              />
            </div>
          </div>

        <Card className="border-surface/80 bg-surface/90 p-8 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md lg:p-6 2xl:p-8">
          <div className="mb-6 flex justify-center lg:mb-5 2xl:mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
              <BadgeCheck aria-hidden="true" className="h-7 w-7 text-primary" />
            </div>
          </div>
          <SectionHeader
            eyebrow="Registro del negocio"
            title="¡Tu acceso fue aprobado!"
            description="Hacé clic para completar la configuración de tu negocio"
            align="center"
            className="!mb-6 lg:!mb-5 2xl:!mb-6"
          />

          <form action={verifyOnboardingLink}>
            <input type="hidden" name="token" value={token ?? ""} />
            <Button type="submit" className="w-full" size="lg">
              Completar mi registro →
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
