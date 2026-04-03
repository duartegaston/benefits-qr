"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant="ghost"
      className="min-w-[90px] rounded-lg px-3 py-1.5 text-sm bg-surface-soft text-accent-foreground hover:bg-accent-soft"
    >
      {copied ? "¡Copiado! ✓" : "Copiar link"}
    </Button>
  );
}
