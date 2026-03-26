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
import HowItWorks from "@/components/HowItWorks";
import Playbooks from "@/components/Playbooks";
import Pricing from "@/components/Pricing";
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
        <div className="pointer-events-none absolute -top-56 -left-56 w-200 h-200 rounded-full bg-violet-400/25 blur-3xl hidden sm:block" />
        <div className="pointer-events-none absolute -bottom-56 -right-56 w-175 h-175 rounded-full bg-violet-300/40 blur-3xl hidden sm:block" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full bg-white/25 blur-3xl hidden sm:block" />

        <div className="max-w-2xl w-full text-center relative z-10 my-auto">
          {/* Logo */}
          <Reveal y={14} amount={0.6} className="flex justify-center mb-7">
            <Image
              src="/logo.png"
              alt="Qupón"
              width={96}
              height={96}
              priority
              className="rounded-3xl shadow-2xl shadow-violet-500/35 ring-4 ring-white/60"
            />
          </Reveal>

          {/* Badge */}
          <Reveal delay={0.06} y={16} amount={0.6}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 sm:bg-white/65 sm:backdrop-blur-sm border border-violet-200/70 text-violet-700 text-sm font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse motion-reduce:animate-none shrink-0" />
              Plataforma de cupones digitales con QR
            </span>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.14} y={18} amount={0.6}>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mt-6 mb-4">
              Cupones que{" "}
              <span className="bg-linear-to-r from-violet-600 via-violet-500 to-violet-400 bg-clip-text text-transparent">
                conectan negocios
              </span>
              <br className="hidden sm:block" /> con sus clientes
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.22} y={18} amount={0.6}>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Creá cupones de descuento, compartí el link y canjeá al instante con
              QR desde el celular.
            </p>
          </Reveal>

          {/* Feature pills */}
          <Reveal delay={0.3} y={20} amount={0.55} className="mt-6 mb-10">
            <div className="flex flex-wrap justify-center gap-2">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/90 sm:bg-white/70 sm:backdrop-blur-sm rounded-full border border-gray-200/60 text-sm text-gray-700 font-medium shadow-sm"
              >
                {f.icon}
                {f.label}
              </span>
            ))}
            </div>
          </Reveal>

          {/* CTA Cards */}
          <Reveal delay={0.38} y={22} amount={0.45}>
            <div className="grid sm:grid-cols-2 gap-4">
            {/* Para Negocios */}
            <div className="group bg-white/90 sm:bg-white/75 sm:backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-lg shadow-violet-100/60 text-left hover:shadow-xl hover:shadow-violet-200/60 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4 text-violet-600">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-semibold text-gray-900 mb-1.5">
                Para Negocios
              </h2>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Registrá tu negocio, creá cupones y gestioná los canjes.
              </p>
              <LinkButton href="/login">
                Ingresar
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkButton>
            </div>

            {/* Para Clientes */}
            <div className="group bg-violet-600 rounded-2xl p-6 border border-violet-500/40 shadow-lg shadow-violet-400/30 text-left hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 hover:bg-violet-700 transition-[transform,box-shadow,background-color] duration-300">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4 text-white">
                <Gift className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-semibold text-white mb-1.5">Para Clientes</h2>
              <p className="text-violet-200 text-sm mb-5 leading-relaxed">
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
          amount={0.8}
          className="pointer-events-none z-10 mt-8 flex flex-col items-center gap-1 text-gray-500 sm:absolute sm:bottom-5 sm:left-1/2 sm:mt-0 sm:-translate-x-1/2"
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

      <footer className="bg-violet-50 border-t border-violet-100 py-6 px-6 text-center">
        <p className="text-sm text-gray-400">
          Creado por{" "}
          <a
            href="https://www.godevs.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-violet-700 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm"
          >
            GODevs
          </a>
        </p>
      </footer>
    </main>
  );
}
