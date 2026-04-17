"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  downloadShareQrPdf,
  shareQrPdfSizeOptions,
  type ShareQrPdfSize,
} from "@/lib/shareQrPdf";

interface ShareQrPdfButtonProps {
  url: string;
}

export default function ShareQrPdfButton({ url }: ShareQrPdfButtonProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<ShareQrPdfSize>("mediano");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsGenerating(true);
    setError(null);

    try {
      await downloadShareQrPdf(url, size);
      setOpen(false);
    } catch {
      setError("No pudimos generar el PDF. Intentá de nuevo en unos segundos.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        title="Descargar QR en PDF"
        aria-label="Descargar QR en PDF"
        variant="outline"
        size="icon-2xs"
        className="rounded-lg bg-warning-soft transition-[background-color,transform,box-shadow] duration-200 hover:bg-warning-soft/95 hover:shadow-md hover:shadow-warning/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
      >
        <QrCode aria-hidden="true" className="size-4 text-warning" />
      </Button>

      <Modal
        open={open}
        onClose={() => {
          setError(null);
          setOpen(false);
        }}
        title="Descargar QR en PDF"
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-text-primary">Elegí el tamaño del QR para exportar.</p>
            <p className="text-xs text-text-muted">Se descarga un PDF listo para imprimir o compartir.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="share-qr-pdf-size" className="block text-sm font-medium text-text-primary">
              Tamaño
            </label>

            <Select value={size} onValueChange={(value) => setSize(value as ShareQrPdfSize)}>
              <SelectTrigger id="share-qr-pdf-size" aria-label="Seleccionar tamaño del QR">
                <SelectValue placeholder="Seleccioná un tamaño" />
              </SelectTrigger>
              <SelectContent>
                {shareQrPdfSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center justify-between gap-3 pr-2">
                      <span>{option.label}</span>
                      <span className="text-xs text-current/70">{option.description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p className="rounded-xl border border-danger-border bg-danger-soft px-3 py-2 text-sm text-danger" aria-live="polite">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setError(null);
                setOpen(false);
              }}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={() => void handleDownload()} disabled={isGenerating}>
              {isGenerating ? "Generando..." : "Descargar PDF"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
