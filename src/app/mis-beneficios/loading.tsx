import Card from "@/components/ui/Card";

export default function MisBeneficiosLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="h-8 w-36 bg-border-default rounded-lg animate-pulse mb-6" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-border-default rounded animate-pulse" />
                <div className="h-4 w-32 bg-surface-muted rounded animate-pulse" />
              </div>
              <div className="h-7 w-20 bg-border-default rounded-full animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
