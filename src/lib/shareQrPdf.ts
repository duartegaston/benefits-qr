import { PDFDocument } from "pdf-lib";
import { generateQRDataURL } from "@/lib/qr";

const MM_TO_POINTS = 72 / 25.4;
const BRAND_LOGO_PATH = "/logo-min.png";
const BRAND_URL = "www.qupon.com.ar";

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

async function loadBrandLogoBytes() {
  try {
    const response = await fetch(BRAND_LOGO_PATH, { cache: "force-cache" });

    if (!response.ok) {
      return null;
    }

    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function getPdfSizeOption(size: ShareQrPdfSize) {
  return shareQrPdfSizeOptions.find((option) => option.value === size) ?? shareQrPdfSizeOptions[1];
}

export async function downloadShareQrPdf(url: string, size: ShareQrPdfSize) {
  const selectedSize = getPdfSizeOption(size);

  const [qrDataUrl, brandLogoBytes] = await Promise.all([
    generateQRDataURL(url, { width: selectedSize.pixelWidth }),
    loadBrandLogoBytes(),
  ]);

  const pdf = await PDFDocument.create();
  const padding = mmToPoints(12);
  const footerHeight = mmToPoints(14);
  const qrSize = mmToPoints(selectedSize.qrSizeMm);
  const pageWidth = qrSize + padding * 2;
  const pageHeight = qrSize + padding * 2 + footerHeight;
  const page = pdf.addPage([pageWidth, pageHeight]);
  const qrImage = await pdf.embedPng(qrDataUrl);

  page.drawImage(qrImage, {
    x: padding,
    y: padding + footerHeight,
    width: qrSize,
    height: qrSize,
  });

  const footerCenterY = padding + footerHeight / 2;
  const textSize = 9;
  const textWidth = BRAND_URL.length * 4.8;

  if (brandLogoBytes) {
    const brandLogo = await pdf.embedPng(brandLogoBytes);
    const logoWidth = mmToPoints(12);
    const logoHeight = (brandLogo.height / brandLogo.width) * logoWidth;
    const gap = mmToPoints(2.5);
    const totalBrandWidth = logoWidth + gap + textWidth;
    const startX = (pageWidth - totalBrandWidth) / 2;

    page.drawImage(brandLogo, {
      x: startX,
      y: footerCenterY - logoHeight / 2,
      width: logoWidth,
      height: logoHeight,
      opacity: 0.18,
    });

    page.drawText(BRAND_URL, {
      x: startX + logoWidth + gap,
      y: footerCenterY - textSize / 2 + 1,
      size: textSize,
      opacity: 0.45,
    });
  } else {
    page.drawText(BRAND_URL, {
      x: (pageWidth - textWidth) / 2,
      y: footerCenterY - textSize / 2 + 1,
      size: textSize,
      opacity: 0.45,
    });
  }

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
