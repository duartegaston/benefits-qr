import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import HowItWorksMobileCarousel from "@/components/landing/HowItWorksMobileCarousel";
import StepShowcaseCard from "@/components/landing/StepShowcaseCard";

const STEPS = [
  {
    number: "01",
    title: "Creá tu cupón",
    description: "Definí descripción, días válidos, fecha de vencimiento y cantidad de usos.",
    imageSrc: "/Fotos-iphone/nuevo-cupon.jpeg",
    imageAlt: "Pantalla para crear un nuevo cupón en BenefitQR",
  },
  {
    number: "02",
    title: "Compartilo donde quieras",
    description: "Difundilo por WhatsApp, Instagram o con un link directo para que llegue rápido a tus clientes.",
    imageSrc: "/Fotos-iphone/dashboard.jpeg",
    imageAlt: "Opciones para compartir un cupón de BenefitQR",
  },
  {
    number: "03",
    title: "El cliente genera su QR",
    description: "Abre el beneficio, completa sus datos y genera el QR para mostrarlo en el local.",
    imageSrc: "/Fotos-iphone/cuponCliente.jpeg",
    imageAlt: "Cliente generando su QR para mostrar en el negocio",
  },
  {
    number: "04",
    title: "El negocio lo escanea",
    description: "Desde la app del negocio escaneás el QR del cliente y validás el canje en el momento.",
    imageSrc: "/Fotos-iphone/qrScann.jpeg",
    imageAlt: "Escaneo del QR del cliente desde el celular del negocio",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      tabIndex={-1}
      className="scroll-mt-24 bg-surface-muted px-6 py-16 lg:px-8 lg:py-14 2xl:py-16"
    >
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Cómo funciona"
            title="Cuatro pasos, de punta a punta"
            description="Desde crear el cupón hasta escanear el QR, el recorrido completo se entiende de un vistazo."
            className="max-w-2xl lg:mb-10 lg:text-left 2xl:mb-12 [&>span]:lg:mb-2 [&>span]:lg:text-xs [&>h2]:lg:text-3xl [&>p]:lg:text-sm"
            align="left"
          />
        </Reveal>

        <HowItWorksMobileCarousel steps={STEPS} />

        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-5 xl:grid-cols-4 2xl:gap-6">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.number}
              delay={0.06 * index}
              y={18}
              amount={0.25}
              className="h-full"
            >
              <StepShowcaseCard {...step} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
