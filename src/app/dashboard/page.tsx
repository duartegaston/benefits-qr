import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DashboardActions from "@/components/DashboardActions";
import ShareButtons from "@/components/ShareButtons";
import LogoUpload from "@/components/LogoUpload";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== "LOCAL") {
    redirect("/login");
  }

  const [local, beneficios] = await Promise.all([
    prisma.local.findUnique({ where: { id: session.userId } }),
    prisma.beneficio.findMany({
      where: { localId: session.userId },
      include: {
        _count: { select: { reclamos: true } },
        reclamos: { select: { estado: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!local) redirect("/login");
  if (local.nombre === null) redirect("/onboarding");

  const totalReclamos = beneficios.reduce(
    (sum: number, b) => sum + b._count.reclamos,
    0
  );
  const totalCanjeados = beneficios.reduce(
    (sum: number, b) =>
      sum + b.reclamos.filter((r: { estado: string }) => r.estado === "CANJEADO").length,
    0
  );

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
          <p className="text-3xl font-bold text-gray-900">{beneficios.length}</p>
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

      {beneficios.length === 0 ? (
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
            const canjeados = b.reclamos.filter(
              (r: { estado: string }) => r.estado === "CANJEADO"
            ).length;
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
                      {b.maxUsos && ` · ${b._count.reclamos}/${b.maxUsos} usos`}
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
        </div>
      )}
    </main>
  );
}
