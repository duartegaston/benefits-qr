import { redirect } from "next/navigation";
import AuthenticatedNavbar from "@/components/auth/AuthenticatedNavbar";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import MobileBottomNav from "@/components/local/dashboard/MobileBottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AuthenticatedNavbar logoutEndpoint="/api/auth/logout" />
      <div className="px-0 pt-20 pb-24 sm:pt-24 lg:px-0 lg:pt-24">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
