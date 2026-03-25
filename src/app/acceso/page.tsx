import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

async function verifyMagicLink(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;

  if (!token) redirect("/mis-beneficios");

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date() || session.userType !== "CLIENTE") {
    redirect("/mis-beneficios");
  }

  await prisma.session.delete({ where: { token } });
  const newSession = await createSession(session.userId, "CLIENTE");

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
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center justify-center px-4 relative">
      {/* Decorative blobs — desktop only */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-400/25 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-300/40 blur-3xl hidden sm:block" />

      <div className="w-full max-w-sm text-center animate-[fade-up_0.45s_ease-out_both]">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Qupón"
            width={80}
            height={80}
            className="rounded-3xl shadow-2xl shadow-violet-500/30 ring-4 ring-white/60"
          />
        </div>

        <div className="bg-white/80 sm:backdrop-blur-md rounded-2xl border border-white/80 shadow-xl shadow-violet-100/50 p-8">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              aria-hidden="true"
              className="w-7 h-7 text-violet-600"
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
          <h1 className="text-xl font-bold text-gray-900 mb-2">¡Tu Qupón llegó!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Hacé clic para acceder a tus cupones guardados
          </p>

          <form action={verifyMagicLink}>
            <input type="hidden" name="token" value={token ?? ""} />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors cursor-pointer"
            >
              Ver mis cupones →
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="block mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
