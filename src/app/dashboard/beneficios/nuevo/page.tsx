import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import NuevoBeneficioForm from "@/components/dashboard/NuevoBeneficioForm";

export default function NuevoBeneficioPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8">
      <SectionHeader
        eyebrow="Nuevo cupón"
        title="Creá un beneficio"
        description="Definí la vigencia y las condiciones del cupón para publicarlo en tu dashboard."
        align="left"
        className="mb-5 sm:mb-6"
      />

      <Card className="mx-auto w-full max-w-2xl border-surface/80 bg-surface/95 p-5 shadow-sm shadow-accent-soft/25 sm:bg-surface/85 sm:p-6">
        <NuevoBeneficioForm />
      </Card>
    </main>
  );
}
