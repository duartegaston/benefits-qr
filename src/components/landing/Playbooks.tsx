import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

const PLAYBOOKS = [
  {
    title: "Flash sale",
    description: "Para mover stock o llenar un hueco hoy.",
    chip: "10 usos · hoy",
  },
  {
    title: "Clientes fieles",
    description: "Un cupón simple para dar motivo de vuelta.",
    chip: "30 días",
  },
  {
    title: "Lunes flojo",
    description: "Empuja visitas en los días que más cuestan.",
    chip: "lun · mar",
  },
  {
    title: "Primer canje",
    description: "Ideal para convertir difusión en una visita concreta.",
    chip: "QR único",
  },
];

export default function Playbooks() {
  return (
    <section
      id="ideas"
      tabIndex={-1}
      className="scroll-mt-24 bg-primary px-6 py-16 lg:px-8 lg:py-14 2xl:py-16"
    >
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Ideas listas para usar"
            title="Casos simples para salir rápido"
            description="Cuatro formatos concretos. Sin plantilla marketinera, sin vueltas."
            align="left"
            className="max-w-2xl lg:mb-10 2xl:mb-12 [&>span]:text-primary-foreground/72 [&>p]:max-w-xl [&>p]:text-primary-foreground/82 [&>span]:lg:mb-2 [&>span]:lg:text-xs [&>h2]:text-primary-foreground [&>h2]:lg:text-3xl [&>p]:lg:text-sm"
          />
        </Reveal>

        <div className="border-t border-primary-foreground/12">
          {PLAYBOOKS.map((play, index) => (
            <Reveal
              key={play.title}
              delay={0.04 * index}
              y={14}
              amount={0.2}
            >
              <article className="grid gap-3 border-b border-primary-foreground/12 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6 lg:grid-cols-[minmax(0,1fr)_13rem] lg:py-6">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-primary-foreground lg:text-2xl">
                    {play.title}
                  </h3>
                  <p className="mt-1.5 max-w-[34ch] text-sm leading-6 text-primary-foreground/78 sm:text-[15px]">
                    {play.description}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-flex text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/68">
                    {play.chip}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
