import ClienteHeader from "@/components/cliente/mis-beneficios/ClienteHeader";
import { getClienteSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import { redirect } from "next/navigation";

export default async function MisBeneficiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClienteSessionFromCookies();

  if (!session || session.userType !== UserType.CLIENTE) {
    redirect("/acceso");
  }

  return (
    <div className="min-h-screen">
      <ClienteHeader />
      <div className="px-0 lg:px-0">{children}</div>
    </div>
  );
}
