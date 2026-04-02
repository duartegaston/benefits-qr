"use client";
import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 bg-surface-soft text-accent-foreground rounded-lg text-sm hover:bg-accent-soft transition-colors min-w-[90px]"
    >
      {copied ? "¡Copiado! ✓" : "Copiar link"}
    </button>
  );
}
