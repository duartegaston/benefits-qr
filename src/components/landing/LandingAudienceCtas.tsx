import { ArrowRight, Building2, Gift } from "lucide-react";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

const AUDIENCE_CTAS = [
  {
    title: "Para Negocios",
    description: "Registrá tu negocio, creá cupones y gestioná los canjes.",
    href: "/login",
    action: "Ingresar",
    icon: <Building2 className="h-5 w-5" aria-hidden="true" />,
    className:
      "border-surface/80 bg-surface/90 shadow-lg shadow-primary-soft/70 hover:shadow-xl hover:shadow-accent-soft lg:bg-surface/75 sm:backdrop-blur-md",
    iconClassName: "bg-primary-soft text-primary",
    titleClassName: "text-text-primary",
    descriptionClassName: "text-text-muted",
    buttonVariant: "primary" as const,
  },
  {
    title: "Para Clientes",
    description: "Accedé a todos tus cupones y descuentos en un solo lugar.",
    href: "/acceso",
    action: "Ver mis cupones",
    icon: <Gift className="h-5 w-5" aria-hidden="true" />,
    className:
      "border-primary-foreground/20 bg-primary shadow-lg shadow-primary/30 hover:bg-accent hover:shadow-xl hover:shadow-primary/40",
    iconClassName: "bg-surface/20 text-primary-foreground",
    titleClassName: "text-primary-foreground",
    descriptionClassName: "text-primary-foreground/80",
    buttonVariant: "subtle" as const,
  },
];

export default function LandingAudienceCtas() {
  return (
    <section className="border-y border-border-default/60 bg-surface-soft px-6 py-12 lg:px-8 lg:py-14 2xl:py-16">
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
        <Reveal y={16} amount={0.2}>
          <SectionHeader
            eyebrow="Empezá según tu perfil"
            title="Una entrada clara para cada lado de la experiencia"
            description="Negocios gestionan beneficios y clientes acceden a sus cupones sin vueltas."
            align="left"
            className="max-w-2xl lg:mb-8 [&>h2]:text-2xl [&>p]:max-w-xl"
          />
        </Reveal>

        <Reveal delay={0.04} y={18} amount={0.2}>
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5 2xl:gap-6">
            {AUDIENCE_CTAS.map((cta) => (
              <div
                key={cta.title}
                className={`group rounded-3xl border p-6 text-left transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 lg:p-6 2xl:p-7 ${cta.className}`}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${cta.iconClassName}`}>
                  {cta.icon}
                </div>
                <h2 className={`mb-1.5 text-lg font-semibold ${cta.titleClassName}`}>
                  {cta.title}
                </h2>
                <p className={`mb-5 max-w-md text-sm leading-relaxed ${cta.descriptionClassName}`}>
                  {cta.description}
                </p>
                <LinkButton href={cta.href} variant={cta.buttonVariant}>
                  {cta.action}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LinkButton>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
