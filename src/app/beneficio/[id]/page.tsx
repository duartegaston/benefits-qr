import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CircleAlert, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EstadoReclamo } from "@/generated/prisma/client";
export const revalidate = 60;
import Badge from "@/components/ui/Badge";
import BrandLogo from "@/components/ui/BrandLogo";
import Card from "@/components/ui/Card";
import ReclamarForm from "@/components/cliente/beneficio/ReclamarForm";
import ReclamarFormAnonimo from "@/components/cliente/beneficio/ReclamarFormAnonimo";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { formatDateAR } from "@/lib/dates";
import {
  formatDiasValidosSentence,
  sortDiasValidos,
} from "@/lib/beneficioSchedule";
import { evaluateBeneficioState } from "@/lib/couponStatus";
import { getBeneficioAvailabilityPresentation } from "@/lib/statusPresentation";

export default async function BeneficioPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const beneficio = await prisma.beneficio.findUnique({
    where: { id },
    include: {
      local: { select: { nombre: true, logoUrl: true } },
      reclamos: { where: { estado: EstadoReclamo.CANJEADO }, select: { id: true } },
    },
  });

  if (!beneficio) notFound();

  if (beneficio.deletedAt !== null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft">
              <CircleAlert className="h-8 w-8 text-text-muted" aria-hidden="true" />
            </div>
          </div>
          <h1 className="mb-2 text-xl font-bold text-text-primary">Cupón no disponible</h1>
          <p className="mb-6 text-sm text-text-muted">
            Este cupón fue eliminado o ya no se encuentra disponible.
          </p>
          <LinkButton href="/beneficios" variant="primary" size="sm">
            Ver otros beneficios
          </LinkButton>
        </div>
      </main>
    );
  }

  const diasValidos: number[] = beneficio.diasValidos as number[];
  const beneficioState = evaluateBeneficioState({
    fechaExpiracion: beneficio.fechaExpiracion,
    deletedAt: beneficio.deletedAt,
    maxUsos: beneficio.maxUsos,
    canjeados: beneficio.reclamos.length,
    diasValidos,
  });
  const tieneRestriccion = diasValidos.length > 0;
  const diasValidosOrdenados = sortDiasValidos(diasValidos);
  const localName = beneficio.local.nombre ?? "Local adherido";
  const availability = getBeneficioAvailabilityPresentation({
    status: beneficioState.status,
    isWrongDay: beneficioState.isWrongDay,
    diasValidos,
  });

  const initials = localName
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden px-4 py-14 sm:overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 hidden h-[600px] w-[600px] rounded-full bg-primary/25 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 hidden h-[500px] w-[500px] rounded-full bg-primary-soft/80 blur-3xl sm:block" />

      <LinkButton
        href="/beneficios"
        variant="subtle"
        size="sm"
        className="absolute top-5 left-5 z-40 sm:top-6 sm:left-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Beneficios
      </LinkButton>

      <div className="my-auto w-full max-w-md lg:max-w-sm 2xl:max-w-md">
        <Reveal y={14} amount={0.3}>
          <div className="mb-7 text-center lg:mb-6 2xl:mb-7">
            <div className="mb-4 flex justify-center lg:mb-3.5 2xl:mb-4">
              <BrandLogo priority />
            </div>

            <SectionHeader
              eyebrow="Beneficio"
              title="Reclamá tu cupón"
              description={beneficio.requiereDatos
                ? "Completá tus datos para recibir el acceso por email y guardarlo en tu cuenta."
                : "Generá tu QR personal para presentarlo en el local."}
              className="mb-0"
            />
          </div>
        </Reveal>

        <Reveal delay={0.06} y={16} amount={0.35}>
          <Card className="overflow-hidden border-surface/80 bg-surface/90 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md">
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />

            <div className="space-y-5 p-6 sm:p-8 lg:space-y-4 lg:p-6 2xl:space-y-5 2xl:p-8">
              <div className="space-y-3 lg:space-y-2.5 2xl:space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold text-text-primary lg:text-xl 2xl:text-2xl">{beneficio.descripcion}</h1>
                    {beneficio.requiereDatos && (
                      <p className="text-sm text-text-muted lg:text-[13px] 2xl:text-sm">Guardalo ahora y usalo cuando corresponda.</p>
                    )}
                  </div>

                  <Badge
                    variant={availability.badgeVariant}
                    className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  >
                    {availability.badgeLabel}
                  </Badge>
                </div>
              </div>

              <div className="rounded-2xl border border-border-default/70 bg-surface-muted/70 p-4 lg:p-3.5 2xl:p-4">
                <div className="flex items-start gap-3 lg:gap-2.5 2xl:gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary shadow-sm lg:h-10 lg:w-10 2xl:h-11 2xl:w-11">
                    {beneficio.local.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={beneficio.local.logoUrl}
                        alt={localName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold lg:text-[13px] 2xl:text-sm">{initials || "LO"}</span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-text-muted lg:text-[11px] 2xl:text-xs">
                      <Store className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Local adherido</span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary lg:text-[13px] 2xl:text-sm">
                      {localName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 lg:space-y-2.5 2xl:space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="muted" className="gap-1.5 px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    Vence {formatDateAR(beneficio.fechaExpiracion)}
                  </Badge>
                  {tieneRestriccion ? (
                    <Badge variant="muted" className="px-3 py-1">
                      {formatDiasValidosSentence(diasValidosOrdenados, {
                        emptyLabel: "",
                        prefix: "Válido los",
                      })}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {availability.message && (
                <div
                  aria-live="polite"
                  className={`rounded-2xl border px-4 py-3 text-sm lg:px-3.5 lg:py-2.5 lg:text-[13px] 2xl:px-4 2xl:py-3 2xl:text-sm ${
                    beneficioState.isExpired
                      ? "border-danger-border bg-danger-soft/60 text-danger"
                      : "border-warning-border bg-warning-soft/60 text-warning"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{availability.message}</p>
                  </div>
                </div>
              )}

              {beneficioState.canClaim && (
                <div className="space-y-4">
                  {beneficio.requiereDatos ? (
                    <ReclamarForm beneficioId={beneficio.id} />
                  ) : (
                    <ReclamarFormAnonimo beneficioId={beneficio.id} />
                  )}
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        <p className="mt-3 text-center text-xs text-text-muted/80">Powered by Qupon</p>
      </div>
    </main>
  );
}
