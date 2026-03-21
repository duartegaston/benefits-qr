import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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
  const totalPages = Math.ceil(totalReclamos / PAGE_SIZE);

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-gray-900">
                {beneficio.descripcion}
              </h1>
              <Badge color={isExpired ? "red" : "green"}>
                {isExpired ? "Vencido" : "Activo"}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm">
              Vence:{" "}
              {new Date(beneficio.fechaExpiracion).toLocaleDateString("es-AR")}
              {beneficio.maxUsos && ` · Máx. ${beneficio.maxUsos} usos`}
              {" · "}{formatDias(beneficio.diasValidos)}
            </p>
          </div>
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
              <Link
                href={`/dashboard/beneficios/${id}?page=${page - 1}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page <= 1
                    ? "pointer-events-none text-gray-300 bg-gray-50"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                aria-disabled={page <= 1}
              >
                ← Anterior
              </Link>
              <span className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </span>
              <Link
                href={`/dashboard/beneficios/${id}?page=${page + 1}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page >= totalPages
                    ? "pointer-events-none text-gray-300 bg-gray-50"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                aria-disabled={page >= totalPages}
              >
                Siguiente →
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
