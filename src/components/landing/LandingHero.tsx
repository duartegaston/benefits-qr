import { ChevronDown, QrCode, Smartphone, Store } from "lucide-react";
import IPhoneMockup from "@/components/landing/IPhoneMockup";
import BrandLogo from "@/components/ui/BrandLogo";
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

export default function LandingHero() {
  return (
    <section className="relative px-6 pt-10 pb-6 sm:pt-12 sm:pb-8 lg:px-8 lg:pt-8 lg:pb-6 2xl:pt-10 2xl:pb-8">
      <div className="pointer-events-none absolute -top-56 left-0 hidden h-200 w-200 rounded-full bg-primary/20 blur-3xl lg:block" />
      <div className="pointer-events-none absolute right-0 bottom-0 hidden h-175 w-175 rounded-full bg-accent-soft/70 blur-3xl lg:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:min-h-[calc(100vh-5rem)] lg:justify-center lg:gap-10 2xl:max-w-7xl 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:items-center 2xl:gap-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-10 2xl:contents">
          <div className="max-w-xl text-left lg:max-w-2xl 2xl:max-w-3xl">
            <Reveal y={14} amount={0.1} className="mb-6 flex justify-start lg:mb-5 2xl:mb-6">
              <BrandLogo priority />
            </Reveal>

            <Reveal delay={0.14} y={18} amount={0.2}>
              <h1 className="text-[3.2rem] font-bold uppercase leading-[0.96] tracking-[-0.05em] text-black sm:text-[4.25rem] lg:max-w-2xl lg:text-[5rem] lg:leading-[0.93] 2xl:max-w-[14ch] 2xl:text-[6.5rem]">
                Cupones que conectan <span className="text-primary">negocios</span> con sus <span className="text-primary">clientes</span>
              </h1>
            </Reveal>

            <Reveal delay={0.22} y={18} amount={0.2}>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-text-muted sm:text-lg lg:mt-5 lg:max-w-xl lg:text-lg 2xl:max-w-2xl 2xl:text-xl">
                Creá cupones de descuento, compartí el link y canjeá al instante
                con QR desde el celular.
              </p>
            </Reveal>

            <Reveal delay={0.3} y={20} amount={0.2} className="mt-5 sm:mt-6">
              <div className="flex flex-wrap gap-2.5 lg:gap-2 2xl:gap-3">
                {FEATURES.map((feature) => (
                  <span
                    key={feature.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-default/60 bg-surface/90 px-3.5 py-2 text-sm font-medium text-text-primary shadow-sm sm:bg-surface/85 lg:gap-2 lg:bg-surface/75 lg:px-4 lg:py-2 sm:backdrop-blur-sm"
                  >
                    {feature.icon}
                    {feature.label}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal
              delay={0.38}
              y={16}
              amount={0.2}
              className="mt-6 hidden items-center gap-2 text-text-muted lg:flex"
            >
              <span className="text-xs font-medium uppercase tracking-[0.28em]">
                Más información abajo
              </span>
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 animate-bounce motion-reduce:animate-none"
              />
            </Reveal>
          </div>

          <Reveal
            delay={0.18}
            y={20}
            amount={0.18}
            className="mx-auto w-full max-w-[20rem] sm:max-w-[22rem] lg:mx-0 lg:max-w-none 2xl:justify-self-end"
          >
            <div className="relative isolate">
              <div className="pointer-events-none absolute inset-x-[12%] top-[9%] hidden h-[72%] rounded-[2.75rem] bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.14),rgba(30,64,175,0)_68%)] blur-2xl sm:block" />
              <div className="pointer-events-none absolute top-[10%] left-1/2 hidden h-[78%] w-[78%] -translate-x-1/2 rounded-full border border-primary/12 sm:block" />
              <div className="pointer-events-none absolute top-[4%] left-[8%] hidden h-[84%] w-[84%] rounded-[3rem] border border-white/45 bg-linear-to-br from-white/50 via-white/10 to-transparent shadow-[0_28px_90px_-45px_rgba(59,130,246,0.5)] sm:block" />
              <div className="pointer-events-none absolute -right-[8%] bottom-[12%] hidden h-18 w-18 rounded-full border border-accent/20 bg-accent-soft/35 blur-[2px] lg:block" />

              <IPhoneMockup
                imageSrc="/Fotos-iphone/dashboard.jpeg"
                imageAlt="Vista del dashboard de BenefitQR en un iPhone"
                priority
                sizes="(min-width: 1536px) 20rem, (min-width: 1024px) 18rem, 85vw"
                frameClassName="relative z-10 max-w-[24rem] lg:max-w-[17.5rem] 2xl:max-w-[20rem]"
              />
            </div>
          </Reveal>
        </div>

        <Reveal
          delay={0.42}
          y={14}
          amount={0.15}
          className="flex flex-col items-center gap-1 text-text-muted lg:hidden"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.24em]">
            Más información abajo
          </span>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 animate-bounce motion-reduce:animate-none"
          />
        </Reveal>
      </div>
    </section>
  );
}
