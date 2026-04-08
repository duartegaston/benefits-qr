"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import { cn } from "@/lib/utils";

function isDashboardHome(pathname: string): boolean {
  return pathname === "/dashboard";
}

function isDashboardInternal(pathname: string): boolean {
  return pathname.startsWith("/dashboard/");
}

export default function DashboardHeader() {
  const pathname = usePathname();
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
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:h-24 sm:px-6">
        <div>
          {isDashboardHome(pathname) ? (
            <Button onClick={handleLogout} variant="logout" size="sm">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Salir
            </Button>
          ) : isDashboardInternal(pathname) ? (
            <LinkButton
              href="/dashboard"
              variant="subtle"
              size="sm"
            >
              ← Dashboard
            </LinkButton>
          ) : null}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center"
          aria-label="Ir al dashboard"
        >
          <div className="w-20">
            <Image
              src="/logo.png"
              alt="Qupón"
              width={250}
              height={180}
              priority
              className="w-full h-auto"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
