import { redirect } from "next/navigation";
import MisBeneficiosList from "@/components/cliente/beneficio/MisBeneficiosList";
import LinkButton from "@/components/ui/LinkButton";
import MetricCard from "@/components/ui/MetricCard";
import { getMisBeneficiosPageData } from "@/server/services/misBeneficiosService";
import { getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";

const PAGE_SIZE = 10;

export default async function MisBeneficiosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await getClienteSessionFromCookies();

  if (!session || session.userType !== UserType.CLIENTE) {
    redirect("/acceso");
  }

  const { reclamos, total, totalPages } = await getMisBeneficiosPageData(
    session.userId,
    page,
    PAGE_SIZE
  );

  return (
    <main className="mx-auto max-w-3xl animate-[fade-in_0.3s_ease-out_both] px-4 pt-6 pb-12 sm:px-6 sm:pt-8">
      <div className="mb-5 space-y-1 sm:mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Mis cupones</h1>
        <p className="text-sm text-text-muted">
          Consultá tus beneficios guardados y mostrales el QR al local cuando quieras canjearlos.
        </p>
      </div>

      <div className="mb-5 sm:mb-6">
        <MetricCard label="Beneficios guardados" value={total} variant="primary" />
      </div>

      <div className="space-y-4">
        <MisBeneficiosList reclamos={reclamos} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <LinkButton
              href={`/mis-beneficios?page=${page - 1}`}
              variant="secondary"
              size="sm"
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
              aria-disabled={page <= 1}
            >
              ← Anterior
            </LinkButton>
            <span className="text-sm text-text-muted">
              Página {page} de {totalPages}
            </span>
            <LinkButton
              href={`/mis-beneficios?page=${page + 1}`}
              variant="secondary"
              size="sm"
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
              aria-disabled={page >= totalPages}
            >
              Siguiente →
            </LinkButton>
          </div>
        )}
      </div>
    </main>
  );
}
