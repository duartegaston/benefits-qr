import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import DashboardHeader from "@/components/local/dashboard/DashboardHeader";

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
      <DashboardHeader />
      {children}
    </div>
  );
}
