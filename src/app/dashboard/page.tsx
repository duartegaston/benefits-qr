import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ShareButtons from "@/components/local/dashboard/ShareButtons";
import LogoUpload from "@/components/local/LogoUpload";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import MetricCard from "@/components/ui/MetricCard";
import { formatDiasValidosSentence } from "@/lib/beneficioSchedule";
import { formatDateAR } from "@/lib/dates";
import { getBeneficioStatusPresentation } from "@/lib/statusPresentation";
import { getDashboardPageData } from "@/server/services/dashboardService";

const PAGE_SIZE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }

  const {
    local,
    beneficios,
    totalBeneficios,
    totalReclamos,
    totalCanjeados,
    totalPages,
  } = await getDashboardPageData(session.userId, page, PAGE_SIZE);

  if (!local) redirect("/login");
  if (local.nombre === null) redirect("/onboarding");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-32 sm:px-6 sm:pt-8 sm:pb-16">
      <Reveal y={10} amount={0.2} className="mb-5 sm:mb-6">
        <div className="mb-5 space-y-1 sm:mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard del local</h1>
          <p className="text-sm text-text-muted">
            Gestioná tus cupones, seguí los reclamos y validá canjes desde un solo lugar.
          </p>
        </div>

        <div className="rounded-2xl border border-surface/80 bg-surface/95 p-3 shadow-sm shadow-primary-soft/40 sm:bg-surface/85 sm:p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="shrink-0">
                <LogoUpload
                  currentLogoUrl={local.logoUrl}
                  nombre={local.nombre!}
                />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-lg font-bold leading-tight text-text-primary sm:text-xl">
                  {local.nombre}
                </h1>
                <p className="text-sm font-medium text-text-muted break-all">
                  {local.email}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <LinkButton
                href="/dashboard/escanear"
                variant="light"
                size="sm"
                className="w-full sm:w-auto"
              >
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
          <MetricCard label="Cupones" value={totalBeneficios} variant="muted" />
        </Reveal>
        <Reveal delay={0.06} y={14} amount={0.25}>
          <MetricCard label="Reclamos" value={totalReclamos} variant="muted" />
        </Reveal>
        <Reveal delay={0.12} y={14} amount={0.25}>
          <MetricCard label="Canjeados" value={totalCanjeados} variant="primary" />
        </Reveal>
      </div>

      {/* Beneficios */}
      <Reveal y={8} amount={0.2} className="mb-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-surface/80 bg-surface/95 p-4 sm:flex-row sm:items-center sm:justify-between sm:bg-surface/85 sm:p-5">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Mis cupones</h2>
            <p className="text-sm font-medium text-text-muted">
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
          <Card className="border-surface/70 bg-surface/90 p-10 text-center sm:bg-surface/75 sm:backdrop-blur-md sm:p-12">
            <p className="mb-2 text-base font-medium text-text-primary">
              No tenés cupones aún
            </p>
            <p className="mb-5 text-sm text-text-muted">
              Creá el primero para empezar a recibir reclamos.
            </p>
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
            const canjeados = b.canjeados;
            const isAgotado = b.maxUsos !== null && canjeados >= b.maxUsos;
            const shareUrl = `${appUrl}/beneficio/${b.id}`;
            const vencimiento = formatDateAR(b.fechaExpiracion);
            const status = getBeneficioStatusPresentation(isExpired, isAgotado);

            return (
              <Reveal
                key={b.id}
                delay={Math.min(index * 0.04, 0.2)}
                y={10}
                amount={0.15}
              >
                <Card
                  className={`border border-surface/80 border-l-4 ${status.dashboardCardToneClassName} ${status.dashboardCardSurfaceClassName} p-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                        <h3 className="truncate text-base font-semibold text-text-primary sm:text-lg">
                          {b.descripcion}
                        </h3>
                        <Badge variant={status.badgeVariant}>{status.label}</Badge>
                      </div>

                      <div className="grid gap-1 text-[13px] leading-tight sm:grid-cols-2 sm:gap-1.5 sm:text-sm">
                        <p className="font-medium text-text-muted">
                          <span className="font-semibold text-text-primary">
                            Vence:
                          </span>{" "}
                          {vencimiento}
                        </p>
                        <p className="font-medium text-text-muted sm:text-right">
                          <span className="font-semibold text-text-primary">
                            Usos:
                          </span>{" "}
                          {b.maxUsos
                            ? `${canjeados}/${b.maxUsos}`
                            : `${canjeados}/∞`}
                        </p>
                        <p className="sm:col-span-2 text-[13px] font-medium text-text-muted sm:text-sm">
                          {formatDiasValidosSentence(b.diasValidos)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                        <Badge variant="muted">
                          Reclamos: {b.totalReclamos}
                        </Badge>
                        <Badge variant="light">Canjeados: {canjeados}</Badge>
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end sm:justify-start">
                      <ShareButtons
                        url={shareUrl}
                        descripcion={b.descripcion}
                        nombreLocal={local.nombre!}
                        fechaExpiracion={b.fechaExpiracion}
                      />
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
                className={
                  page <= 1 ? "pointer-events-none opacity-50" : undefined
                }
                aria-disabled={page <= 1}
              >
                ← Anterior
              </LinkButton>
              <span className="text-sm text-text-muted">
                Página {page} de {totalPages}
              </span>
              <LinkButton
                href={`/dashboard?page=${page + 1}`}
                variant="secondary"
                size="sm"
                className={
                  page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
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
