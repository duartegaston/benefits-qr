import { generateQRDataURL } from "@/lib/qr";

const MM_TO_POINTS = 72 / 25.4;

export const shareQrPdfSizeOptions = [
  {
    value: "chico",
    label: "Chico",
    description: "QR de 6 cm",
    qrSizeMm: 60,
    pixelWidth: 900,
  },
  {
    value: "mediano",
    label: "Mediano",
    description: "QR de 8 cm",
    qrSizeMm: 80,
    pixelWidth: 1200,
  },
  {
    value: "grande",
    label: "Grande",
    description: "QR de 10 cm",
    qrSizeMm: 100,
    pixelWidth: 1600,
  },
] as const;

export type ShareQrPdfSize = (typeof shareQrPdfSizeOptions)[number]["value"];

function mmToPoints(mm: number) {
  return mm * MM_TO_POINTS;
}

function getPdfSizeOption(size: ShareQrPdfSize) {
  return shareQrPdfSizeOptions.find((option) => option.value === size) ?? shareQrPdfSizeOptions[1];
}

export async function downloadShareQrPdf(url: string, size: ShareQrPdfSize) {
  const selectedSize = getPdfSizeOption(size);

  const [{ PDFDocument }, qrDataUrl] = await Promise.all([
    import("pdf-lib"),
    generateQRDataURL(url, { width: selectedSize.pixelWidth }),
  ]);

  const pdf = await PDFDocument.create();
  const padding = mmToPoints(12);
  const qrSize = mmToPoints(selectedSize.qrSizeMm);
  const pageSize = qrSize + padding * 2;
  const page = pdf.addPage([pageSize, pageSize]);
  const qrImage = await pdf.embedPng(qrDataUrl);

  page.drawImage(qrImage, {
    x: padding,
    y: padding,
    width: qrSize,
    height: qrSize,
  });

  const pdfBytes = await pdf.save();
  const pdfBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `benefitqr-${selectedSize.value}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
