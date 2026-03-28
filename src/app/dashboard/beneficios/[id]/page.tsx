import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DeleteBeneficioButton from "@/components/DeleteBeneficioButton";
import LinkButton from "@/components/ui/LinkButton";

const DIAS_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const PAGE_SIZE = 10;

function formatDias(dias: number[]): string {
  if (dias.length === 0) return "Válido todos los días";
  const nombres = [...dias].sort((a, b) => a - b).map((d) => DIAS_LABELS[d]);
  if (nombres.length === 1) return `Válido los ${nombres[0]}`;
  const ultimo = nombres.pop();
  return `Válido los ${nombres.join(", ")} y ${ultimo}`;
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
    <main className="mx-auto max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8">

      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
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
            <p className="text-gray-500 text-sm">
              Vence:{" "}
              {new Date(beneficio.fechaExpiracion).toLocaleDateString("es-AR")}
              {beneficio.maxUsos && ` · Máx. ${beneficio.maxUsos} usos`}
              {" · "}{formatDias(beneficio.diasValidos)}
            </p>
          </div>
          {!isDeleted && (
            <div className="shrink-0">
              <DeleteBeneficioButton id={beneficio.id} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{totalReclamos}</p>
            <p className="text-xs text-gray-500 mt-1">Reclamos</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{totalCanjeados}</p>
            <p className="text-xs text-gray-500 mt-1">Canjeados</p>
          </div>
          <div className="text-center p-4 bg-violet-50 rounded-xl">
            <p className="text-2xl font-bold text-violet-600">{totalPendientes}</p>
            <p className="text-xs text-gray-500 mt-1">Pendientes</p>
          </div>
        </div>
      </Card>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Clientes ({totalReclamos})
      </h2>

      {totalReclamos === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400">Nadie reclamó este cupón aún</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {reclamos.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {r.cliente.nombre ?? r.cliente.email ?? r.cliente.phone}
                  </p>
                  <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                    {r.cliente.email && <p>{r.cliente.email}</p>}
                    {r.cliente.phone && <p>{r.cliente.phone}</p>}
                    <p className="text-gray-400">
                      Reclamó:{" "}
                      {new Date(r.fechaReclamo).toLocaleString("es-AR")}
                      {r.fechaCanje &&
                        ` · Canjeó: ${new Date(r.fechaCanje).toLocaleString("es-AR")}`}
                    </p>
                  </div>
                </div>
                <Badge
                  color={
                    r.estado === "CANJEADO"
                      ? "green"
                      : r.estado === "VENCIDO"
                      ? "red"
                      : "violet"
                  }
                >
                  {r.estado}
                </Badge>
              </div>
            </Card>
          ))}

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
              <span className="text-sm text-gray-500">
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
