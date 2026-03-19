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
      className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm hover:bg-violet-100 transition-colors min-w-[90px]"
    >
      {copied ? "¡Copiado! ✓" : "Copiar link"}
    </button>
  );
}
