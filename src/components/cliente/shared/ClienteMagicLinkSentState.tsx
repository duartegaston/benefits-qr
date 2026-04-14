"use client";

import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";

interface ClienteMagicLinkSentStateProps {
  email: string;
  description: ReactNode;
  onReset: () => void;
  actionLabel?: string;
}

export default function ClienteMagicLinkSentState({
  email,
  description,
  onReset,
  actionLabel = "Usar otro email",
}: ClienteMagicLinkSentStateProps) {
  return (
    <div className="space-y-5 text-center lg:space-y-4 2xl:space-y-5">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft to-primary-soft/70 text-primary shadow-sm">
          <Mail className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-text-primary lg:text-base 2xl:text-lg">Revisá tu email</h2>
      </div>

      <div className="rounded-2xl bg-primary-soft/80 px-4 py-3 text-sm leading-relaxed text-accent lg:px-3.5 lg:py-2.5 lg:text-[13px] 2xl:px-4 2xl:py-3 2xl:text-sm">
        {description} <strong>{email}</strong>.
      </div>

      <Button
        type="button"
        variant="muted"
        size="sm"
        onClick={onReset}
        className="w-full"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
