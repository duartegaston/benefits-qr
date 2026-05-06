import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import PublicBenefitsList from "@/components/public-benefits/PublicBenefitsList";
import { getFeaturedPublicBenefits } from "@/server/services/publicBenefitsService";

const FEATURED_LIMIT = 3;

export default async function PublicBenefitsSection() {
  const { beneficios } = await getFeaturedPublicBenefits(FEATURED_LIMIT);

  if (beneficios.length === 0) {
    return null;
  }

  return (
    <section
      id="beneficios"
      tabIndex={-1}
      className="scroll-mt-24 bg-linear-to-br from-primary-soft via-surface-soft to-accent-soft px-6 py-16 lg:px-8 lg:py-14 2xl:py-16"
    >
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <Reveal y={18} amount={0.25}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Catálogo público"
              title="Cupones publicados"
              description="Una selección abierta para explorar ahora."
              align="left"
              className="mb-0 max-w-2xl"
            />

            <LinkButton href="/beneficios" variant="subtle" size="sm" className="w-full sm:w-auto">
              Ver todos
            </LinkButton>
          </div>
        </Reveal>

        <Reveal y={16} amount={0.2}>
          <PublicBenefitsList benefits={beneficios} />
        </Reveal>
      </div>
    </section>
  );
}
