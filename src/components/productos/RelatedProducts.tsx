"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/productos/ProductsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Producto } from "@/types";

interface Props {
  categoriaId: number;
  productoActualId: number;
}

const RelatedProducts = ({ categoriaId, productoActualId }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/productos?categoria_id=${categoriaId}&limit=8`
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          // Filtrar el producto actual y tomar máximo 6
          const relacionados = data.data
            .filter((p: Producto) => p.id !== productoActualId)
            .slice(0, 6);
          setProductos(relacionados);
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedProducts();
  }, [categoriaId, productoActualId]);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("related-products-container");
    if (!container) return;

    const scrollAmount = 300;
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Productos Relacionados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Productos Relacionados
        </h2>

        {/* Controles de scroll - desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid responsivo */}
      <div
        id="related-products-container"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:overflow-x-auto md:grid-flow-col md:auto-cols-[minmax(300px,1fr)] scrollbar-hide"
      >
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} viewMode="grid" />
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RelatedProducts;
