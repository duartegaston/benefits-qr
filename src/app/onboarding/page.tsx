import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== "LOCAL") {
    redirect("/login");
  }

  const local = await prisma.local.findUnique({ where: { id: session.userId } });
  if (!local) redirect("/login");

  if (local.nombre !== null) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-200/70 blur-3xl" />
      <div className="animate-[fade-up_0.45s_ease-out_both] relative w-full flex flex-col items-center">
        <div className="mb-6">
          <Image src="/logo.png" alt="Qupón" width={96} height={96} className="rounded-3xl shadow-xl shadow-violet-300/50" />
        </div>
        <OnboardingForm localId={local.id} email={local.email} logoUrl={local.logoUrl} />
      </div>
    </main>
  );
}
