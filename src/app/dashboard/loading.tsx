import Card from "@/components/ui/Card";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen px-4 pt-4 pb-32 sm:px-6 sm:pt-6 sm:pb-16 max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-9 w-12 bg-gray-200 rounded animate-pulse" />
          </Card>
        ))}
      </div>
      {/* Benefit cards */}
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
