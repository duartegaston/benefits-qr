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
      <div className="pointer-events-none absolute -top-56 -left-56 hidden h-200 w-200 rounded-full bg-primary/20 blur-3xl lg:block" />
      <div className="pointer-events-none absolute -right-52 bottom-0 hidden h-175 w-175 rounded-full bg-accent-soft/70 blur-3xl lg:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:min-h-[calc(100vh-5rem)] lg:justify-center lg:gap-10 2xl:max-w-7xl 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:items-center 2xl:gap-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-10 2xl:contents">
          <div className="max-w-xl text-left lg:max-w-2xl 2xl:max-w-3xl">
            <Reveal y={14} amount={0.1} className="mb-6 flex justify-start lg:mb-5 2xl:mb-6">
              <BrandLogo priority />
            </Reveal>

            <Reveal delay={0.14} y={18} amount={0.2}>
              <h1 className="text-4xl uppercase leading-[1.08] font-bold tracking-tight text-text-primary sm:text-[2.85rem] lg:max-w-xl lg:text-[3.4rem] lg:leading-[1.02] 2xl:max-w-2xl 2xl:text-[4.1rem]">
                Cupones que{" "}
                <span className="bg-linear-to-r from-primary via-accent to-border-strong bg-clip-text text-transparent">
                  conectan negocios
                </span>{" "}
                con sus clientes
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
            <IPhoneMockup
              imageSrc="/Fotos-iphone/dashboard.jpeg"
              imageAlt="Vista del dashboard de BenefitQR en un iPhone"
              priority
              sizes="(min-width: 1536px) 20rem, (min-width: 1024px) 18rem, 85vw"
              frameClassName="max-w-[24rem] lg:max-w-[17.5rem] 2xl:max-w-[20rem]"
            />
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
