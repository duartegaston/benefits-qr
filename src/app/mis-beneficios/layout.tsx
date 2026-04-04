import ClienteHeader from "@/components/ClienteHeader";

export default function MisBeneficiosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <ClienteHeader />
      {children}
    </div>
  );
}
