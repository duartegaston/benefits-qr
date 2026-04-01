import Card from "@/components/ui/Card";

type MetricCardColor = "white" | "gray" | "violet" | "violet-strong" | "green" | "yellow";

interface MetricCardProps {
  label: string;
  value: number;
  color?: MetricCardColor;
}

const colorStyles: Record<MetricCardColor, { wrapper: string; label: string; value: string }> = {
  white: {
    wrapper: "border-white/80 bg-white/95 shadow-sm shadow-violet-100/25 sm:bg-white/85",
    label: "text-gray-500",
    value: "text-gray-900",
  },
  gray: {
    wrapper: "border-gray-200/80 bg-gray-50/70",
    label: "text-gray-500",
    value: "text-gray-900",
  },
  violet: {
    wrapper: "border-violet-200/70 bg-violet-50/60",
    label: "text-violet-700",
    value: "text-violet-700",
  },
  "violet-strong": {
    wrapper: "border-violet-500/40 bg-violet-600 shadow-md shadow-violet-300/30",
    label: "text-violet-200",
    value: "text-white",
  },
  green: {
    wrapper: "border-green-200/70 bg-green-50/60",
    label: "text-green-700",
    value: "text-green-700",
  },
  yellow: {
    wrapper: "border-yellow-200/70 bg-yellow-50/60",
    label: "text-yellow-700",
    value: "text-yellow-700",
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
