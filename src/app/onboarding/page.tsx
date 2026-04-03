import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import OnboardingForm from "@/components/local/onboarding/OnboardingForm";
import Reveal from "@/components/ui/Reveal";

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
    <main className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute -top-32 -left-32 hidden h-120 w-120 rounded-full bg-primary/25 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 hidden h-120 w-120 rounded-full bg-primary-soft/80 blur-3xl sm:block" />

      <div className="relative mx-auto my-auto flex w-full max-w-md flex-col items-center">
        <Reveal y={12} amount={0.2} className="mb-5 sm:mb-6">
          <Image
            src="/logo.png"
            alt="Qupón"
            width={88}
            height={88}
            priority
            className="rounded-3xl shadow-xl shadow-primary/30"
          />
        </Reveal>

        <Reveal delay={0.06} y={14} amount={0.25} className="w-full">
          <OnboardingForm localId={local.id} email={local.email} logoUrl={local.logoUrl} />
        </Reveal>
      </div>
    </main>
  );
}
