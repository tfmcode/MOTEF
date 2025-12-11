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
  title: "MOTEF - Tienda Online de Accesorios y Repuestos",
  description:
    "Tu tienda online de confianza para motocicletas, bicicletas, aire acondicionado, piletas, artículos de auto y electrodomésticos. Los mejores productos al mejor precio.",
  keywords: [
    "motef",
    "accesorios moto",
    "repuestos auto",
    "bicicletas",
    "aire acondicionado",
    "piletas",
    "electrodomésticos",
    "tienda online argentina",
    "accesorios motocicleta",
    "repuestos bicicleta",
  ],
  authors: [{ name: "MOTEF" }],
  creator: "MOTEF",
  publisher: "MOTEF",
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
    siteName: "MOTEF",
    title: "MOTEF - Tienda Online de Accesorios y Repuestos",
    description:
      "Tu tienda online de confianza para motocicletas, bicicletas, aire acondicionado, piletas, artículos de auto y electrodomésticos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MOTEF - Tienda Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOTEF - Tienda Online de Accesorios y Repuestos",
    description: "Los mejores productos al mejor precio",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f48634" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MOTEF" />
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
