import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import { findLocalById } from "@/server/repositories/localApiRepository";
import EditPerfilForm from "@/components/local/dashboard/EditPerfilForm";

export default async function EditPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string; email?: string; direccion?: string; telefono?: string; localId?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }

  const params = await searchParams;

  // Common case: data passed via URL params from the dashboard — no DB call needed.
  if (params.nombre && params.email) {
    const logoUrl = params.localId ? `/api/locales/${params.localId}/logo` : null;
    return (
      <main className="min-h-screen flex flex-col items-center py-14 px-4">
        <div className="my-auto w-full max-w-md">
          <EditPerfilForm
            email={params.email}
            nombre={params.nombre}
            logoUrl={logoUrl}
            direccion={params.direccion || null}
            telefono={params.telefono || null}
          />
        </div>
      </main>
    );
  }

  // Fallback: direct navigation (bookmark, etc.) — fetch from DB.
  const local = await findLocalById(session.userId);
  if (!local) redirect("/login");

  return (
    <main className="min-h-screen flex flex-col items-center py-14 px-4">
      <div className="my-auto w-full max-w-md">
        <EditPerfilForm
          email={local.email}
          nombre={local.nombre ?? ""}
          logoUrl={local.logoUrl ? `/api/locales/${local.id}/logo` : null}
          direccion={local.direccion}
          telefono={local.telefono}
        />
      </div>
    </main>
  );
}
