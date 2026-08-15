import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AlmaLanka - Descubre el Alma de Ceilán",
  description: "Agencia premium de observación de aves y naturaleza en Sri Lanka.",
  openGraph: {
    title: "AlmaLanka - Descubre el Alma de Ceilán",
    description: "Agencia premium de observación de aves y naturaleza en Sri Lanka. Únete a nuestros tours exclusivos.",
    locale: "es_ES",
    type: "website",
  },
};

import FloatingActions from "@/components/FloatingActions";
import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-brand-dark overflow-x-hidden">
        <LanguageProvider>
          <AnalyticsTracker />
          <Header />
          {children}
          <FloatingActions />
        </LanguageProvider>
      </body>
    </html>
  );
}
