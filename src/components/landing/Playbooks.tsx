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
    <section className="bg-surface py-16 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Ideas listas para usar"
            title="Estrategias que funcionan"
            description="Casos de uso reales que podés replicar en minutos."
            className="[&>p]:max-w-md"
          />
        </Reveal>

        {/* Cards grid — 2x2 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLAYBOOKS.map((play, index) => (
            <Reveal
              key={play.name}
              delay={0.05 * index}
              y={18}
              amount={0.2}
              className="h-full"
            >
              <Card
                className="p-5 hover:-translate-y-0.5 hover:shadow-md duration-200 h-full"
                style={{ transitionProperty: "transform, box-shadow" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2.5 mb-3">
                  <h3 className="font-bold text-text-primary min-w-0 flex-1">{play.name}</h3>
                  <Badge
                    variant="light"
                    className="shrink-0 py-1 whitespace-normal sm:whitespace-nowrap max-w-full"
                  >
                    {play.config}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{play.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-text-muted/80">
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
