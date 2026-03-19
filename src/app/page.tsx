import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-violet-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-violet-200/70 blur-3xl" />

      <div className="max-w-2xl w-full text-center relative">
        <div className="mb-8">
          <div className="flex justify-center mb-5">
            <Image src="/logo.png" alt="Qupón" width={152} height={152} className="rounded-3xl shadow-xl shadow-violet-300/60" />
          </div>
          <p className="text-xl text-gray-600">
            Crea y gestioná beneficios para tus clientes con códigos QR
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left max-w-sm mx-auto">
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
        </div>
      </div>
    </main>
  );
}
