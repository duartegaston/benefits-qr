import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <Image src="/logo.png" alt="Qupón" width={72} height={72} priority className="rounded-2xl shadow-md" />
      </div>
      {children}
    </div>
  );
}
