import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DeleteBeneficioButton from "@/components/local/dashboard/beneficios/DeleteBeneficioButton";
import LinkButton from "@/components/ui/LinkButton";
import SectionHeader from "@/components/ui/SectionHeader";
import MetricCard from "@/components/ui/MetricCard";
import { formatDiasValidosSentence } from "@/lib/beneficioSchedule";
import { formatDateAR, formatDateTimeAR } from "@/lib/dates";
import { EstadoReclamo } from "@/generated/prisma/client";
import {
  expirePendingReclamosAsyncIfNeeded,
  getBeneficioDetailPageData,
} from "@/server/services/beneficioDetailService";
const PAGE_SIZE = 10;

function getReclamoStatusPresentation(status: EstadoReclamo) {
  if (status === EstadoReclamo.CANCELADO) {
    return { label: "Cancelado", color: "gray" as const };
  }
  if (status === EstadoReclamo.CANJEADO) {
    return { label: "Canjeado", color: "green" as const };
  }

  if (status === EstadoReclamo.VENCIDO) {
    return { label: "Vencido", color: "red" as const };
  }

  return { label: "Pendiente", color: "violet" as const };
}

export default async function BeneficioStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) redirect("/login");

  const t0 = performance.now();
  const { beneficio, stats, reclamos, totalPages } = await getBeneficioDetailPageData(
    id,
    session.userId,
    page,
    PAGE_SIZE
  );
  console.log(`[beneficio-detail] DB: ${Math.round(performance.now() - t0)}ms`);

  if (!beneficio) redirect("/dashboard");

  const isExpired = beneficio.fechaExpiracion < new Date();
  const isAgotado = beneficio.maxUsos !== null && stats.canjeados >= beneficio.maxUsos;

  // Fire-and-forget: marca PENDIENTE → VENCIDO sin bloquear el render
  expirePendingReclamosAsyncIfNeeded(id, isExpired, stats.pendientes);
  const isDeleted = beneficio.deletedAt !== null;

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8">
      <SectionHeader
        eyebrow="Detalle del cupón"
        title="Estado y actividad"
        description="Consultá métricas clave y el historial de clientes que reclamaron este cupón."
        align="left"
        className="mb-5 sm:mb-6"
      />

      <Card className="relative mb-6 border-surface/80 bg-surface/95 p-4 shadow-sm shadow-accent-soft/25 sm:bg-surface/85 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="min-w-0 flex-1 space-y-2 pr-12 sm:pr-36">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold leading-tight text-text-primary sm:text-xl">
                  {beneficio.descripcion}
                </h1>
                {isDeleted ? (
                  <Badge color="red">Eliminado</Badge>
                ) : isExpired ? (
                  <Badge color="red">Vencido</Badge>
                ) : isAgotado ? (
                  <Badge color="yellow">Agotado</Badge>
                ) : (
                  <Badge color="green">Activo</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-text-muted">
                Vence: {formatDateAR(beneficio.fechaExpiracion)}
                {beneficio.maxUsos && ` · Máx. ${beneficio.maxUsos} usos`}
              </p>
              <p className="text-xs font-medium text-text-muted sm:text-sm">
                {formatDiasValidosSentence(beneficio.diasValidos)}
              </p>
            </div>

            {!isDeleted && (
              <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                <DeleteBeneficioButton id={beneficio.id} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Actividad del cupón
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <MetricCard label="Reclamos" value={stats.total} color="gray" />
              <MetricCard label="Canjeados" value={stats.canjeados} color="green" />
              <MetricCard label="Pendientes" value={stats.pendientes} color="violet" />
            </div>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-xl font-bold text-text-primary">
        Clientes ({stats.total})
      </h2>

      {stats.total === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-text-muted">Nadie reclamó este cupón aún</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {reclamos.map((r) => {
            const status = getReclamoStatusPresentation(r.estado);

            return (
              <Card
                key={r.id}
                className="border-surface/80 bg-surface/95 p-3 sm:bg-surface/85 sm:p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary sm:text-base">
                      {r.cliente.nombre ?? r.cliente.email ?? r.cliente.phone}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                      {r.cliente.email && <span className="break-all">{r.cliente.email}</span>}
                      {r.cliente.email && r.cliente.phone ? <span aria-hidden>•</span> : null}
                      {r.cliente.phone && <span>{r.cliente.phone}</span>}
                      {!r.cliente.email && !r.cliente.phone ? <span>Sin contacto cargado</span> : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted sm:text-xs">
                      <span>Reclamó: {formatDateTimeAR(r.fechaReclamo)}</span>
                      {r.fechaCanje ? (
                        <span>Canjeó: {formatDateTimeAR(r.fechaCanje)}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge color={status.color}>{status.label}</Badge>
                  </div>
                </div>
              </Card>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <LinkButton
                href={`/dashboard/beneficios/${id}?page=${page - 1}`}
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
                href={`/dashboard/beneficios/${id}?page=${page + 1}`}
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
      )}
    </main>
  );
}
