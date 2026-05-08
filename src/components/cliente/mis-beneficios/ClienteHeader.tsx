"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/ui/BrandLogo";
import LogoutButton from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

export default function ClienteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <LogoutButton logoutEndpoint="/api/auth/cliente/logout" />
        </div>

        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Ir al inicio"
        >
          <BrandLogo variant="header" priority />
        </Link>
      </div>
    </header>
  );
}
