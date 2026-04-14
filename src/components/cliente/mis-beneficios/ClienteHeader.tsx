"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
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
        "sticky top-0 z-40 shadow-sm transition-[background-color,box-shadow] duration-200",
        scrolled
          ? " shadow-xl  backdrop-blur-md"
          : "bg-transparent backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:h-20 lg:max-w-2xl lg:px-5 2xl:h-24 2xl:max-w-3xl 2xl:px-6">
        <div>
          <Button onClick={handleLogout} variant="logout" size="sm">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Salir
          </Button>
        </div>

        <Link
          href="/mis-beneficios"
          className="inline-flex items-center"
          aria-label="Ir a mis cupones"
        >
          <div className="w-20 lg:w-[4.5rem] 2xl:w-20">
            <Image
              src="/logo.png"
              alt="Qupón"
              width={250}
              height={180}
              priority
              className="h-auto w-full"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
