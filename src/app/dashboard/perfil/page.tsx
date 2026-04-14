import { redirect } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import { findLocalById } from "@/server/repositories/localApiRepository";
import EditPerfilForm from "@/components/local/dashboard/perfil/EditPerfilForm";

export default async function EditPerfilPage() {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }
  const local = await findLocalById(session.userId);
  if (!local) redirect("/login");

  return (
    <main className="mx-auto max-w-xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8">
      <Reveal y={10} amount={0.2} className="mb-6 sm:mb-8">
        <SectionHeader
          eyebrow="Negocio"
          title="Datos del negocio"
          description="Actualizá los datos públicos de tu negocio"
          align="center"
          className="!mb-0"
        />
      </Reveal>

      <Reveal delay={0.04} y={12} amount={0.2}>
        <div className="mx-auto w-full max-w-md">
          <EditPerfilForm
            email={local.email}
            nombre={local.nombre ?? ""}
            logoUrl={local.logoUrl ? `/api/locales/${local.id}/logo` : null}
            direccion={local.direccion}
            telefono={local.telefono}
          />
        </div>
      </Reveal>
    </main>
  );
}
