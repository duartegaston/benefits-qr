import type { PublicBenefitsFiltersInput } from "@/server/services/publicBenefitsService";
import { getPublicBenefitsPageData } from "@/server/services/publicBenefitsService";
import PublicBenefitsList from "@/components/public-benefits/PublicBenefitsList";
import LinkButton from "@/components/ui/LinkButton";

function buildPageUrl(page: number, filterParams: URLSearchParams) {
  const next = new URLSearchParams(filterParams);
  next.set("page", String(page));
  return `/beneficios?${next.toString()}`;
}

const PAGE_SIZE = 9;

export default async function BenefitsGrid({
  page,
  filters,
  filterParams,
}: {
  page: number;
  filters: PublicBenefitsFiltersInput;
  filterParams: URLSearchParams;
}) {
  const { beneficios, totalPages, total } = await getPublicBenefitsPageData(page, PAGE_SIZE, filters);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <>
      <PublicBenefitsList
        benefits={beneficios}
        emptyMessage="No hay beneficios que coincidan con los filtros."
      />

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <LinkButton
            href={hasPrevious ? buildPageUrl(page - 1, filterParams) : buildPageUrl(1, filterParams)}
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
            href={hasNext ? buildPageUrl(page + 1, filterParams) : buildPageUrl(page, filterParams)}
            variant="secondary"
            size="sm"
            className={hasNext ? "w-full sm:w-auto" : "pointer-events-none w-full opacity-50 sm:w-auto"}
            aria-disabled={!hasNext}
          >
            Siguiente →
          </LinkButton>
        </div>
      ) : null}
    </>
  );
}

export function BenefitsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl bg-surface-muted"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
