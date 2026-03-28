import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ShareButtons from "@/components/ShareButtons";
import LogoUpload from "@/components/LogoUpload";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";

const DIAS_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getBenefitStatus(isExpired: boolean, isAgotado: boolean) {
  if (isExpired) {
    return {
      label: "Vencido",
      color: "red" as const,
      cardTone: "border-l-red-400 bg-gray-50/80",
    };
  }

  if (isAgotado) {
    return {
      label: "Agotado",
      color: "yellow" as const,
      cardTone: "border-l-yellow-400 bg-amber-50/50",
    };
  }

  return {
    label: "Activo",
    color: "green" as const,
    cardTone: "border-l-green-500 bg-white/90",
  };
}

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
      <Reveal y={10} amount={0.2} className="mb-5 sm:mb-6">
        <div className="rounded-2xl border border-white/80 bg-white/95 p-3 shadow-sm shadow-violet-100/20 sm:bg-white/85 sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="shrink-0">
                <LogoUpload currentLogoUrl={local.logoUrl} nombre={local.nombre!} />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-lg font-bold leading-tight text-gray-950 sm:text-xl">
                  {local.nombre}
                </h1>
                <p className="text-sm font-medium text-gray-600 break-all">{local.email}</p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <LinkButton href="/dashboard/escanear" variant="light" size="sm" className="w-full sm:w-auto">
                <QrCode className="h-4 w-4" aria-hidden="true" />
                Escanear QR
              </LinkButton>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-3">
        <Reveal y={14} amount={0.25}>
          <Card className="border-white/80 bg-white/95 p-3 shadow-sm shadow-violet-100/25 sm:bg-white/85 sm:p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
              Cupones
            </p>
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">{totalBeneficios}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.06} y={14} amount={0.25}>
          <Card className="border-white/80 bg-white/95 p-3 shadow-sm shadow-violet-100/25 sm:bg-white/85 sm:p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
              Reclamos
            </p>
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">{totalReclamos}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.12} y={14} amount={0.25}>
          <Card className="border-violet-500/40 bg-violet-600 p-3 shadow-md shadow-violet-300/30 sm:p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-200 sm:text-xs">
              Canjeados
            </p>
            <p className="text-xl font-bold text-white sm:text-2xl">{totalCanjeados}</p>
          </Card>
        </Reveal>
      </div>

      {/* Beneficios */}
      <Reveal y={8} amount={0.2} className="mb-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/95 p-4 sm:flex-row sm:items-center sm:justify-between sm:bg-white/85 sm:p-5">
          <div>
            <h2 className="text-xl font-bold text-gray-950">Mis cupones</h2>
            <p className="text-sm font-medium text-gray-600">
              Gestioná estado, vigencia y acciones de cada cupón.
            </p>
          </div>
          <LinkButton
            href="/dashboard/beneficios/nuevo"
            variant="primary"
            size="md"
            className="w-full justify-center sm:w-auto"
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
        <div className="space-y-3 sm:space-y-4">
          {beneficios.map((b, index) => {
            const isExpired = b.fechaExpiracion < new Date();
            const canjeados = b.reclamos.length;
            const isAgotado = b.maxUsos !== null && canjeados >= b.maxUsos;
            const shareUrl = `${appUrl}/beneficio/${b.id}`;
            const vencimiento = new Date(b.fechaExpiracion).toLocaleDateString("es-AR");
            const status = getBenefitStatus(isExpired, isAgotado);

            return (
              <Reveal key={b.id} delay={Math.min(index * 0.04, 0.2)} y={10} amount={0.15}>
                <Card
                  className={`border border-white/80 border-l-4 ${status.cardTone} p-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                    !isExpired && !isAgotado ? "sm:bg-white/85" : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                        <h3 className="truncate text-base font-semibold text-gray-950 sm:text-lg">
                          {b.descripcion}
                        </h3>
                        <Badge color={status.color}>
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid gap-1 text-[13px] leading-tight sm:grid-cols-2 sm:gap-1.5 sm:text-sm">
                        <p className="font-medium text-gray-700">
                          <span className="font-semibold text-gray-900">Vence:</span> {vencimiento}
                        </p>
                        <p className="font-medium text-gray-700 sm:text-right">
                          <span className="font-semibold text-gray-900">Usos:</span>{" "}
                          {b.maxUsos ? `${canjeados}/${b.maxUsos}` : `${canjeados}/∞`}
                        </p>
                        <p className="sm:col-span-2 text-[13px] font-medium text-gray-600 sm:text-sm">
                          {formatDias(b.diasValidos)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-gray-700 sm:mt-3 sm:gap-2 sm:text-xs">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 sm:px-2.5 sm:py-1">
                          Reclamos: {b._count.reclamos}
                        </span>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800 sm:px-2.5 sm:py-1">
                          Canjeados: {canjeados}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end sm:justify-start">
                      <ShareButtons url={shareUrl} descripcion={b.descripcion} nombreLocal={local.nombre!} fechaExpiracion={b.fechaExpiracion} />
                      <LinkButton
                        href={`/dashboard/beneficios/${b.id}`}
                        variant="muted"
                        size="sm"
                        className="min-h-8 w-auto px-2.5 py-1.5 text-xs sm:min-h-9 sm:w-auto sm:px-3 sm:py-2 sm:text-sm"
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
