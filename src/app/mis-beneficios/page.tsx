import { Suspense } from "react";
import { redirect } from "next/navigation";
import MisBeneficiosList from "@/components/cliente/beneficio/MisBeneficiosList";
import LinkButton from "@/components/ui/LinkButton";
import MetricCard from "@/components/ui/MetricCard";
import Card from "@/components/ui/Card";
import { getMisBeneficiosPageData } from "@/server/services/misBeneficiosService";
import { getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";

const PAGE_SIZE = 10;

function ReclamosListSkeleton() {
  return (
    <>
      <div className="mb-5 sm:mb-6">
        <Card className="rounded-xl border-border-strong/40 bg-primary p-3 sm:p-4">
          <div className="mb-1 h-3 w-32 animate-pulse rounded bg-primary-foreground/20" />
          <div className="h-7 w-8 animate-pulse rounded bg-primary-foreground/30" />
        </Card>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="overflow-hidden border-surface/80 bg-surface/95 shadow-sm shadow-accent-soft/25">
            <div className="h-1 bg-gradient-to-r from-primary to-accent opacity-30" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-border-default" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 animate-pulse rounded bg-border-default" />
                      <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-border-default" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
                  </div>
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-border-default" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

async function ReclamosList({
  clienteId,
  page,
}: {
  clienteId: string;
  page: number;
}) {
  const { reclamos, total, totalPages } = await getMisBeneficiosPageData(
    clienteId,
    page,
    PAGE_SIZE
  );

  return (
    <>
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
    </>
  );
}

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

  return (
    <main className="mx-auto max-w-3xl animate-[fade-in_0.3s_ease-out_both] px-4 pt-6 pb-12 sm:px-6 sm:pt-8">
      <div className="mb-5 space-y-1 sm:mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Mis cupones</h1>
        <p className="text-sm text-text-muted">
          Consultá tus beneficios guardados y mostrales el QR al local cuando quieras canjearlos.
        </p>
      </div>

      <Suspense fallback={<ReclamosListSkeleton />}>
        <ReclamosList clienteId={session.userId} page={page} />
      </Suspense>
    </main>
  );
}
