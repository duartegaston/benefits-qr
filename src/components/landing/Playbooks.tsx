import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { Phone } from "lucide-react";

const PLAYBOOKS = [
  {
    name: "El Flash Sale",
    config: "10 usos · Vence hoy",
    description: "Creá urgencia con un cupón de tiempo limitado. Ideal para liquidar stock o llenar turnos del día.",
    channel: "Instagram Stories / WhatsApp",
  },
  {
    name: "El Fidelizador",
    config: "Sin límite · 30 días",
    description: "Premiá a clientes frecuentes con un descuento exclusivo que se renueva cada mes.",
    channel: "WhatsApp",
  },
  {
    name: "El Lunes Muerto",
    config: "Válido lunes y martes",
    description: "Activá los días más flojos de la semana con un beneficio que solo vale en esas fechas.",
    channel: "Feed de Instagram",
  },
  {
    name: "El Cumpleaños",
    config: "Válido el mes de cumpleaños",
    description: "Sorprendé a tus clientes con un regalo personalizado en su mes especial.",
    channel: "Bio de Instagram",
  },
];

export default function Playbooks() {
  return (
    <section className="bg-surface px-6 py-16 lg:px-8 lg:py-14 2xl:py-16">
      <div className="max-w-4xl mx-auto">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Ideas listas para usar"
            title="Estrategias que funcionan"
            description="Casos de uso reales que podés replicar en minutos."
            className="lg:mb-10 2xl:mb-12 [&>p]:max-w-md [&>span]:lg:mb-2 [&>span]:lg:text-xs [&>h2]:lg:text-3xl [&>p]:lg:text-sm"
          />
        </Reveal>

        {/* Cards grid — 2x2 on desktop */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-3.5 2xl:gap-4">
          {PLAYBOOKS.map((play, index) => (
            <Reveal
              key={play.name}
              delay={0.05 * index}
              y={18}
              amount={0.2}
              className="h-full"
            >
              <Card
                className="h-full p-5 duration-200 hover:-translate-y-0.5 hover:shadow-md lg:p-4 2xl:p-5"
                style={{ transitionProperty: "transform, box-shadow" }}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2.5 lg:mb-2.5 lg:gap-2">
                  <h3 className="min-w-0 flex-1 font-bold text-text-primary lg:text-sm 2xl:text-base">{play.name}</h3>
                  <Badge
                    variant="light"
                    className="max-w-full shrink-0 py-1 whitespace-normal lg:px-2 lg:py-1 lg:text-xs lg:whitespace-nowrap 2xl:px-2.5 2xl:py-1 2xl:text-xs"
                  >
                    {play.config}
                  </Badge>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-text-muted lg:mb-3.5 lg:text-xs 2xl:mb-4 2xl:text-sm">{play.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-text-muted/80 lg:gap-1 lg:text-xs 2xl:gap-1.5 2xl:text-xs">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  <span>{play.channel}</span>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
