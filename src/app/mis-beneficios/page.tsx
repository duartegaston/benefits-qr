import { getClienteSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import MisBeneficiosList from "@/components/MisBeneficiosList";
import ClienteLoginForm from "@/components/ClienteLoginForm";

export default async function MisBeneficiosPage() {
  const session = await getClienteSessionFromCookies();

  // Sin sesión → mostrar formulario de acceso
  if (!session || session.userType !== "CLIENTE") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full flex flex-col items-center">
          <div className="mb-6">
            <Image src="/logo.png" alt="Qupón" width={96} height={96} className="rounded-3xl shadow-xl shadow-violet-300/50" />
          </div>
          <ClienteLoginForm />
        </div>
      </main>
    );
  }

  const reclamos = await prisma.reclamo.findMany({
    where: { clienteId: session.userId },
    include: {
      beneficio: {
        include: { local: { select: { nombre: true, logoUrl: true } } },
      },
    },
    orderBy: { fechaReclamo: "desc" },
  });

  return (
    <main className="min-h-screen px-4 pt-4 pb-32 sm:px-6 sm:pt-6 sm:pb-16 max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Qupón" width={72} height={72} className="rounded-2xl shadow-lg shadow-violet-300/50" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis beneficios</h1>
      <MisBeneficiosList reclamos={reclamos} />
    </main>
  );
}
