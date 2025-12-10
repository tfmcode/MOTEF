"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Star,
  Tag,
  TrendingUp,
  Package,
  Check,
  Loader2,
} from "lucide-react";
import { useCarrito } from "@/context/CarritoContext";
import type { Producto } from "@/types";

interface Props {
  producto: Producto;
  viewMode?: "grid" | "list";
}

const ProductCard = ({ producto, viewMode = "grid" }: Props) => {
  const { agregarProducto } = useCarrito();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const imagenPrincipal = producto.imagen_url || "/img/placeholder-product.png";
  const tieneDescuento = !!producto.precio_anterior;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(
        ((producto.precio_anterior! - producto.precio) /
          producto.precio_anterior!) *
          100
      )
    : 0;

  const stockBadge = () => {
    if (producto.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
          Sin stock
        </span>
      );
    }
    if (producto.stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
          <Package size={12} />
          ¡Últimas {producto.stock} unidades!
        </span>
      );
    }
    return null;
  };

  // ✅ Función para agregar al carrito
  const handleAgregarAlCarrito = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (producto.stock === 0 || loading || added) return;

    setLoading(true);

    try {
      await agregarProducto(producto, 1);
      setAdded(true);

      // Resetear después de 2 segundos
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error al agregar al carrito. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Componente de botón reutilizable
  const AgregarButton = ({
    className,
    showText = true,
  }: {
    className?: string;
    showText?: boolean;
  }) => {
    if (loading) {
      return (
        <button
          disabled
          className={`inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold transition ${className}`}
        >
          <Loader2 size={16} className="animate-spin" />
          {showText && <span className="hidden sm:inline">Agregando...</span>}
        </button>
      );
    }

    if (added) {
      return (
        <button
          disabled
          className={`inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold transition ${className}`}
        >
          <Check size={16} />
          {showText && <span className="hidden sm:inline">¡Agregado!</span>}
        </button>
      );
    }

    return (
      <button
        onClick={handleAgregarAlCarrito}
        disabled={producto.stock === 0}
        className={`inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition ${className}`}
      >
        <ShoppingCart size={16} />
        {showText && (
          <span className="hidden sm:inline">
            {producto.stock === 0 ? "Sin stock" : "Agregar"}
          </span>
        )}
      </button>
    );
  };

  // ========================================
  // VISTA DE LISTA
  // ========================================
  if (viewMode === "list") {
    return (
      <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex">
        {/* Imagen */}
        <Link
          href={`/productos/${producto.slug}`}
          className="relative w-48 flex-shrink-0"
        >
          <div className="relative w-full h-full">
            <Image
              src={imagenPrincipal}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="192px"
            />
            {tieneDescuento && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{porcentajeDescuento}%
              </div>
            )}
            {producto.destacado && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full">
                <Star size={14} className="fill-current" />
              </div>
            )}
          </div>
        </Link>

        {/* Contenido */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <Link href={`/productos/${producto.slug}`}>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {producto.nombre}
              </h3>
            </Link>

            {producto.descripcion_corta && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {producto.descripcion_corta}
              </p>
            )}

            {stockBadge()}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              {tieneDescuento && (
                <p className="text-sm text-gray-500 line-through">
                  ${producto.precio_anterior?.toLocaleString()}
                </p>
              )}
              <p className="text-2xl font-bold text-gray-900">
                ${producto.precio.toLocaleString()}
              </p>
            </div>

            <AgregarButton className="px-6 py-3 rounded-lg" showText />
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // VISTA DE GRID (DEFAULT)
  // ========================================
  return (
    <Link
      href={`/productos/${producto.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Imagen y Badges */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imagenPrincipal}
          alt={producto.nombre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {tieneDescuento && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Tag size={12} />-{porcentajeDescuento}%
            </span>
          )}

          <div className="flex flex-col gap-2">
            {producto.destacado && (
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full shadow-lg">
                <Star size={14} className="fill-current" />
              </span>
            )}
            {producto.ventas && producto.ventas > 10 && (
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full shadow-lg">
                <TrendingUp size={14} />
              </span>
            )}
          </div>
        </div>

        {/* Badge de stock inferior */}
        {stockBadge() && (
          <div className="absolute bottom-3 left-3">{stockBadge()}</div>
        )}

        {/* Quick add button (desktop) */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <AgregarButton className="px-4 py-2 rounded-lg shadow-lg" />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Categoría */}
        {producto.categoria && (
          <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">
            {producto.categoria.nombre}
          </p>
        )}

        {/* Título */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-3 min-h-[2.5rem]">
          {producto.nombre}
        </h3>

        {/* Descripción corta (solo en grid grande) */}
        {producto.descripcion_corta && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 hidden xl:block">
            {producto.descripcion_corta}
          </p>
        )}

        {/* Precio */}
        <div className="mb-3">
          {tieneDescuento && (
            <p className="text-sm text-gray-500 line-through">
              ${producto.precio_anterior?.toLocaleString()}
            </p>
          )}
          <p className="text-2xl font-bold text-gray-900">
            ${producto.precio.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            + Envío gratis desde 2da unidad
          </p>
        </div>

        {/* SKU y ventas */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>SKU: {producto.sku}</span>
          {producto.ventas !== undefined && producto.ventas > 0 && (
            <span className="font-medium text-green-600">
              {producto.ventas} vendido{producto.ventas !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Botón mobile */}
        <AgregarButton
          className="mt-4 w-full sm:hidden px-4 py-2.5 rounded-lg"
          showText
        />
      </div>
    </Link>
  );
};

export default ProductCard;
