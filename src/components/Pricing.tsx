import Link from "next/link";

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
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
  "Cupones ilimitados desde el primer día",
  "Sin comisiones por canje",
  "Soporte por WhatsApp y mail",
  "Estadísticas de uso en tiempo real",
  "Acceso desde cualquier dispositivo",
  "Sin permanencia — cancelás cuando querés",
];

export default function Pricing() {
  return (
    <section className="bg-gray-50 py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 block">
            Precios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Empezá gratis, crecé sin límites
          </h2>
          <p className="text-gray-600 mt-3 max-w-lg mx-auto leading-relaxed">
            El primer mes lo cubrimos nosotros. Probá todas las funciones sin tarjeta ni compromiso.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top banner */}
          <div className="bg-violet-600 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-violet-200 text-sm font-medium">Primer mes</p>
              <p className="text-white text-2xl font-black tracking-tight">Totalmente gratis</p>
            </div>
            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              Sin tarjeta requerida
            </span>
          </div>

          {/* Body */}
          <div className="px-8 py-8 sm:flex sm:gap-10">
            {/* Price */}
            <div className="sm:w-48 shrink-0 mb-8 sm:mb-0">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Luego del primer mes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">$12.000</span>
                <span className="text-gray-400 text-sm">/mes</span>
              </div>
              <p className="text-gray-400 text-xs mt-1 mb-6">ARS · IVA incluido</p>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 w-full px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                Crear mi cuenta
                <IconArrow />
              </Link>
              <p className="text-center text-xs text-gray-400 mt-3">
                Sin cargo hasta el día 31
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

            {/* Features */}
            <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                    <IconCheck />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reassurance */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Tenés dudas? Escribinos a{" "}
          <a href="mailto:qupon.ar@gmail.com" className="text-violet-600 hover:underline">
            qupon.ar@gmail.com
          </a>{" "}
          y te respondemos al toque.
        </p>
      </div>
    </section>
  );
}
