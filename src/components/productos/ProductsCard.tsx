"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye, Heart, Star, Package } from "lucide-react";
import { useCarrito } from "@/context/CarritoContext";
import { Producto } from "@/types";

interface ProductsCardProps {
  producto: Producto;
  viewMode?: "grid" | "list";
}

export default function ProductsCard({
  producto,
  viewMode = "grid",
}: ProductsCardProps) {
  const { agregarProducto } = useCarrito();
  const [agregando, setAgregando] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  const handleAgregarAlCarrito = async () => {
    setAgregando(true);
    try {
      await agregarProducto(producto, cantidad);
    } finally {
      setAgregando(false);
    }
  };

  const enStock = producto.stock > 0;
  const stockBajo = producto.stock > 0 && producto.stock <= 5;
  const tieneDescuento =
    producto.precio_anterior && producto.precio_anterior > producto.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(
        ((producto.precio_anterior! - producto.precio) /
          producto.precio_anterior!) *
          100
      )
    : 0;

  // Vista de lista
  if (viewMode === "list") {
    return (
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
        {/* Imagen */}
        <div className="relative w-full sm:w-48 md:w-64 aspect-square sm:aspect-auto sm:h-48 bg-gray-100 overflow-hidden flex-shrink-0">
          {producto.imagen_url ? (
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {!enStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-sm">
                Sin Stock
              </span>
            </div>
          )}

          {tieneDescuento && enStock && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{porcentajeDescuento}%
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <Link
              href={`/productos/${producto.slug}`}
              className="block mb-2 hover:text-motef-primary transition-colors"
            >
              <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                {producto.nombre}
              </h3>
            </Link>

            {producto.descripcion_corta && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {producto.descripcion_corta}
              </p>
            )}

            <div className="flex items-center gap-3 mb-3">
              {tieneDescuento && (
                <span className="text-sm text-gray-500 line-through">
                  ${producto.precio_anterior?.toLocaleString("es-AR")}
                </span>
              )}
              <span className="text-2xl font-bold text-motef-primary">
                ${producto.precio.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {enStock ? (
              <button
                onClick={handleAgregarAlCarrito}
                disabled={agregando}
                className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-motef-primary text-white hover:bg-motef-primary-dark"
              >
                <ShoppingCart className="w-4 h-4" />
                {agregando ? "Agregando..." : "Agregar"}
              </button>
            ) : (
              <span className="text-sm text-red-600 font-medium">
                Sin stock
              </span>
            )}
            <Link
              href={`/productos/${producto.slug}`}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:border-motef-primary hover:text-motef-primary transition-colors"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vista de grid (default)
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-gray-300" />
          </div>
        )}

        {!enStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
              Sin Stock
            </span>
          </div>
        )}

        {stockBajo && enStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full font-semibold text-xs">
              ¡Últimas unidades!
            </span>
          </div>
        )}

        {tieneDescuento && enStock && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            -{porcentajeDescuento}%
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            href={`/productos/${producto.slug}`}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-motef-primary hover:text-white transition-colors"
            aria-label="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Agregar a favoritos"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <Link
          href={`/productos/${producto.slug}`}
          className="block mb-2 hover:text-motef-primary transition-colors"
        >
          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 min-h-[3.5rem]">
            {producto.nombre}
          </h3>
        </Link>

        {producto.descripcion_corta && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
            {producto.descripcion_corta}
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">(23 reviews)</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            {tieneDescuento && (
              <p className="text-sm text-gray-500 line-through">
                ${producto.precio_anterior?.toLocaleString("es-AR")}
              </p>
            )}
            <p className="text-3xl font-bold text-motef-primary">
              ${producto.precio.toLocaleString("es-AR")}
            </p>
            <p className="text-xs text-gray-500">
              {enStock ? `Stock: ${producto.stock} unidades` : "Sin stock"}
            </p>
          </div>
        </div>

        {enStock ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-motef-primary hover:text-motef-primary transition-colors font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={producto.stock}
                value={cantidad}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= producto.stock) setCantidad(val);
                }}
                className="flex-1 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-motef-primary focus:outline-none font-semibold"
              />
              <button
                onClick={() =>
                  setCantidad(Math.min(producto.stock, cantidad + 1))
                }
                className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-motef-primary hover:text-motef-primary transition-colors font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAgregarAlCarrito}
              disabled={agregando}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                agregando
                  ? "bg-gray-400 text-white cursor-wait"
                  : "bg-motef-primary text-white hover:bg-motef-primary-dark hover:shadow-lg"
              }`}
            >
              {agregando ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Agregando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al Carrito
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-3 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              Sin Stock
            </button>
            <button className="w-full py-2 rounded-lg font-medium border-2 border-motef-primary text-motef-primary hover:bg-orange-50 transition-colors text-sm">
              Avisarme cuando haya stock
            </button>
          </div>
        )}

        <Link
          href={`/productos/${producto.slug}`}
          className="block mt-3 text-center text-sm text-motef-primary hover:text-motef-primary-dark font-medium transition-colors"
        >
          Ver detalles completos →
        </Link>
      </div>
    </div>
  );
}
