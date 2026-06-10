import LandingLocalesMap from "@/components/public-benefits/LandingLocalesMap";
import BeneficiosListConCercania, { type LocalCoordsByName } from "@/components/public-benefits/BeneficiosListConCercania";
import type { PublicBenefitsFiltersInput } from "@/server/services/publicBenefitsService";
import { getPublicBenefitsPageData } from "@/server/services/publicBenefitsService";
import { getTodosLocalesRaw } from "@/server/repositories/localesMapRepository";

const PAGE_SIZE = 10;

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

  const localCoordsByName: LocalCoordsByName = {};
  for (const l of locales) {
    if (l.nombre) localCoordsByName[l.nombre] = { lat: l.lat, lng: l.lng };
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <BeneficiosListConCercania
        beneficios={beneficios}
        localCoordsByName={localCoordsByName}
        page={page}
        totalPages={totalPages}
        total={total}
        filterParamsString={filterParamsString}
      />

      <LandingLocalesMap locales={locales} />
    </div>
  );
}
