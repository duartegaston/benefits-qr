import { getClienteSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import MisBeneficiosList from "@/components/MisBeneficiosList";
import ClienteLoginForm from "@/components/ClienteLoginForm";

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
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full flex flex-col items-center">
          <div className="mb-6">
            <Image src="/logo.png" alt="Qupón" width={96} height={96} className="rounded-3xl shadow-xl shadow-violet-300/50" />
          </div>
          <ClienteLoginForm />
        </div>
      </main>
    );
  }

  const [reclamos, total] = await Promise.all([
    prisma.reclamo.findMany({
      where: { clienteId: session.userId },
      include: {
        beneficio: {
          include: { local: { select: { nombre: true, logoUrl: true } } },
        },
      },
      orderBy: { fechaReclamo: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.reclamo.count({ where: { clienteId: session.userId } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen px-4 pt-4 pb-32 sm:px-6 sm:pt-6 sm:pb-16 max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Qupón" width={72} height={72} className="rounded-2xl shadow-lg shadow-violet-300/50" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis beneficios</h1>
      <MisBeneficiosList reclamos={reclamos} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Link
            href={`/mis-beneficios?page=${page - 1}`}
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
            href={`/mis-beneficios?page=${page + 1}`}
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
    </main>
  );
}
