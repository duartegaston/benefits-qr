import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

const STEPS = [
  {
    number: "01",
    title: "Creá tu cupón",
    description: "Definí descripción, días válidos, fecha de vencimiento y cantidad de usos.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Compartí el link",
    description: "Envialo por WhatsApp, mail o compartilo donde vos quieras.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "El cliente canjea",
    description: "Ingresa sus datos, muestra el QR y vos lo escaneás desde la app.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h3M21 18h.01" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-16 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          eyebrow="Cómo funciona"
          title="Tres pasos, sin complicaciones"
        />

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <Card
              key={step.number}
              className="p-6 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md duration-200"
              style={{ transitionProperty: "transform, box-shadow" }}
            >
              {/* Decorative number */}
              <span className="absolute -top-4 -right-2 text-8xl font-black text-violet-600/10 select-none leading-none">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 mb-4 relative z-10">
                {step.icon}
              </div>

              {/* Text */}
              <h3 className="font-semibold text-gray-900 mb-2 relative z-10">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed relative z-10">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
