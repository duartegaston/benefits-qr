"use client";
import { useState } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  descripcion: string;
  nombreLocal: string;
  fechaExpiracion: Date | string;
}

export default function ShareButtons({ url, descripcion, nombreLocal, fechaExpiracion }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fechaStr = new Date(fechaExpiracion).toLocaleDateString("es-AR");
  const texto = `Tenés este cupón para canjear en ${nombreLocal}: ${descripcion}\nVence el ${fechaStr}\n${url}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Compartir por WhatsApp"
        aria-label="Compartir por WhatsApp"
        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
      >
        <MessageCircle aria-hidden="true" className="w-4 h-4 text-green-600" />
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent("Beneficio especial para vos")}&body=${encodeURIComponent(texto)}`}
        title="Compartir por email"
        aria-label="Compartir por email"
        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Mail aria-hidden="true" className="w-4 h-4 text-blue-600" />
      </a>

      <button
        onClick={handleCopy}
        title={copied ? "¡Copiado!" : "Copiar enlace"}
        aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
        className={`p-1.5 rounded-lg transition-colors ${copied ? "bg-green-50" : "bg-violet-50 hover:bg-violet-100"}`}
      >
        {copied ? (
          <Check aria-hidden="true" className="w-4 h-4 text-green-600" />
        ) : (
          <Copy aria-hidden="true" className="w-4 h-4 text-violet-600" />
        )}
      </button>
    </div>
  );
}
