import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
    },
  });

  if (!beneficio) notFound();

  const isExpired = beneficio.fechaExpiracion < new Date();
  const isAgotado =
    beneficio.maxUsos !== null &&
    beneficio._count.reclamos >= beneficio.maxUsos;

  const initials = (beneficio.local.nombre ?? "")
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              {!isExpired && !isAgotado && (
                <Badge color="green">Disponible</Badge>
              )}
              <Badge color="gray">
                Vence:{" "}
                {new Date(beneficio.fechaExpiracion).toLocaleDateString("es-AR")}
              </Badge>
              {beneficio.maxUsos && (
                <Badge color="gray">
                  {beneficio._count.reclamos}/{beneficio.maxUsos} usos
                </Badge>
              )}
            </div>
          </div>

          {!isExpired && !isAgotado ? (
            <ReclamarForm beneficioId={beneficio.id} />
          ) : (
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">
                {isExpired ? "Este beneficio ya expiró" : "Este beneficio está agotado"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
