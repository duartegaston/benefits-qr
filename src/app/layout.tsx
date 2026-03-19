import type { Metadata, Viewport } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "BenefitQR",
  description: "Plataforma de beneficios y descuentos con QR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${geist.variable} ${jakarta.variable} ${geist.className} bg-[#f5f4f1] min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
