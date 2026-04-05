import { getClienteSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EstadoReclamo } from "@/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";
import MisBeneficiosList from "@/components/cliente/MisBeneficiosList";
import ClienteLoginForm from "@/components/cliente/ClienteLoginForm";

const PAGE_SIZE = 10;

export default async function MisBeneficiosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await getClienteSessionFromCookies();

  // Sin sesión → mostrar formulario de acceso
  if (!session || session.userType !== "CLIENTE") {
    return (
      <main className="flex-1 flex flex-col items-center px-4 py-8 relative">
        {/* Logo + form — centrado */}
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-[fade-up_0.45s_ease-out_both]">
          <div className="mb-6">
            <div className="w-24">
              <Image
                src="/logo.png"
                alt="Qupón"
                width={250}
                height={180}
                className="w-full h-auto"
              />
            </div>
          </div>
          <ClienteLoginForm />
        </div>
      </main>
    );
  }

  type ReclamoRow = {
    id: string;
    estado: EstadoReclamo;
    fechaReclamo: Date;
    fechaCanje: Date | null;
    beneficioDescripcion: string;
    beneficioFechaExpiracion: Date;
    beneficioDeletedAt: Date | null;
    localNombre: string | null;
    localLogoUrl: string | null;
  };

  const [rows, total] = await Promise.all([
    // 1 SQL con JOINs en vez de 3 SQL secuenciales (reclamos → beneficios IN → locals IN)
    prisma.$queryRaw<ReclamoRow[]>`
      SELECT
        r.id,
        r.estado,
        r."fechaReclamo",
        r."fechaCanje",
        b.descripcion           AS "beneficioDescripcion",
        b."fechaExpiracion"     AS "beneficioFechaExpiracion",
        b."deletedAt"           AS "beneficioDeletedAt",
        l.nombre                AS "localNombre",
        l."logoUrl"             AS "localLogoUrl"
      FROM "Reclamo" r
      JOIN "Beneficio" b ON b.id = r."beneficioId"
      JOIN "Local"     l ON l.id = b."localId"
      WHERE r."clienteId" = ${session.userId}
      ORDER BY r."fechaReclamo" DESC
      LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
    `,
    prisma.reclamo.count({ where: { clienteId: session.userId } }),
  ]);

  const reclamos = rows.map((r) => ({
    id: r.id,
    estado: r.estado,
    fechaReclamo: r.fechaReclamo,
    fechaCanje: r.fechaCanje,
    beneficio: {
      descripcion: r.beneficioDescripcion,
      fechaExpiracion: r.beneficioFechaExpiracion,
      local: { nombre: r.localNombre, logoUrl: r.localLogoUrl },
    },
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="px-4 pt-8 pb-16 sm:px-6 max-w-2xl mx-auto animate-[fade-in_0.3s_ease-out_both]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Mis cupones</h1>
        <p className="text-sm text-text-muted">{total} {total === 1 ? "cupón guardado" : "cupones guardados"}</p>
      </div>
      <MisBeneficiosList reclamos={reclamos} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Link
            href={`/mis-beneficios?page=${page - 1}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page <= 1
                ? "pointer-events-none text-text-muted/50 bg-surface-soft"
                : "text-text-primary bg-surface-muted hover:bg-border-default"
            }`}
            aria-disabled={page <= 1}
          >
            ← Anterior
          </Link>
          <span className="text-sm text-text-muted">
            Página {page} de {totalPages}
          </span>
          <Link
            href={`/mis-beneficios?page=${page + 1}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page >= totalPages
                ? "pointer-events-none text-text-muted/50 bg-surface-soft"
                : "text-text-primary bg-surface-muted hover:bg-border-default"
            }`}
            aria-disabled={page >= totalPages}
          >
            Siguiente →
          </Link>
        </div>
      )}
    </main>
  );
}
