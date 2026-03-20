import Card from "@/components/ui/Card";

export default function BeneficioStatsLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-8" />
      <Card className="p-6 mb-6">
        <div className="space-y-2 mb-6">
          <div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </Card>
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-3" />
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
