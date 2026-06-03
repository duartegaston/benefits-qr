import type { TopCliente } from "@/server/services/dashboardStatsService";

interface TopClientesProps {
  clientes: TopCliente[];
}

export default function TopClientes({ clientes }: TopClientesProps) {
  if (clientes.length === 0) {
    return <p className="text-sm text-text-muted">Sin canjes registrados aún.</p>;
  }

  return (
    <div className="space-y-2.5">
      {clientes.map((cliente, index) => {
        const nombre = cliente.nombre || cliente.email || "Cliente sin nombre";

        return (
          <div
            key={cliente.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-surface/70 bg-surface-muted/45 p-2.5"
          >
            <p className="truncate text-sm font-semibold text-text-primary">
              #{index + 1} {nombre}
            </p>
            <p className="shrink-0 text-[11px] font-semibold text-text-primary sm:text-xs">
              {cliente.canjeados} {cliente.canjeados === 1 ? "canje" : "canjes"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
