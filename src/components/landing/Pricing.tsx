import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import LinkButton from "@/components/ui/LinkButton";
import { ArrowRight, Check } from "lucide-react";

const FEATURES = [
  "Cupones ilimitados desde el primer día",
  "Sin comisiones por canje",
  "Soporte por WhatsApp y mail",
  "Estadísticas de uso en tiempo real",
  "Acceso desde cualquier dispositivo",
  "Sin permanencia — cancelás cuando querés",
];

export default function Pricing() {
  return (
    <section className="bg-surface-muted py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Reveal y={20} amount={0.35}>
          <SectionHeader
            eyebrow="Precios"
            title="Empezá gratis, crecé sin límites"
            description="El primer mes lo cubrimos nosotros. Probá todas las funciones sin tarjeta ni compromiso."
          />
        </Reveal>

        {/* Pricing card */}
        <Reveal delay={0.06} y={20} amount={0.25}>
          <div className="bg-surface rounded-3xl border border-border-default/70 shadow-sm overflow-hidden">
          {/* Top banner */}
          <div className="bg-primary px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-text-soft text-sm font-medium">Primer mes</p>
              <p className="text-primary-foreground text-2xl font-black tracking-tight">Totalmente gratis</p>
            </div>
            <Badge
              className="self-start sm:self-auto gap-1.5 px-3.5 py-1.5 bg-surface/20 border border-surface/30 text-primary-foreground font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success-border shrink-0" />
              Sin tarjeta requerida
            </Badge>
          </div>

          {/* Body */}
          <div className="px-8 py-8 sm:flex sm:gap-10">
            {/* Price */}
            <div className="sm:w-48 shrink-0 mb-8 sm:mb-0">
              <p className="text-xs text-text-muted/80 uppercase tracking-widest font-semibold mb-2">Luego del primer mes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-primary">$12.000</span>
                <span className="text-text-muted/80 text-sm">/mes</span>
              </div>
              <p className="text-text-muted/80 text-xs mt-1 mb-6">ARS · IVA incluido</p>

              <LinkButton
                href="/login"
                size="lg"
                className="w-full font-semibold"
              >
                Crear mi cuenta
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkButton>
              <p className="text-center text-xs text-text-muted/80 mt-3">
                Sin cargo hasta el día 31
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-border-default/70 self-stretch" />

            {/* Features */}
            <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-text-muted">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-accent-soft/50 flex items-center justify-center text-primary">
                    <Check className="h-[15px] w-[15px]" aria-hidden="true" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          </div>
        </Reveal>

        {/* Reassurance */}
        <Reveal delay={0.12} y={16} amount={0.4}>
          <p className="text-center text-sm text-text-muted/80 mt-6">
            ¿Tenés dudas? Escribinos a{" "}
            <a
              href="mailto:qupon.qr@gmail.com"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              qupon.qr@gmail.com
            </a>{" "}
            y te respondemos al toque.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
