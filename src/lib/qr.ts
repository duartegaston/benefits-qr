import QRCode from "qrcode";

export async function generateQRDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
    color: { dark: "#1f2937", light: "#ffffff" },
  });
}

export function buildQRPayload(reclamoId: string, qrToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return JSON.stringify({ reclamoId, qrToken, baseUrl });
}
