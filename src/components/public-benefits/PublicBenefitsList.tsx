import Card from "@/components/ui/Card";
import type { PublicBenefitCardData } from "@/server/services/publicBenefitsService";
import PublicBenefitCard from "@/components/public-benefits/PublicBenefitCard";

export default function PublicBenefitsList({
  benefits,
  emptyMessage,
}: {
  benefits: PublicBenefitCardData[];
  emptyMessage?: string;
}) {
  if (benefits.length === 0) {
    return (
      <Card className="border-surface/80 bg-surface/95 p-10 text-center shadow-sm shadow-primary-soft/25 sm:bg-surface/85 sm:p-12 sm:backdrop-blur-md">
        <p className="text-sm text-text-muted">{emptyMessage ?? "No hay beneficios publicados todavía."}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {benefits.map((benefit) => (
        <PublicBenefitCard key={benefit.id} benefit={benefit} />
      ))}
    </div>
  );
}
