"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ FIX: Rutas corregidas para ocultar layout
  const ocultarLayout =
    pathname.startsWith("/panel/admin") || pathname.startsWith("/panel/cuenta");

  return (
    <>
      {!ocultarLayout && <Navbar />}
      {children}
      {!ocultarLayout && <Footer />}
    </>
  );
}