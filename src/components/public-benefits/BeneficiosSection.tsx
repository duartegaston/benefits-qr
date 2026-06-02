import type { PublicBenefitsFiltersInput } from "@/server/services/publicBenefitsService";
import { getPublicBenefitsPageData } from "@/server/services/publicBenefitsService";
import { getTodosLocalesRaw } from "@/server/repositories/localesMapRepository";
import BeneficiosViewToggle from "@/components/cliente/beneficios/BeneficiosViewToggle";

const PAGE_SIZE = 9;

export default async function BeneficiosSection({
  page,
  filters,
  filterParamsString,
}: {
  page: number;
  filters: PublicBenefitsFiltersInput;
  filterParamsString: string;
}) {
  const [{ beneficios, totalPages, total }, locales] = await Promise.all([
    getPublicBenefitsPageData(page, PAGE_SIZE, filters),
    getTodosLocalesRaw(),
  ]);

  return (
    <BeneficiosViewToggle
      benefits={beneficios}
      locales={locales}
      page={page}
      totalPages={totalPages}
      total={total}
      filterParamsString={filterParamsString}
      hasLocalFilter={Boolean(filters.localId)}
    />
  );
}
