import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CalendarDays, CircleAlert, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EstadoReclamo } from "@/generated/prisma/client";
export const revalidate = 60;
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ReclamarForm from "@/components/cliente/beneficio/ReclamarForm";
import LinkButton from "@/components/ui/LinkButton";
import Reveal from "@/components/ui/Reveal";
import { formatDateAR } from "@/lib/dates";
import {
  formatDiasValidosSentence,
  getDiaLabel,
  sortDiasValidos,
} from "@/lib/beneficioSchedule";

export default async function BeneficioPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const beneficio = await prisma.beneficio.findUnique({
    where: { id, deletedAt: null },
    include: {
      local: { select: { nombre: true, logoUrl: true } },
      _count: { select: { reclamos: true } },
      reclamos: { where: { estado: EstadoReclamo.CANJEADO }, select: { id: true } },
    },
  });

  if (!beneficio) notFound();

  const isExpired = beneficio.fechaExpiracion < new Date();
  const canjeados = beneficio.reclamos.length;
  const isAgotado = beneficio.maxUsos !== null && canjeados >= beneficio.maxUsos;

  const todayIndex = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  ).getDay();
  const diasValidos: number[] = beneficio.diasValidos as number[];
  const tieneRestriccion = diasValidos.length > 0;
  const isWrongDay = tieneRestriccion && !diasValidos.includes(todayIndex);
  const diasValidosOrdenados = sortDiasValidos(diasValidos);
  const availability = isExpired
    ? {
        badgeColor: "red" as const,
        badgeLabel: "Vencido",
        message: "Este cupón ya expiró.",
      }
    : isAgotado
      ? {
          badgeColor: "red" as const,
          badgeLabel: "Agotado",
          message: "Este cupón alcanzó el límite de usos disponibles.",
        }
      : isWrongDay
        ? {
            badgeColor: "warning" as const,
            badgeLabel: "No disponible hoy",
            message: `Este cupón no está disponible los ${getDiaLabel(todayIndex, "full")}s. Aplica los ${formatDiasValidosSentence(
              diasValidosOrdenados,
              {
                emptyLabel: "",
                prefix: "",
                style: "full",
              }
            )}.`,
          }
        : {
            badgeColor: "green" as const,
            badgeLabel: "Disponible",
            message: "Completá tus datos y te mandamos un link para guardar este beneficio en tu cuenta.",
          };

  const initials = (beneficio.local.nombre ?? "")
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
        href="/"
        variant="subtle"
        size="sm"
        className="absolute top-5 left-5 z-40 sm:top-6 sm:left-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Inicio
      </LinkButton>

      <div className="my-auto w-full max-w-md">
        <Reveal y={14} amount={0.3}>
          <div className="mb-7 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-24">
                <Image
                  src="/logo.png"
                  alt="Qupón"
                  width={500}
                  height={450}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Badge
                color={availability.badgeColor}
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
              >
                {availability.badgeLabel}
              </Badge>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-text-primary">
                  {beneficio.descripcion}
                </h1>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06} y={16} amount={0.35}>
          <Card className="overflow-hidden border-surface/80 bg-surface/90 shadow-xl shadow-primary-soft/60 sm:bg-surface/80 sm:backdrop-blur-md">
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />

            <div className="space-y-5 p-6 sm:p-8">
              <div className="rounded-2xl border border-border-default/70 bg-surface-muted/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-primary shadow-sm">
                    {beneficio.local.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={beneficio.local.logoUrl}
                        alt={beneficio.local.nombre ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{initials}</span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                      <Store className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Local adherido</span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {beneficio.local.nombre}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge color="gray" className="gap-1.5 px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    Vence {formatDateAR(beneficio.fechaExpiracion)}
                  </Badge>
                  {tieneRestriccion ? (
                    <Badge color="gray" className="px-3 py-1">
                      {formatDiasValidosSentence(diasValidosOrdenados, {
                        emptyLabel: "",
                        prefix: "Válido los",
                      })}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {!isExpired && !isAgotado && !isWrongDay ? (
                <div className="space-y-4">
                  <ReclamarForm beneficioId={beneficio.id} />
                </div>
              ) : (
                <div
                  aria-live="polite"
                  className="rounded-2xl border border-danger-border bg-danger-soft/60 px-4 py-3 text-sm text-danger"
                >
                  <div className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{availability.message}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Reveal>

        <p className="mt-3 text-center text-xs text-text-muted/80">Powered by Qupón</p>
      </div>
    </main>
  );
}
