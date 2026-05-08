"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";

interface LogoutButtonProps {
  logoutEndpoint: "/api/auth/logout" | "/api/auth/cliente/logout";
}

export default function LogoutButton({ logoutEndpoint }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch(logoutEndpoint, { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="logout"
      size="sm"
      onClick={handleLogout}
      loading={loading}
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      Salir
    </Button>
  );
}
