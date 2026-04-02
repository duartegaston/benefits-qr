import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import ReclamarForm from "@/components/ReclamarForm";

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
      reclamos: { where: { estado: "CANJEADO" }, select: { id: true } },
    },
  });

  if (!beneficio) notFound();

  const isExpired = beneficio.fechaExpiracion < new Date();
  const canjeados = beneficio.reclamos.length;
  const isAgotado = beneficio.maxUsos !== null && canjeados >= beneficio.maxUsos;

  const DIAS_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const DIAS_FULL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const todayIndex = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  ).getDay();
  const diasValidos: number[] = beneficio.diasValidos as number[];
  const tieneRestriccion = diasValidos.length > 0;
  const isWrongDay = tieneRestriccion && !diasValidos.includes(todayIndex);

  const initials = (beneficio.local.nombre ?? "")
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center px-4 py-4 sm:py-8 relative">
      {/* Decorative blobs — desktop only */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-3xl hidden sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent-soft/60 blur-3xl hidden sm:block" />

      <div className="w-full max-w-md relative my-auto animate-[fade-up_0.45s_ease-out_both]">
        {/* Logo Qupón */}
        <div className="flex justify-center mb-3">
          <Image
            src="/logo.png"
            alt="Qupón"
            width={52}
            height={52}
            className="rounded-2xl shadow-lg shadow-primary/30 ring-4 ring-surface/60"
          />
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl shadow-xl shadow-accent-soft/60">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />

          <div className="bg-surface/90 sm:bg-surface/80 sm:backdrop-blur-md border border-t-0 border-border-default p-4 sm:p-6">
            {/* Local info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-soft flex items-center justify-center shrink-0 shadow-sm">
                {beneficio.local.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={beneficio.local.logoUrl}
                    alt={beneficio.local.nombre ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-sm">{initials}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted leading-none mb-0.5">Cupón de</p>
                <p className="text-sm font-semibold text-text-primary">{beneficio.local.nombre}</p>
              </div>
            </div>

            <h1 className="text-xl font-bold text-text-primary mb-2 leading-tight">
              {beneficio.descripcion}
            </h1>

            <div className="flex gap-2 flex-wrap mb-3">
              {isExpired && <Badge color="red">Vencido</Badge>}
              {isAgotado && <Badge color="red">Agotado</Badge>}
              {isWrongDay && !isExpired && !isAgotado && (
                <Badge color="red">No disponible hoy</Badge>
              )}
              {!isExpired && !isAgotado && !isWrongDay && (
                <Badge color="green">Disponible</Badge>
              )}
              <Badge color="gray">
                Vence:{" "}
                {new Date(beneficio.fechaExpiracion).toLocaleDateString("es-AR")}
              </Badge>
              {tieneRestriccion && (
                <Badge color="gray">
                  {diasValidos
                    .sort((a, b) => a - b)
                    .map((d) => DIAS_LABELS[d])
                    .join(" · ")}
                </Badge>
              )}
            </div>

            {!isExpired && !isAgotado && !isWrongDay ? (
              <ReclamarForm beneficioId={beneficio.id} />
            ) : (
              <div className="bg-danger-soft rounded-xl p-4 text-center">
                <p className="text-danger font-medium text-sm">
                  {isExpired
                    ? "Este cupón ya expiró"
                    : isAgotado
                    ? "Este cupón está agotado"
                    : `Este cupón no está disponible los ${DIAS_FULL[todayIndex]}s. Aplica los: ${diasValidos
                        .sort((a, b) => a - b)
                        .map((d) => DIAS_FULL[d])
                        .join(", ")}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs text-text-muted/80 mt-3">
          Powered by Qupón
        </p>
      </div>
    </main>
  );
}
