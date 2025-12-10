import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import LayoutContent from "@/components/layout/LayoutContent";
import { AuthProvider } from "@/context/AuthContext";
import { CarritoProvider } from "@/context/CarritoContext";
import WhatsappFloating from "@/components/ui/WhatsappFloating";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://motef.com.ar"),
  title: "motef - Soportes para Celular, Tablet y Notebook",
  description:
    "Tecnología útil y funcional para tu día a día. Soportes de calidad para todos tus dispositivos. Envío gratis desde la segunda unidad.",
  keywords: [
    "soportes celular",
    "soportes tablet",
    "soportes notebook",
    "accesorios tecnología",
    "soporte magnético auto",
    "elevador notebook",
    "base refrigerante",
  ],
  authors: [{ name: "motef" }],
  creator: "motef",
  publisher: "motef",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://motef.com.ar",
    siteName: "motef",
    title: "motef - Soportes para Celular, Tablet y Notebook",
    description:
      "Tecnología útil y funcional. Soportes de calidad para todos tus dispositivos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "motef - Soportes para dispositivos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "motef - Soportes para Celular, Tablet y Notebook",
    description: "Tecnología útil y funcional para tu día a día",
    images: ["/og-image.jpg"],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="motef" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <WhatsappFloating />
        <AuthProvider>
          <CarritoProvider>
            <LayoutContent>{children}</LayoutContent>
            <Toaster
              position="top-right"
              richColors
              expand={false}
              closeButton
              duration={3000}
            />
          </CarritoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
