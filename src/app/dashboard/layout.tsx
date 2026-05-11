import { redirect } from "next/navigation";
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
      <div className="px-0 pb-24 lg:px-0">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
