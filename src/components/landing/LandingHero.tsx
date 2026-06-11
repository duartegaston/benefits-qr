import LinkButton from "@/components/ui/LinkButton";
import { QrCode, Smartphone, Store } from "lucide-react";
import IPhoneMockup from "@/components/landing/IPhoneMockup";
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
    <section
      id="inicio"
      tabIndex={-1}
      className="relative scroll-mt-24 overflow-x-hidden px-6 pt-24 pb-6 sm:pt-32 sm:pb-8 lg:px-8 lg:pt-24 lg:pb-6 2xl:pt-24 2xl:pb-8"
    >
      <div className="pointer-events-none absolute -top-56 left-0 hidden h-200 w-200 rounded-full bg-primary/20 blur-3xl lg:block" />
      <div className="pointer-events-none absolute right-0 bottom-0 hidden h-175 w-175 rounded-full bg-accent-soft/70 blur-3xl lg:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:min-h-[calc(100vh-5rem)] lg:justify-center lg:gap-10 2xl:max-w-7xl 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:items-center 2xl:gap-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-10 2xl:contents">
          <div className="max-w-xl text-left lg:max-w-2xl 2xl:max-w-3xl">
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
              delay={0.32}
              y={10}
              amount={0.2}
              className="mt-6 flex w-full justify-center lg:hidden"
            >
              <LinkButton href="#perfil" size="lg" variant="primary" className="w-full max-w-xl">
                Ingresar
              </LinkButton>
            </Reveal>

            <Reveal
              delay={0.38}
              y={16}
              amount={0.2}
              className="mt-6 hidden lg:flex lg:w-full lg:max-w-md"
            >
              <LinkButton href="#perfil" size="lg" variant="primary" className="w-full">
                Ingresar
              </LinkButton>
            </Reveal>
          </div>

          <Reveal
            delay={0.18}
            y={20}
            amount={0.18}
            className="mx-auto w-full max-w-[20rem] sm:max-w-[22rem] lg:mx-0 lg:max-w-none 2xl:justify-self-end"
          >
            <div className="relative isolate">
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.24),rgba(96,165,250,0.14)_26%,rgba(191,219,254,0.08)_42%,rgba(59,130,246,0)_72%)] blur-3xl sm:block lg:h-[34rem] lg:w-[34rem]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/80 sm:block lg:h-[29rem] lg:w-[29rem]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 sm:block lg:h-[23rem] lg:w-[23rem]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[15rem] w-[15rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 sm:block lg:h-[16.5rem] lg:w-[16.5rem]" />
              <div className="pointer-events-none absolute -left-[6%] top-[10%] hidden h-36 w-36 rounded-full border border-white/60 bg-white/20 shadow-[0_26px_60px_-34px_rgba(255,255,255,0.95)] sm:block lg:h-40 lg:w-40" />
              <div className="pointer-events-none absolute right-[-2%] top-[12%] hidden h-14 w-14 rounded-full border border-primary/25 bg-primary/15 lg:block" />
              <div className="pointer-events-none absolute -right-[10%] bottom-[10%] hidden h-28 w-28 rounded-full border border-accent/18 bg-accent-soft/38 shadow-[0_18px_45px_-30px_rgba(59,130,246,0.7)] lg:block" />
              <div className="pointer-events-none absolute left-[-4%] bottom-[14%] hidden h-24 w-24 rounded-full border border-primary/14 border-dashed lg:block" />
              <div className="pointer-events-none absolute inset-x-[8%] top-[6%] hidden h-[88%] rounded-[4rem] bg-linear-to-b from-white/16 via-transparent to-transparent sm:block" />

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

      </div>
    </section>
  );
}
