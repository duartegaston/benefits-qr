interface StatusDistributionProps {
  distribution: {
    activos: number;
    vencidos: number;
    agotados: number;
    eliminados: number;
  };
}

const statusConfig = [
  { key: "activos", label: "Activos", color: "bg-success" },
  { key: "vencidos", label: "Vencidos", color: "bg-danger" },
  { key: "agotados", label: "Agotados", color: "bg-warning" },
  { key: "eliminados", label: "Eliminados", color: "bg-text-muted" },
] as const;

export default function StatusDistribution({ distribution }: StatusDistributionProps) {
  const total =
    distribution.activos +
    distribution.vencidos +
    distribution.agotados +
    distribution.eliminados;

  return (
    <div>
      <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-surface-muted">
        {statusConfig.map((item) => {
          const value = distribution[item.key];
          const width = total > 0 ? (value / total) * 100 : 0;

          return (
            <div
              key={item.key}
              className={item.color}
              style={{ width: `${width}%` }}
              aria-hidden
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {statusConfig.map((item) => (
          <div key={item.key} className="rounded-lg bg-surface-muted/60 px-2 py-1.5">
            <p className="font-semibold text-text-primary">{distribution[item.key]}</p>
            <p className="text-text-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
