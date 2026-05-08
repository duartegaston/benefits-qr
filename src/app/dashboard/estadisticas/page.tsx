import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import Reveal from "@/components/ui/Reveal";
import MetricCard from "@/components/ui/MetricCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getDashboardPageData } from "@/server/services/dashboardService";

const PAGE_SIZE = 10;

export default async function DashboardStatsPage() {
  const session = await getSessionFromCookies();
  if (!session || session.userType !== UserType.LOCAL) {
    redirect("/login");
  }

  const {
    local,
    totalBeneficios,
    totalReclamos,
    totalCanjeados,
    tasaCanje,
    clientesUnicos,
    cuponesActivos,
    proximosAVencer,
  } = await getDashboardPageData(session.userId, 1, PAGE_SIZE);

  if (!local) redirect("/login");
  if (local.nombre === null) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-32 sm:px-6 sm:pt-8 sm:pb-16 lg:max-w-4xl lg:pt-7 lg:pb-14 2xl:max-w-5xl 2xl:pt-8 2xl:pb-16">
      <Reveal y={10} amount={0.2} className="mb-6 sm:mb-7">
        <SectionHeader
          eyebrow="Métricas"
          title="Estadísticas del negocio"
          description="Seguí la evolución de tus cupones y el rendimiento de canje en tiempo real."
          align="left"
          className="!mb-0"
        />
      </Reveal>

      <section className="mb-6 space-y-3 sm:mb-7 sm:space-y-4" aria-label="Volumen y conversión">
        <Reveal y={12} amount={0.2}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Volumen</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-2.5 2xl:gap-3">
          <Reveal y={14} amount={0.25}>
            <MetricCard label="Cupones" value={totalBeneficios} variant="muted" />
          </Reveal>
          <Reveal delay={0.06} y={14} amount={0.25}>
            <MetricCard label="Reclamos" value={totalReclamos} variant="muted" />
          </Reveal>
          <Reveal delay={0.12} y={14} amount={0.25}>
            <MetricCard label="Canjeados" value={totalCanjeados} variant="primary" />
          </Reveal>
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4" aria-label="Eficiencia y estado de cupones">
        <Reveal delay={0.18} y={12} amount={0.2}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Eficiencia y estado</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:gap-2.5 2xl:gap-3">
          <Reveal delay={0.24} y={14} amount={0.25}>
            <MetricCard label="Tasa canje (%)" value={tasaCanje} variant="primary" />
          </Reveal>
          <Reveal delay={0.3} y={14} amount={0.25}>
            <MetricCard label="Clientes únicos" value={clientesUnicos} variant="light" />
          </Reveal>
          <Reveal delay={0.36} y={14} amount={0.25}>
            <MetricCard label="Cupones activos" value={cuponesActivos} variant="secondary" />
          </Reveal>
          <Reveal delay={0.42} y={14} amount={0.25}>
            <MetricCard label="Vencen en 7 días" value={proximosAVencer} variant="warning" />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
