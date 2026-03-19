import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-violet-600 mb-3">BenefitQR</h1>
          <p className="text-xl text-gray-600">
            Crea y gestioná beneficios para tus clientes con códigos QR
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <h2 className="font-semibold text-gray-900 mb-2">Para Locales</h2>
            <p className="text-gray-500 text-sm mb-4">
              Registrá tu local, creá beneficios y gestioná los canjes.
            </p>
            <Link
              href="/login"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors inline-block"
            >
              Ingresar
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <h2 className="font-semibold text-gray-900 mb-2">Para Clientes</h2>
            <p className="text-gray-500 text-sm mb-4">
              Recibí un enlace de un beneficio y empezá a ahorrar.
            </p>
            <Link
              href="/mis-beneficios"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors inline-block"
            >
              Mis beneficios
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
