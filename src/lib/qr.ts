import QRCode from "qrcode";

type QRDataURLOptions = NonNullable<Parameters<typeof QRCode.toDataURL>[1]>;

const defaultQrOptions: QRDataURLOptions = {
  errorCorrectionLevel: "M",
  margin: 2,
  width: 300,
  color: { dark: "#1f2937", light: "#ffffff" },
};

export async function generateQRDataURL(
  data: string,
  options: Partial<QRDataURLOptions> = {}
): Promise<string> {
  return QRCode.toDataURL(data, {
    ...defaultQrOptions,
    ...options,
    color: {
      ...defaultQrOptions.color,
      ...options.color,
    },
  });
}

export function buildQRPayload(reclamoId: string, qrToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return JSON.stringify({ reclamoId, qrToken, baseUrl });
}
