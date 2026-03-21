import Link from "next/link";
import Image from "next/image";

function IconQr() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h3M21 18h.01" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M5 9v11h14V9" />
      <rect x="9" y="14" width="6" height="6" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M19 12v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9" />
      <path d="M8 8a3 3 0 1 1 4-4 3 3 0 1 1 4 4" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 21V9M16 21V9M2 9h20M8 3v6M16 3v6" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const FEATURES = [
  { icon: <IconQr />, label: "Canje con QR" },
  { icon: <IconPhone />, label: "Sin app extra" },
  { icon: <IconStore />, label: "Cualquier negocio" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 pt-14 pb-24 sm:px-8 sm:py-20 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-56 -left-56 w-[800px] h-[800px] rounded-full bg-violet-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 -right-56 w-[700px] h-[700px] rounded-full bg-violet-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/25 blur-3xl" />

      <div className="max-w-2xl w-full text-center relative z-10 my-auto">

        {/* Logo */}
        <div className="flex justify-center mb-7 animate-[fade-in_0.4s_ease-out_both]">
          <Image
            src="/logo.png"
            alt="Qupón"
            width={96}
            height={96}
            className="rounded-3xl shadow-2xl shadow-violet-500/35 ring-4 ring-white/60"
          />
        </div>

        {/* Badge */}
        <div className="animate-[fade-up_0.45s_ease-out_both]" style={{ animationDelay: "60ms" }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/65 backdrop-blur-sm border border-violet-200/70 text-violet-700 text-sm font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
            Plataforma de cupones digitales con QR
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mt-6 mb-4 animate-[fade-up_0.45s_ease-out_both]"
          style={{ animationDelay: "140ms" }}
        >
          Cupones que{" "}
          <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 bg-clip-text text-transparent">
            conectan negocios
          </span>
          <br className="hidden sm:block" />
          {" "}con sus clientes
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed animate-[fade-up_0.45s_ease-out_both]"
          style={{ animationDelay: "220ms" }}
        >
          Creá cupones de descuento, compartí el link y canjeá al instante con QR desde el celular.
        </p>

        {/* Feature pills */}
        <div
          className="flex flex-wrap justify-center gap-2 mt-6 mb-10 animate-[fade-up_0.45s_ease-out_both]"
          style={{ animationDelay: "300ms" }}
        >
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200/60 text-sm text-gray-700 font-medium shadow-sm"
            >
              {f.icon}
              {f.label}
            </span>
          ))}
        </div>

        {/* CTA Cards */}
        <div
          className="grid sm:grid-cols-2 gap-4 animate-[fade-up_0.45s_ease-out_both]"
          style={{ animationDelay: "380ms" }}
        >
          {/* Para Negocios */}
          <div className="group bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-lg shadow-violet-100/60 text-left hover:shadow-xl hover:shadow-violet-200/60 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4 text-violet-600">
              <IconBuilding />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1.5">Para Negocios</h2>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Registrá tu negocio, creá cupones y gestioná los canjes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors cursor-pointer"
            >
              Ingresar
              <IconArrow />
            </Link>
          </div>

          {/* Para Clientes */}
          <div className="group bg-violet-600 rounded-2xl p-6 border border-violet-500/40 shadow-lg shadow-violet-400/30 text-left hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 hover:bg-violet-700 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4 text-white">
              <IconGift />
            </div>
            <h2 className="font-semibold text-white mb-1.5">Para Clientes</h2>
            <p className="text-violet-200 text-sm mb-5 leading-relaxed">
              Accedé a todos tus cupones y descuentos en un solo lugar.
            </p>
            <Link
              href="/mis-beneficios"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-violet-700 rounded-xl text-sm font-medium hover:bg-violet-50 transition-colors cursor-pointer"
            >
              Ver mis cupones
              <IconArrow />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
