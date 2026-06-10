import LinkButton from "@/components/ui/LinkButton";
import PublicBenefitCardCompact from "@/components/public-benefits/PublicBenefitCardCompact";
import LandingLocalesMap from "@/components/public-benefits/LandingLocalesMap";
import type { PublicBenefitsFiltersInput } from "@/server/services/publicBenefitsService";
import { getPublicBenefitsPageData } from "@/server/services/publicBenefitsService";
import { getTodosLocalesRaw } from "@/server/repositories/localesMapRepository";

const PAGE_SIZE = 10;

function buildPageUrl(page: number, filterParamsString: string) {
  const next = new URLSearchParams(filterParamsString);
  next.set("page", String(page));
  return `/beneficios?${next.toString()}`;
}

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

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <div className="flex flex-col gap-3">
        {beneficios.length > 0 ? (
          beneficios.map((benefit) => (
            <PublicBenefitCardCompact key={benefit.id} benefit={benefit} />
          ))
        ) : (
          <div className="rounded-2xl border border-border-default bg-surface/80 p-6 text-center text-sm text-text-muted">
            No hay beneficios que coincidan con los filtros.
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LinkButton
              href={hasPrevious ? buildPageUrl(page - 1, filterParamsString) : buildPageUrl(1, filterParamsString)}
              variant="secondary"
              size="sm"
              className={hasPrevious ? "w-full sm:w-auto" : "pointer-events-none w-full opacity-50 sm:w-auto"}
              aria-disabled={!hasPrevious}
            >
              ← Anterior
            </LinkButton>

            <p className="text-center text-sm text-text-muted">
              Página {Math.min(page, Math.max(totalPages, 1))} de {totalPages} · {total}
            </p>

            <LinkButton
              href={hasNext ? buildPageUrl(page + 1, filterParamsString) : buildPageUrl(page, filterParamsString)}
              variant="secondary"
              size="sm"
              className={hasNext ? "w-full sm:w-auto" : "pointer-events-none w-full opacity-50 sm:w-auto"}
              aria-disabled={!hasNext}
            >
              Siguiente →
            </LinkButton>
          </div>
        ) : null}
      </div>

      <LandingLocalesMap locales={locales} />
    </div>
  );
}
