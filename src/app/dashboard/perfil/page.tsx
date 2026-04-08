import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import { findLocalById } from "@/server/repositories/localApiRepository";
import EditPerfilForm from "@/components/local/dashboard/EditPerfilForm";

export default async function EditPerfilPage() {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }

  const local = await findLocalById(session.userId);
  if (!local) redirect("/login");

  return (
    <main className="min-h-screen flex flex-col items-center py-14 px-4">
      <div className="my-auto w-full max-w-md">
        <EditPerfilForm
          email={local.email}
          nombre={local.nombre ?? ""}
          logoUrl={local.logoUrl}
          direccion={local.direccion}
          telefono={local.telefono}
        />
      </div>
    </main>
  );
}
