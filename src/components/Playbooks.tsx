function IconChannel() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const PLAYBOOKS = [
  {
    name: "El Flash Sale",
    config: "10 usos · Vence hoy",
    description: "Creá urgencia con un cupón de tiempo limitado. Ideal para liquidar stock o llenar turnos del día.",
    channel: "Instagram Stories / WhatsApp",
  },
  {
    name: "El Fidelizador",
    config: "Sin límite · 30 días",
    description: "Premiá a clientes frecuentes con un descuento exclusivo que se renueva cada mes.",
    channel: "WhatsApp",
  },
  {
    name: "El Lunes Muerto",
    config: "Válido lunes y martes",
    description: "Activá los días más flojos de la semana con un beneficio que solo vale en esas fechas.",
    channel: "Feed de Instagram",
  },
  {
    name: "El Cumpleaños",
    config: "Válido el mes de cumpleaños",
    description: "Sorprendé a tus clientes con un regalo personalizado en su mes especial.",
    channel: "Bio de Instagram",
  },
];

export default function Playbooks() {
  return (
    <section className="bg-white py-16 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 block">
            Ideas listas para usar
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Estrategias que funcionan
          </h2>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            Casos de uso reales que podés replicar en minutos.
          </p>
        </div>

        {/* Cards grid — 2x2 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLAYBOOKS.map((play) => (
            <div
              key={play.name}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow] duration-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-2.5 mb-3">
                <h3 className="font-bold text-gray-900 min-w-0 flex-1">{play.name}</h3>
                <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 whitespace-normal sm:whitespace-nowrap max-w-full">
                  {play.config}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{play.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <IconChannel />
                <span>{play.channel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
