import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SparFuchs.de - AI-gestützte Supermarkt Angebote",
  description: "Finde die besten Angebote in deutschen Supermärkten mit KI-Power. Aldi, Lidl, Rewe, Edeka & Penny - alle Preise im Vergleich.",
  keywords: "Supermarkt, Angebote, Preisvergleich, KI, Aldi, Lidl, Rewe, Edeka, Penny",
  authors: [{ name: "SparFuchs Team" }],
  creator: "SparFuchs",
  openGraph: {
    title: "SparFuchs.de - AI-gestützte Supermarkt Angebote",
    description: "Intelligente Suche nach Supermarkt-Angeboten in Deutschland",
    type: "website",
    locale: "de_DE",
    siteName: "SparFuchs.de",
  },
  twitter: {
    card: "summary_large_image",
    title: "SparFuchs.de - AI-gestützte Supermarkt Angebote",
    description: "Intelligente Suche nach Supermarkt-Angeboten in Deutschland",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || "https://sparfuchs.vercel.app"} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
