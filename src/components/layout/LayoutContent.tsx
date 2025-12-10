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

  const ocultarLayout =
    pathname.startsWith("/admin") || pathname.startsWith("/cuenta");

  return (
    <>
      {!ocultarLayout && <Navbar />}
      {children}
      {!ocultarLayout && <Footer />}
    </>
  );
}
