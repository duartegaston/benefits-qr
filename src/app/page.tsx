import HowItWorks from "@/components/landing/HowItWorks";
import LandingAudienceCtas from "@/components/landing/LandingAudienceCtas";
import LandingHero from "@/components/landing/LandingHero";
import Playbooks from "@/components/landing/Playbooks";
import PublicBenefitsSection from "@/components/public-benefits/PublicBenefitsSection";

export const revalidate = 60;

export default function Home() {
  return (
    <main className="relative">
      <LandingHero />
      <LandingAudienceCtas />

      <HowItWorks />
      <PublicBenefitsSection />
      <Playbooks />
      {/* <Pricing /> */}

      <footer className="bg-surface-soft border-t border-border-default py-6 px-6 text-center">
        <p className="text-sm text-text-muted/80">
          Creado por{" "}
          <a
            href="https://god.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full  py-1 font-semibold transition-[transform,opacity] duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
            aria-label="GOD, abre god.com.ar en una nueva pestaña"
          >
            <span className="text-black">G</span>
            <span className="text-black">O</span>
            <span className="text-primary">D</span>
          </a>
        </p>
      </footer>
    </main>
  );
}
