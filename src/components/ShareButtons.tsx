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
        className="p-1.5 rounded-lg bg-success-soft hover:bg-success-soft/80 transition-colors"
      >
        <MessageCircle aria-hidden="true" className="w-4 h-4 text-success" />
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent("Beneficio especial para vos")}&body=${encodeURIComponent(texto)}`}
        title="Compartir por email"
        aria-label="Compartir por email"
        className="p-1.5 rounded-lg bg-accent-soft hover:bg-accent-soft/80 transition-colors"
      >
        <Mail aria-hidden="true" className="w-4 h-4 text-accent" />
      </a>

      <button
        onClick={handleCopy}
        title={copied ? "¡Copiado!" : "Copiar enlace"}
        aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
        className={`p-1.5 rounded-lg transition-colors ${copied ? "bg-success-soft" : "bg-primary-soft hover:bg-primary-soft/80"}`}
      >
        {copied ? (
          <Check aria-hidden="true" className="w-4 h-4 text-success" />
        ) : (
          <Copy aria-hidden="true" className="w-4 h-4 text-primary" />
        )}
      </button>
    </div>
  );
}
