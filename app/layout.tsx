import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitchen Ops",
  description: "Sistema de ventas e inventario diario para negocio de fritos y pizzas.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
