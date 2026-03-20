import Card from "@/components/ui/Card";

export default function BeneficioLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-11 w-full bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </Card>
    </main>
  );
}
