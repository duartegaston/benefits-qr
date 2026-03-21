"use client";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";

export default function DashboardActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={handleLogout}
        className="fixed top-5 left-5 sm:top-6 sm:left-6 z-40 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        ← Salir
      </button>
      <button
        onClick={() => router.push("/dashboard/escanear")}
        className="px-4 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors cursor-pointer"
      >
        Escanear QR
      </button>
    </>
  );
}
