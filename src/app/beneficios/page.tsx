import { ArrowLeft } from "lucide-react";
import LinkButton from "@/components/ui/LinkButton";
import SectionHeader from "@/components/ui/SectionHeader";
import PublicBenefitsList from "@/components/public-benefits/PublicBenefitsList";
import { getPublicBenefitsPageData } from "@/server/services/publicBenefitsService";

const PAGE_SIZE = 9;

export const revalidate = 60;

export default async function BeneficiosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { beneficios, totalPages, total } = await getPublicBenefitsPageData(page, PAGE_SIZE);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <main className="relative px-4 pt-20 pb-14 sm:px-6 sm:pt-24 lg:px-8 lg:pb-16">
      <LinkButton
        href="/"
        variant="subtle"
        size="sm"
        className="absolute top-5 left-5 sm:top-6 sm:left-6 z-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Inicio
      </LinkButton>

      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <SectionHeader
          eyebrow="Catálogo público"
          title="Beneficios"
          description="Todos los cupones públicos, priorizando primero los que todavía están disponibles."
          align="left"
          className="mb-6 max-w-2xl"
        />

        <PublicBenefitsList
          benefits={beneficios}
          emptyMessage="Todavía no hay beneficios públicos."
        />

        {totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LinkButton
              href={hasPrevious ? `/beneficios?page=${page - 1}` : "/beneficios?page=1"}
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
              href={hasNext ? `/beneficios?page=${page + 1}` : `/beneficios?page=${page}`}
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
    </main>
  );
}
