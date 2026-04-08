import Card from "@/components/ui/Card";
import type { SemanticVisualVariant } from "@/components/ui/buttonStyles";

export type MetricCardVariant = Extract<
  SemanticVisualVariant,
  "muted" | "secondary" | "light" | "primary" | "warning"
>;

interface MetricCardProps {
  label: string;
  value: number;
  variant?: MetricCardVariant;
}

const metricCardStyles: Record<
  MetricCardVariant,
  { wrapper: string; label: string; value: string }
> = {
  muted: {
    wrapper: "border-surface/80 bg-surface/95 shadow-sm shadow-primary-soft/40 sm:bg-surface/85",
    label: "text-text-muted",
    value: "text-text-primary",
  },
  secondary: {
    wrapper: "border-border-default/80 bg-surface-muted/70",
    label: "text-text-muted",
    value: "text-text-primary",
  },
  light: {
    wrapper: "bg-accent-soft text-accent-foreground border-accent-soft/80",
    label: "text-accent-foreground/80",
    value: "text-accent-foreground",
  },
  primary: {
    wrapper: "border-border-strong/40 bg-primary shadow-md shadow-primary-soft/60",
    label: "text-text-soft",
    value: "text-primary-foreground",
  },
  warning: {
    wrapper: "border-warning-soft/70 bg-warning-soft/60",
    label: "text-warning",
    value: "text-warning",
  },
};

export default function MetricCard({
  label,
  value,
  variant = "secondary",
}: MetricCardProps) {
  const styles = metricCardStyles[variant];

  return (
    <Card className={`rounded-xl p-3 sm:p-4 ${styles.wrapper}`} data-variant={variant}>
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wide sm:text-xs ${styles.label}`}>
        {label}
      </p>
      <p className={`text-xl font-bold sm:text-2xl ${styles.value}`}>{value}</p>
    </Card>
  );
}
