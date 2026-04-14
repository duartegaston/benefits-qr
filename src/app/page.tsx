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
  {
    icon: <QrCode className="h-4 w-4" aria-hidden="true" />,
    label: "Canje con QR",
  },
  {
    icon: <Smartphone className="h-4 w-4" aria-hidden="true" />,
    label: "Sin app extra",
  },
  {
    icon: <Store className="h-4 w-4" aria-hidden="true" />,
    label: "Cualquier negocio",
  },
];

export default function Home() {
  return (
    <main className="relative">
      {/* Hero — full viewport section */}
      <section className="relative min-h-screen overflow-hidden px-6 pt-14 pb-16 lg:px-8 lg:py-5 2xl:py-8 flex flex-col items-center">
        {/* Background blobs — desktop only (blur-3xl causes scroll jank on mobile) */}
        <div className="pointer-events-none absolute -top-56 -left-56 hidden h-200 w-200 rounded-full bg-primary/25 blur-3xl lg:block" />
        <div className="pointer-events-none absolute -bottom-56 -right-56 hidden h-175 w-175 rounded-full bg-accent-soft/80 blur-3xl lg:block" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 hidden h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/25 blur-3xl lg:block" />

        <div className="relative z-10 my-auto w-full max-w-2xl text-center lg:max-w-xl 2xl:max-w-2xl">
          {/* Logo */}
          <Reveal y={14} amount={0.1} className="mb-7 flex justify-center lg:mb-4 2xl:mb-7">
            <div className="w-24 lg:w-20 2xl:w-24">
              <Image
                src="/logo.png"
                alt="Qupón"
                width={500}
                height={450}
                priority
                className="w-full h-auto"
              />
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.14} y={18} amount={0.2}>
            <h1 className="mt-6 mb-4 text-4xl leading-[1.15] font-bold tracking-tight text-text-primary lg:mt-4 lg:mb-3 lg:text-[2.45rem] lg:leading-[1.08] 2xl:mt-6 2xl:mb-4 2xl:text-5xl">
              Cupones que{" "}
              <span className="bg-linear-to-r from-primary via-accent to-border-strong bg-clip-text text-transparent">
                conectan negocios
              </span>
              <br className="hidden lg:block" /> con sus clientes
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.22} y={18} amount={0.2}>
            <p className="mx-auto max-w-md text-lg leading-relaxed text-text-muted lg:max-w-sm lg:text-sm 2xl:max-w-md 2xl:text-lg">
              Creá cupones de descuento, compartí el link y canjeá al instante
              con QR desde el celular.
            </p>
          </Reveal>

          {/* Feature pills */}
          <Reveal delay={0.3} y={20} amount={0.2} className="mt-6 mb-10 lg:mt-4 lg:mb-6 2xl:mt-6 2xl:mb-10">
            <div className="flex flex-wrap justify-center gap-2 lg:gap-1.5 2xl:gap-2">
              {FEATURES.map((f) => (
                <span
                  key={f.label}
                   className="inline-flex items-center gap-1.5 rounded-full border border-border-default/60 bg-surface/90 px-3.5 py-2 text-sm font-medium text-text-primary shadow-sm lg:gap-1 lg:bg-surface/70 lg:px-2.5 lg:py-1.5 lg:text-xs lg:backdrop-blur-sm 2xl:gap-1.5 2xl:px-3.5 2xl:py-2 2xl:text-sm"
                >
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </div>
          </Reveal>

          {/* CTA Cards */}
          <Reveal delay={0.38} y={22} amount={0.15}>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-2.5 2xl:gap-4">
              {/* Para Negocios */}
              <div className="group rounded-2xl border border-surface/80 bg-surface/90 p-6 text-left shadow-lg shadow-primary-soft/70 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-soft lg:bg-surface/75 lg:p-4 lg:backdrop-blur-md 2xl:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary lg:mb-3 lg:h-9 lg:w-9 2xl:mb-4 2xl:h-11 2xl:w-11">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mb-1.5 font-semibold text-text-primary lg:text-sm 2xl:text-base">
                  Para Negocios
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-text-muted lg:mb-3.5 lg:text-xs 2xl:mb-5 2xl:text-sm">
                  Registrá tu negocio, creá cupones y gestioná los canjes.
                </p>
                <LinkButton href="/login">
                  Ingresar
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LinkButton>
              </div>

              {/* Para Clientes */}
              <div className="group rounded-2xl border border-primary-foreground/20 bg-primary p-6 text-left shadow-lg shadow-primary/30 transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-accent hover:shadow-xl hover:shadow-primary/40 lg:p-4 2xl:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface/20 text-primary-foreground lg:mb-3 lg:h-9 lg:w-9 2xl:mb-4 2xl:h-11 2xl:w-11">
                  <Gift className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mb-1.5 font-semibold text-primary-foreground lg:text-sm 2xl:text-base">
                  Para Clientes
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-primary-foreground/80 lg:mb-3.5 lg:text-xs 2xl:mb-5 2xl:text-sm">
                  Accedé a todos tus cupones y descuentos en un solo lugar.
                </p>
                <LinkButton href="/acceso" variant="subtle">
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
          className="pointer-events-none z-10 mt-8 flex flex-col items-center gap-1 text-text-muted lg:mt-5 2xl:absolute 2xl:bottom-5 2xl:left-1/2 2xl:mt-0 2xl:-translate-x-1/2"
        >
          <span className="text-xs font-medium uppercase tracking-widest lg:text-xs">
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
