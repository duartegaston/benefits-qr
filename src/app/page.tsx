import HowItWorks from "@/components/landing/HowItWorks";
import LandingAudienceCtas from "@/components/landing/LandingAudienceCtas";
import LandingHero from "@/components/landing/LandingHero";
import Playbooks from "@/components/landing/Playbooks";

export default function Home() {
  return (
    <main className="relative">
      <LandingHero />
      <LandingAudienceCtas />

      <HowItWorks />
      <Playbooks />
      { /* <Pricing /> */ }

      <footer className="bg-surface-soft border-t border-border-default py-6 px-6 text-center">
        <p className="text-sm text-text-muted/80">
          Creado por{" "}
          <a
            href="https://www.godevs.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-accent font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          >
            GODevs
          </a>
        </p>
      </footer>
    </main>
  );
}
