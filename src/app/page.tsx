import Image from "next/image";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Gift,
  QrCode,
  Smartphone,
  Store,
} from "lucide-react";
import HowItWorks from "@/components/landing/HowItWorks";
import Playbooks from "@/components/landing/Playbooks";
import Pricing from "@/components/landing/Pricing";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";

const FEATURES = [
  { icon: <QrCode className="h-4 w-4" aria-hidden="true" />, label: "Canje con QR" },
  {
    icon: <Smartphone className="h-4 w-4" aria-hidden="true" />,
    label: "Sin app extra",
  },
  { icon: <Store className="h-4 w-4" aria-hidden="true" />, label: "Cualquier negocio" },
];

export default function Home() {
  return (
    <main className="relative">
      {/* Hero — full viewport section */}
      <section className="min-h-screen flex flex-col items-center px-6 pt-14 pb-16 sm:px-8 sm:py-8 relative overflow-hidden">
        {/* Background blobs — desktop only (blur-3xl causes scroll jank on mobile) */}
        <div className="pointer-events-none absolute -top-56 -left-56 w-200 h-200 rounded-full bg-primary/25 blur-3xl hidden sm:block" />
        <div className="pointer-events-none absolute -bottom-56 -right-56 w-175 h-175 rounded-full bg-accent-soft/80 blur-3xl hidden sm:block" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full bg-surface/25 blur-3xl hidden sm:block" />

        <div className="max-w-2xl w-full text-center relative z-10 my-auto">
          {/* Logo */}
          <Reveal y={14} amount={0.1} className="flex justify-center mb-7">
            <Image
              src="/logo.png"
              alt="Qupón"
              width={96}
              height={96}
              priority
              className="rounded-3xl shadow-2xl shadow-primary/35 ring-4 ring-surface/60"
            />
          </Reveal>

          {/* Badge */}
          <Reveal delay={0.06} y={16} amount={0.2}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/85 sm:bg-surface/65 sm:backdrop-blur-sm border border-border-default/70 text-accent text-sm font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse motion-reduce:animate-none shrink-0" />
              Plataforma de cupones digitales con QR
            </span>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.14} y={18} amount={0.2}>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-[1.15] tracking-tight mt-6 mb-4">
              Cupones que{" "}
              <span className="bg-linear-to-r from-primary via-accent to-border-strong bg-clip-text text-transparent">
                conectan negocios
              </span>
              <br className="hidden sm:block" /> con sus clientes
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.22} y={18} amount={0.2}>
            <p className="text-lg text-text-muted max-w-md mx-auto leading-relaxed">
              Creá cupones de descuento, compartí el link y canjeá al instante con
              QR desde el celular.
            </p>
          </Reveal>

          {/* Feature pills */}
          <Reveal delay={0.3} y={20} amount={0.2} className="mt-6 mb-10">
            <div className="flex flex-wrap justify-center gap-2">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface/90 sm:bg-surface/70 sm:backdrop-blur-sm rounded-full border border-border-default/60 text-sm text-text-primary font-medium shadow-sm"
              >
                {f.icon}
                {f.label}
              </span>
            ))}
            </div>
          </Reveal>

          {/* CTA Cards */}
          <Reveal delay={0.38} y={22} amount={0.15}>
            <div className="grid sm:grid-cols-2 gap-4">
            {/* Para Negocios */}
            <div className="group bg-surface/90 sm:bg-surface/75 sm:backdrop-blur-md rounded-2xl p-6 border border-surface/80 shadow-lg shadow-primary-soft/70 text-left hover:shadow-xl hover:shadow-accent-soft hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center mb-4 text-primary">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-semibold text-text-primary mb-1.5">
                Para Negocios
              </h2>
              <p className="text-text-muted text-sm mb-5 leading-relaxed">
                Registrá tu negocio, creá cupones y gestioná los canjes.
              </p>
              <LinkButton href="/login">
                Ingresar
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkButton>
            </div>

            {/* Para Clientes */}
            <div className="group bg-primary rounded-2xl p-6 border border-primary-foreground/20 shadow-lg shadow-primary/30 text-left hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 hover:bg-accent transition-[transform,box-shadow,background-color] duration-300">
              <div className="w-11 h-11 rounded-xl bg-surface/20 flex items-center justify-center mb-4 text-primary-foreground">
                <Gift className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-semibold text-primary-foreground mb-1.5">Para Clientes</h2>
              <p className="text-primary-foreground/80 text-sm mb-5 leading-relaxed">
                Accedé a todos tus cupones y descuentos en un solo lugar.
              </p>
              <LinkButton href="/mis-beneficios" variant="light">
                Ver mis cupones
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkButton>
            </div>
            </div>
          </Reveal>
        </div>

        <Reveal
          delay={0.46}
          y={14}
          amount={0.15}
          className="pointer-events-none z-10 mt-8 flex flex-col items-center gap-1 text-text-muted sm:absolute sm:bottom-5 sm:left-1/2 sm:mt-0 sm:-translate-x-1/2"
        >
          <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em]">
            Más información abajo
          </span>
          <ChevronDown
            aria-hidden="true"
            className="h-4.5 w-4.5 animate-bounce motion-reduce:animate-none"
          />
        </Reveal>
      </section>

      <HowItWorks />
      <Playbooks />
      <Pricing />

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
