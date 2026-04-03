import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DeleteBeneficioButton from "@/components/DeleteBeneficioButton";
import LinkButton from "@/components/ui/LinkButton";
import SectionHeader from "@/components/ui/SectionHeader";
import MetricCard from "@/components/ui/MetricCard";
import { formatDiasValidosSentence } from "@/lib/beneficioSchedule";
const PAGE_SIZE = 10;

function getReclamoStatusPresentation(status: "PENDIENTE" | "CANJEADO" | "VENCIDO") {
  if (status === "CANJEADO") {
    return { label: "Canjeado", color: "green" as const };
  }

  if (status === "VENCIDO") {
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
  if (!session || session.userType !== "LOCAL") redirect("/login");

  const [beneficio, totalReclamos, totalCanjeados, totalPendientes, reclamos] =
    await Promise.all([
      prisma.beneficio.findFirst({
        where: { id, localId: session.userId },
      }),
      prisma.reclamo.count({
        where: { beneficioId: id, beneficio: { localId: session.userId } },
      }),
      prisma.reclamo.count({
        where: { beneficioId: id, beneficio: { localId: session.userId }, estado: "CANJEADO" },
      }),
      prisma.reclamo.count({
        where: { beneficioId: id, beneficio: { localId: session.userId }, estado: "PENDIENTE" },
      }),
      prisma.reclamo.findMany({
        where: { beneficioId: id, beneficio: { localId: session.userId } },
        include: { cliente: { select: { email: true, phone: true, nombre: true } } },
        orderBy: { fechaReclamo: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

  if (!beneficio) redirect("/dashboard");

  const isExpired = beneficio.fechaExpiracion < new Date();
  const isAgotado = beneficio.maxUsos !== null && totalCanjeados >= beneficio.maxUsos;

  // Lazy update: mark pending reclamos as VENCIDO when the coupon is expired
  if (isExpired && totalPendientes > 0) {
    await prisma.reclamo.updateMany({
      where: { beneficioId: id, estado: "PENDIENTE" },
      data: { estado: "VENCIDO" },
    });
  }
  const isDeleted = beneficio.deletedAt !== null;
  const totalPages = Math.ceil(totalReclamos / PAGE_SIZE);

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
                Vence: {new Date(beneficio.fechaExpiracion).toLocaleDateString("es-AR")}
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
              <MetricCard label="Reclamos" value={totalReclamos} color="gray" />
              <MetricCard label="Canjeados" value={totalCanjeados} color="green" />
              <MetricCard label="Pendientes" value={totalPendientes} color="violet" />
            </div>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-xl font-bold text-text-primary">
        Clientes ({totalReclamos})
      </h2>

      {totalReclamos === 0 ? (
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
                      <span>Reclamó: {new Date(r.fechaReclamo).toLocaleString("es-AR")}</span>
                      {r.fechaCanje ? (
                        <span>Canjeó: {new Date(r.fechaCanje).toLocaleString("es-AR")}</span>
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
