"use client";
import { useState } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDateAR } from "@/lib/dates";

interface ShareButtonsProps {
  url: string;
  descripcion: string;
  nombreLocal: string;
  fechaExpiracion: Date | string;
}

export default function ShareButtons({ url, descripcion, nombreLocal, fechaExpiracion }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fechaStr = formatDateAR(fechaExpiracion);
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
        className="p-1.5 rounded-lg bg-success-soft transition-[background-color,transform,box-shadow] duration-200 hover:bg-success-soft/95 hover:shadow-md hover:shadow-success/20 hover:-translate-y-0.5"
      >
        <MessageCircle aria-hidden="true" className="w-4 h-4 text-success" />
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent("Beneficio especial para vos")}&body=${encodeURIComponent(texto)}`}
        title="Compartir por email"
        aria-label="Compartir por email"
        className="p-1.5 rounded-lg bg-accent-soft transition-[background-color,transform,box-shadow] duration-200 hover:bg-accent-soft/95 hover:shadow-md hover:shadow-accent/20 hover:-translate-y-0.5"
      >
        <Mail aria-hidden="true" className="w-4 h-4 text-accent" />
      </a>

      <Button
        type="button"
        onClick={handleCopy}
        title={copied ? "¡Copiado!" : "Copiar enlace"}
        aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
        variant="outline"
        size="icon-2xs"
        className={`rounded-lg transition-[background-color,transform,box-shadow] duration-200 hover:bg-primary-soft/95 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${copied ? "bg-success-soft hover:bg-success-soft/95 hover:shadow-success/20" : "bg-primary-soft"}`}
      >
        {copied ? (
          <Check aria-hidden="true" className="w-4 h-4 text-success" />
        ) : (
          <Copy aria-hidden="true" className="w-4 h-4 text-primary" />
        )}
      </Button>
    </div>
  );
}
