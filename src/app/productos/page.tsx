import { Suspense } from "react";
import ProductsContent from "@/components/productos/ProductsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos - MOTEF | Accesorios y Repuestos",
  description:
    "Explorá nuestro catálogo completo de productos para motocicletas, bicicletas, aire acondicionado, piletas, artículos de auto y electrodomésticos. Los mejores precios.",
  keywords: [
    "motef",
    "productos",
    "accesorios moto",
    "repuestos auto",
    "bicicletas",
    "aire acondicionado",
    "piletas",
    "electrodomésticos",
    "tienda online",
  ],
  openGraph: {
    title: "Catálogo de Productos - MOTEF",
    description: "Los mejores productos para tu vehículo, hogar y más",
    type: "website",
  },
};

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-motef-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando productos...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
