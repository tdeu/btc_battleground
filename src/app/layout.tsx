import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Centralization Observatory | Bitcoin + Stablecoins",
  description: "Track the centralization of crypto. Explore the network of ETFs, custodians, stablecoins, and the institutions capturing Bitcoin and digital dollars.",
  keywords: ["bitcoin", "stablecoin", "centralization", "ETF", "custody", "USDT", "USDC", "BlackRock", "Coinbase"],
  openGraph: {
    title: "Centralization Observatory",
    description: "Track crypto centralization: Bitcoin ETFs, stablecoin custody, and institutional capture.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 ml-16 md:ml-64 flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
