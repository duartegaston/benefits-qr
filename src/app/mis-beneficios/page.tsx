import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MisBeneficiosList from "@/components/MisBeneficiosList";
import ClienteLoginForm from "@/components/ClienteLoginForm";

export default async function MisBeneficiosPage() {
  const session = await getSessionFromCookies();

  // Sin sesión → mostrar formulario de acceso
  if (!session || session.userType !== "CLIENTE") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <ClienteLoginForm />
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
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis beneficios</h1>
      <MisBeneficiosList reclamos={reclamos} />
    </main>
  );
}
