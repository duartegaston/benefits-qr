import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { Plus, QrCode, Send } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Creá tu cupón",
    description: "Definí descripción, días válidos, fecha de vencimiento y cantidad de usos.",
    icon: <Plus className="h-5 w-5" aria-hidden="true" />,
  },
  {
    number: "02",
    title: "Compartí el link",
    description: "Envialo por WhatsApp, mail o compartilo donde vos quieras.",
    icon: <Send className="h-5 w-5" aria-hidden="true" />,
  },
  {
    number: "03",
    title: "El cliente canjea",
    description: "Ingresa sus datos, muestra el QR y vos lo escaneás desde la app.",
    icon: <QrCode className="h-5 w-5" aria-hidden="true" />,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface-muted px-6 py-16 lg:px-8 lg:py-14 2xl:py-16">
      <div className="max-w-4xl mx-auto">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Cómo funciona"
            title="Tres pasos, sin complicaciones"
            className="lg:mb-10 2xl:mb-12 [&>span]:lg:mb-2 [&>span]:lg:text-xs [&>h2]:lg:text-3xl [&>p]:lg:text-sm"
          />
        </Reveal>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5 2xl:gap-6">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.number}
              delay={0.06 * index}
              y={18}
              amount={0.25}
              className="h-full"
            >
              <Card
                className="relative h-full overflow-hidden p-6 duration-200 hover:-translate-y-0.5 hover:shadow-md lg:p-5 2xl:p-6"
                style={{ transitionProperty: "transform, box-shadow" }}
              >
                {/* Decorative number */}
                <span className="absolute -top-4 -right-2 select-none text-8xl leading-none font-black text-primary/10 lg:-top-3.5 lg:text-7xl 2xl:-top-4 2xl:text-8xl">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary lg:mb-3.5 lg:h-9 lg:w-9 2xl:mb-4 2xl:h-10 2xl:w-10">
                  {step.icon}
                </div>

                {/* Text */}
                <h3 className="relative z-10 mb-2 font-semibold text-text-primary lg:text-sm 2xl:text-base">{step.title}</h3>
                <p className="relative z-10 text-sm leading-relaxed text-text-muted lg:text-xs 2xl:text-sm">{step.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
