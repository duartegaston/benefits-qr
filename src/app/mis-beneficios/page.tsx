import { getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Image from "next/image";
import Link from "next/link";
import MisBeneficiosList from "@/components/cliente/MisBeneficiosList";
import ClienteLoginForm from "@/components/cliente/ClienteLoginForm";
import { getMisBeneficiosPageData } from "@/server/services/misBeneficiosService";

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
  if (!session || session.userType !== UserType.CLIENTE) {
    return (
      <main className="flex-1 flex flex-col items-center px-4 py-8 relative">
        {/* Logo + form — centrado */}
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-[fade-up_0.45s_ease-out_both]">
          <div className="mb-6">
            <Image src="/logo.png" alt="Qupón" width={96} height={96} className="rounded-3xl shadow-xl shadow-primary-soft/70 ring-4 ring-surface/60" />
          </div>
          <ClienteLoginForm />
        </div>
      </main>
    );
  }

  const { reclamos, total, totalPages } = await getMisBeneficiosPageData(
    session.userId,
    page,
    PAGE_SIZE
  );

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
