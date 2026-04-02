import Card from "@/components/ui/Card";

type MetricCardColor = "white" | "gray" | "violet" | "violet-strong" | "green" | "yellow";

interface MetricCardProps {
  label: string;
  value: number;
  color?: MetricCardColor;
}

const colorStyles: Record<MetricCardColor, { wrapper: string; label: string; value: string }> = {
  white: {
    wrapper: "border-surface/80 bg-surface/95 shadow-sm shadow-primary-soft/40 sm:bg-surface/85",
    label: "text-text-muted",
    value: "text-text-primary",
  },
  gray: {
    wrapper: "border-border-default/80 bg-surface-muted/70",
    label: "text-text-muted",
    value: "text-text-primary",
  },
  violet: {
    wrapper: "border-primary-soft/70 bg-surface-soft/80",
    label: "text-accent",
    value: "text-accent",
  },
  "violet-strong": {
    wrapper: "border-border-strong/40 bg-primary shadow-md shadow-primary-soft/60",
    label: "text-text-soft",
    value: "text-primary-foreground",
  },
  green: {
    wrapper: "border-success-soft/70 bg-success-soft/60",
    label: "text-success",
    value: "text-success",
  },
  yellow: {
    wrapper: "border-warning-soft/70 bg-warning-soft/60",
    label: "text-warning",
    value: "text-warning",
  },
};

export default function MetricCard({
  label,
  value,
  color = "gray",
}: MetricCardProps) {
  const styles = colorStyles[color];

  return (
    <Card className={`rounded-xl p-3 sm:p-4 ${styles.wrapper}`}>
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wide sm:text-xs ${styles.label}`}>
        {label}
      </p>
      <p className={`text-xl font-bold sm:text-2xl ${styles.value}`}>{value}</p>
    </Card>
  );
}
