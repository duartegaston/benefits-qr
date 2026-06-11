import AuthenticatedNavbar from "@/components/auth/AuthenticatedNavbar";
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
      <AuthenticatedNavbar logoutEndpoint="/api/auth/cliente/logout" />
      <div className="px-0 pt-20 sm:pt-24 lg:px-0 lg:pt-24">{children}</div>
    </div>
  );
}
