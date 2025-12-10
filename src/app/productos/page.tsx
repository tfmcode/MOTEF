import { Suspense } from "react";
import ProductsContent from "@/components/productos/ProductsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos - motef | Soportes para Celular, Tablet y Notebook",
  description:
    "Explorá nuestro catálogo completo de soportes de calidad para todos tus dispositivos. Envío gratis desde la segunda unidad.",
  keywords: [
    "soportes celular",
    "soportes tablet",
    "soportes notebook",
    "accesorios tecnología",
    "tienda online",
  ],
  openGraph: {
    title: "Catálogo de Productos - motef",
    description: "Soportes de calidad para todos tus dispositivos",
    type: "website",
  },
};

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando productos...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
