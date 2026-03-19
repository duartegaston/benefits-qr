import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-slate-50 relative overflow-hidden">
      <div className="hidden sm:block pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="hidden sm:block pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-100/50 blur-3xl" />
      <div className="animate-[fade-up_0.45s_ease-out_both] relative w-full flex justify-center">
        <OnboardingForm localId={local.id} logoUrl={local.logoUrl} />
      </div>
    </main>
  );
}
