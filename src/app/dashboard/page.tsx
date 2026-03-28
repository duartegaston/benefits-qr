import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DashboardActions from "@/components/DashboardActions";
import ShareButtons from "@/components/ShareButtons";
import LogoUpload from "@/components/LogoUpload";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";

const DIAS_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatDias(dias: number[]): string {
  if (dias.length === 0) return "Válido todos los días";
  const nombres = [...dias].sort((a, b) => a - b).map((d) => DIAS_LABELS[d]);
  if (nombres.length === 1) return `Válido los ${nombres[0]}`;
  const ultimo = nombres.pop();
  return `Válido los ${nombres.join(", ")} y ${ultimo}`;
}

const PAGE_SIZE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await getSessionFromCookies();
  if (!session || session.userType !== "LOCAL") {
    redirect("/login");
  }

  const [local, beneficios, totalBeneficios, totalReclamos, totalCanjeados] =
    await Promise.all([
      prisma.local.findUnique({ where: { id: session.userId } }),
      prisma.beneficio.findMany({
        where: { localId: session.userId, deletedAt: null },
        include: {
          _count: { select: { reclamos: true } },
          reclamos: { where: { estado: "CANJEADO" }, select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.beneficio.count({ where: { localId: session.userId, deletedAt: null } }),
      prisma.reclamo.count({ where: { beneficio: { localId: session.userId } } }),
      prisma.reclamo.count({
        where: { beneficio: { localId: session.userId }, estado: "CANJEADO" },
      }),
    ]);

  if (!local) redirect("/login");
  if (local.nombre === null) redirect("/onboarding");

  const totalPages = Math.ceil(totalBeneficios / PAGE_SIZE);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-32 sm:px-6 sm:pt-8 sm:pb-16">
      <Reveal y={10} amount={0.2} className="mb-8 sm:mb-10">
        <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm shadow-violet-100/30 sm:bg-white/75 sm:backdrop-blur-md sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="shrink-0">
                <LogoUpload currentLogoUrl={local.logoUrl} nombre={local.nombre!} />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                  {local.nombre}
                </h1>
                <p className="text-sm text-gray-500 break-all">{local.email}</p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <DashboardActions />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3 sm:mb-10 sm:gap-4">
        <Reveal y={14} amount={0.25}>
          <Card className="border-white/70 bg-white/90 p-4 shadow-md shadow-violet-100/40 sm:bg-white/75 sm:backdrop-blur-md sm:p-6">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal">
              Cupones
            </p>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totalBeneficios}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.06} y={14} amount={0.25}>
          <Card className="border-white/70 bg-white/90 p-4 shadow-md shadow-violet-100/40 sm:bg-white/75 sm:backdrop-blur-md sm:p-6">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal">
              Reclamos
            </p>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totalReclamos}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.12} y={14} amount={0.25}>
          <Card className="border-violet-500/40 bg-violet-600 p-4 shadow-md shadow-violet-300/30 sm:p-6">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-violet-200 sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal">
              Canjeados
            </p>
            <p className="text-2xl font-bold text-white sm:text-3xl">{totalCanjeados}</p>
          </Card>
        </Reveal>
      </div>

      {/* Beneficios */}
      <Reveal y={8} amount={0.2} className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Mis cupones</h2>
          <LinkButton
            href="/dashboard/beneficios/nuevo"
            variant="primary"
            size="sm"
          >
            + Nuevo cupón
          </LinkButton>
        </div>
      </Reveal>

      {totalBeneficios === 0 ? (
        <Reveal y={12} amount={0.2}>
          <Card className="border-white/70 bg-white/90 p-10 text-center sm:bg-white/75 sm:backdrop-blur-md sm:p-12">
            <p className="mb-2 text-base font-medium text-gray-700">No tenés cupones aún</p>
            <p className="mb-5 text-sm text-gray-500">Creá el primero para empezar a recibir reclamos.</p>
            <LinkButton
              href="/dashboard/beneficios/nuevo"
              variant="primary"
              size="sm"
            >
              Crear primer cupón
            </LinkButton>
          </Card>
        </Reveal>
      ) : (
        <div className="space-y-4">
          {beneficios.map((b, index) => {
            const isExpired = b.fechaExpiracion < new Date();
            const canjeados = b.reclamos.length;
            const isAgotado = b.maxUsos !== null && canjeados >= b.maxUsos;
            const shareUrl = `${appUrl}/beneficio/${b.id}`;

            return (
              <Reveal key={b.id} delay={Math.min(index * 0.04, 0.2)} y={10} amount={0.15}>
                <Card className="border-white/70 bg-white/90 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:bg-white/75 sm:backdrop-blur-md sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-medium text-gray-900">
                          {b.descripcion}
                        </h3>
                        <Badge color={isExpired ? "red" : isAgotado ? "yellow" : "green"}>
                          {isExpired ? "Vencido" : isAgotado ? "Agotado" : "Activo"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Vence: {" "}
                        {new Date(b.fechaExpiracion).toLocaleDateString("es-AR")}
                        {b.maxUsos && ` · ${canjeados}/${b.maxUsos} usos`}
                        {" · "}
                        {formatDias(b.diasValidos)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {b._count.reclamos} reclamos · {canjeados} canjeados
                      </p>
                    </div>
                    <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
                      <ShareButtons url={shareUrl} descripcion={b.descripcion} nombreLocal={local.nombre!} fechaExpiracion={b.fechaExpiracion} />
                      <LinkButton
                        href={`/dashboard/beneficios/${b.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Ver detalle
                      </LinkButton>
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <LinkButton
                href={`/dashboard?page=${page - 1}`}
                variant="secondary"
                size="sm"
                className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                aria-disabled={page <= 1}
              >
                ← Anterior
              </LinkButton>
              <span className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </span>
              <LinkButton
                href={`/dashboard?page=${page + 1}`}
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
