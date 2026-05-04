import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { ArrowLeft } from "lucide-react";
import LinkButton from "@/components/ui/LinkButton";
import SectionHeader from "@/components/ui/SectionHeader";
import PublicBenefitsFilters from "@/components/public-benefits/PublicBenefitsFilters";
import BenefitsGrid, { BenefitsGridSkeleton } from "@/components/public-benefits/BenefitsGrid";
import { prisma } from "@/lib/prisma";

// Rubros almost never change — cache for 1 hour
const getRubros = unstable_cache(
  () => prisma.rubro.findMany({ orderBy: { nombre: "asc" } }),
  ["rubros"],
  { revalidate: 3600 }
);

export const revalidate = 0;

export default async function BeneficiosPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    rubro?: string;
    soloHoy?: string;
    soloDisponibles?: string;
  }>;
}) {
  const { page: pageParam, q, rubro, soloHoy, soloDisponibles } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const filters = {
    q: q?.trim() || undefined,
    rubroId: rubro || undefined,
    soloHoy: soloHoy === "1",
    soloDisponibles: soloDisponibles === "1",
  };

  const filterParams = new URLSearchParams();
  if (filters.q) filterParams.set("q", filters.q);
  if (filters.rubroId) filterParams.set("rubro", filters.rubroId);
  if (filters.soloHoy) filterParams.set("soloHoy", "1");
  if (filters.soloDisponibles) filterParams.set("soloDisponibles", "1");

  // Rubros come from cache — no DB hit on repeat requests
  const rubros = await getRubros();

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

        {/* Filters render immediately (rubros are cached) */}
        <Suspense fallback={null}>
          <PublicBenefitsFilters rubros={rubros} />
        </Suspense>

        {/* Benefits grid streams in — user sees filters without waiting for the DB query */}
        <Suspense fallback={<BenefitsGridSkeleton />}>
          <BenefitsGrid page={page} filters={filters} filterParams={filterParams} />
        </Suspense>
      </div>
    </main>
  );
}
