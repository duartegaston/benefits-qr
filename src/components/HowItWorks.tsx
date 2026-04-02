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
    <section className="bg-surface-muted py-16 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Cómo funciona"
            title="Tres pasos, sin complicaciones"
          />
        </Reveal>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.number}
              delay={0.06 * index}
              y={18}
              amount={0.25}
              className="h-full"
            >
              <Card
                className="p-6 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md duration-200 h-full"
                style={{ transitionProperty: "transform, box-shadow" }}
              >
                {/* Decorative number */}
                <span className="absolute -top-4 -right-2 text-8xl font-black text-primary/10 select-none leading-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary mb-4 relative z-10">
                  {step.icon}
                </div>

                {/* Text */}
                <h3 className="font-semibold text-text-primary mb-2 relative z-10">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed relative z-10">{step.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
