import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DashboardActions from "@/components/DashboardActions";
import ShareButtons from "@/components/ShareButtons";
import LogoUpload from "@/components/LogoUpload";

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
        where: { localId: session.userId },
        include: {
          _count: { select: { reclamos: true } },
          reclamos: { where: { estado: "CANJEADO" }, select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.beneficio.count({ where: { localId: session.userId } }),
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
    <main className="min-h-screen px-4 pt-4 pb-32 sm:px-6 sm:pt-6 sm:pb-16 max-w-5xl mx-auto animate-[fade-in_0.3s_ease-out_both]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <LogoUpload currentLogoUrl={local.logoUrl} nombre={local.nombre!} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{local.nombre}</h1>
            <p className="text-gray-500 text-sm">{local.email}</p>
          </div>
        </div>
        <DashboardActions />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 animate-[fade-up_0.45s_ease-out_both]" style={{ animationDelay: "0ms" }}>
          <p className="text-sm text-gray-500 mb-1">Beneficios</p>
          <p className="text-3xl font-bold text-gray-900">{totalBeneficios}</p>
        </Card>
        <Card className="p-6 animate-[fade-up_0.45s_ease-out_both]" style={{ animationDelay: "80ms" }}>
          <p className="text-sm text-gray-500 mb-1">Total reclamos</p>
          <p className="text-3xl font-bold text-gray-900">{totalReclamos}</p>
        </Card>
        <Card className="p-6 animate-[fade-up_0.45s_ease-out_both]" style={{ animationDelay: "160ms" }}>
          <p className="text-sm text-gray-500 mb-1">Canjeados</p>
          <p className="text-3xl font-bold text-violet-600">{totalCanjeados}</p>
        </Card>
      </div>

      {/* Beneficios */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mis beneficios</h2>
        <Link
          href="/dashboard/beneficios/nuevo"
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          + Nuevo beneficio
        </Link>
      </div>

      {totalBeneficios === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-400 mb-4">No tenés beneficios aún</p>
          <Link
            href="/dashboard/beneficios/nuevo"
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Crear primer beneficio
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {beneficios.map((b) => {
            const isExpired = b.fechaExpiracion < new Date();
            const canjeados = b.reclamos.length;
            const isAgotado = b.maxUsos !== null && canjeados >= b.maxUsos;
            const shareUrl = `${appUrl}/beneficio/${b.id}`;

            return (
              <Card key={b.id} className="p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 truncate">
                        {b.descripcion}
                      </h3>
                      <Badge color={isExpired ? "red" : isAgotado ? "yellow" : "green"}>
                        {isExpired ? "Vencido" : isAgotado ? "Agotado" : "Activo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Vence:{" "}
                      {new Date(b.fechaExpiracion).toLocaleDateString("es-AR")}
                      {b.maxUsos && ` · ${canjeados}/${b.maxUsos} usos`}
                      {" · "}{formatDias(b.diasValidos)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {b._count.reclamos} reclamos · {canjeados} canjeados
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <ShareButtons url={shareUrl} descripcion={b.descripcion} nombreLocal={local.nombre!} fechaExpiracion={b.fechaExpiracion} />
                    <Link
                      href={`/dashboard/beneficios/${b.id}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Ver stats
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/dashboard?page=${page - 1}`}
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
                href={`/dashboard?page=${page + 1}`}
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
