"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ClienteHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/cliente/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b shadow-sm transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-border-strong/70 bg-surface-soft/95 shadow-md sm:bg-surface-soft/85 sm:backdrop-blur-md"
          : "border-border-strong/60 bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:h-24 sm:px-6">
        <div>
          <Button onClick={handleLogout} variant="logout" size="sm">
            Salir
          </Button>
        </div>

        <Link
          href="/mis-beneficios"
          className="inline-flex items-center"
          aria-label="Ir a mis cupones"
        >
          <Image
            src="/logo.png"
            alt="Qupón"
            width={64}
            height={64}
            priority
            className="rounded-2xl shadow-md"
          />
        </Link>
      </div>
    </header>
  );
}
