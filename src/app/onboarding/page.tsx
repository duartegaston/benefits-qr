import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getLocalLogoDisplayUrl } from "@/lib/localLogoSource";
import { prisma } from "@/lib/prisma";
import { UserType } from "@/lib/enums";
import OnboardingForm from "@/components/local/onboarding/OnboardingForm";
import BrandLogo from "@/components/ui/BrandLogo";
import Reveal from "@/components/ui/Reveal";

export default async function OnboardingPage() {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }

  const local = await prisma.local.findUnique({ where: { id: session.userId } });
  if (!local) redirect("/login");

  if (local.nombre !== null) {
    redirect("/dashboard");
  }

  const initialLogoSrc = getLocalLogoDisplayUrl({
    localId: local.id,
    logoUrl: local.logoUrl,
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute -top-32 -left-32 hidden h-120 w-120 rounded-full bg-primary/25 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 hidden h-120 w-120 rounded-full bg-primary-soft/80 blur-3xl sm:block" />

      <div className="relative mx-auto my-auto flex w-full max-w-md flex-col items-center lg:max-w-sm 2xl:max-w-md">
        <Reveal y={12} amount={0.2} className="mb-5 sm:mb-6 lg:mb-5 2xl:mb-6">
          <BrandLogo priority />
        </Reveal>

        <Reveal delay={0.06} y={14} amount={0.25} className="w-full">
          <OnboardingForm email={local.email} initialLogoSrc={initialLogoSrc} />
        </Reveal>
      </div>
    </main>
  );
}
