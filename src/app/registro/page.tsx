import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import Image from "next/image";
import Button from "@/components/ui/Button";

async function verifyOnboardingLink(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;

  if (!token) redirect("/login?error=invalid");

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date() || session.userType !== "LOCAL") {
    redirect("/login?error=expired");
  }

  await prisma.session.delete({ where: { token } });
  const newSession = await createSession(session.userId, "LOCAL");

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
      {/* Decorative blobs — desktop only */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/25 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-soft/80 blur-3xl hidden sm:block" />

      <div className="w-full max-w-sm text-center animate-[fade-up_0.45s_ease-out_both]">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Qupón"
            width={80}
            height={80}
            className="rounded-3xl shadow-2xl shadow-primary/30 ring-4 ring-surface/60"
          />
        </div>

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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">¡Tu acceso fue aprobado!</h1>
          <p className="text-sm text-text-muted mb-6">
            Hacé clic para completar la configuración de tu local
          </p>

          <form action={verifyOnboardingLink}>
            <input type="hidden" name="token" value={token ?? ""} />
            <Button type="submit" className="w-full" size="lg">
              Completar mi registro →
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
