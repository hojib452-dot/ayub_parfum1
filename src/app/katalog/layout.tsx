import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VisitTracker } from "@/components/visit-tracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ayub Parfum — Premium atirlar butigi",
  description:
    "Ayub Parfum — Dior, Chanel, Creed, Tom Ford va boshqa dunyo brendlarining original atirlari. Premium sifat, kafolat bilan. Yetkazib berish xizmati mavjud.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <CartProvider>
          <VisitTracker />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
