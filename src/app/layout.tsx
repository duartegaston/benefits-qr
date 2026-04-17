import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Qupón",
  description: "Creá cupones de descuento, compartí el link y canjeá al instante con QR desde el celular.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${sora.className} bg-linear-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to bg-fixed min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
