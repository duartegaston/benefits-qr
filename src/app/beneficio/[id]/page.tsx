import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;
import Image from "next/image";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ReclamarForm from "@/components/ReclamarForm";

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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-200/70 blur-3xl" />
      <div className="w-full max-w-md relative">
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="Qupón" width={80} height={80} className="rounded-2xl shadow-lg shadow-violet-300/50" />
        </div>
        <div className="h-2 rounded-t-2xl bg-violet-600" />
        <Card className="rounded-t-none p-6 sm:p-8">
          <div className="mb-6">
            {/* Logo del local */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-100 flex items-center justify-center shrink-0">
                {beneficio.local.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={beneficio.local.logoUrl}
                    alt={beneficio.local.nombre ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-violet-600 font-bold text-sm">{initials}</span>
                )}
              </div>
              <p className="text-sm font-semibold text-violet-600">
                {beneficio.local.nombre}
              </p>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {beneficio.descripcion}
            </h1>
            <div className="flex gap-2 flex-wrap">
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
              {beneficio.maxUsos && (
                <Badge color="gray">
                  {canjeados}/{beneficio.maxUsos} usos
                </Badge>
              )}
              {tieneRestriccion && (
                <Badge color="gray">
                  {diasValidos
                    .sort((a, b) => a - b)
                    .map((d) => DIAS_LABELS[d])
                    .join(" · ")}
                </Badge>
              )}
            </div>
          </div>

          {!isExpired && !isAgotado && !isWrongDay ? (
            <ReclamarForm beneficioId={beneficio.id} />
          ) : (
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">
                {isExpired
                  ? "Este beneficio ya expiró"
                  : isAgotado
                  ? "Este beneficio está agotado"
                  : `Este beneficio no está disponible los ${DIAS_FULL[todayIndex]}s. Aplica los: ${diasValidos
                      .sort((a, b) => a - b)
                      .map((d) => DIAS_FULL[d])
                      .join(", ")}`}
              </p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
