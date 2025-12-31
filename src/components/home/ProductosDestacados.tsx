"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion_corta?: string;
  imagen_url?: string;
  precio: number;
  precio_anterior?: number;
  stock: number;
  destacado: boolean;
  categoria?: Categoria;
}

function ProductCard({ producto }: { producto: Producto }) {
  const tieneDescuento = !!producto.precio_anterior;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(
        ((producto.precio_anterior! - producto.precio) /
          producto.precio_anterior!) *
          100
      )
    : 0;

  return (
    <Link
      href={`/productos/${producto.slug}`}
      className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-md hover:shadow-2xl hover:border-motef-primary transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 h-full flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={producto.imagen_url || "/img/placeholder-product.png"}
          alt={producto.nombre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {tieneDescuento && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-105 transition-transform">
            -{porcentajeDescuento}%
          </div>
        )}
        {producto.destacado && (
          <div className="absolute top-3 left-3 bg-motef-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Star size={12} className="fill-current" />
            Destacado
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {producto.categoria && (
          <p className="text-xs font-bold text-motef-primary uppercase tracking-wide mb-2">
            {producto.categoria.nombre}
          </p>
        )}

        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-motef-primary transition-colors">
          {producto.nombre}
        </h3>

        {producto.descripcion_corta && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {producto.descripcion_corta}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          {tieneDescuento && (
            <span className="text-sm text-gray-500 line-through">
              ${producto.precio_anterior?.toLocaleString()}
            </span>
          )}
          <span className="text-3xl font-extrabold text-gray-900 group-hover:text-motef-primary transition-colors">
            ${producto.precio.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <span className="text-xs text-gray-500 font-medium">
            {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
          </span>
          <span className="text-motef-primary text-sm font-bold inline-flex items-center gap-1 transition-all group-hover:gap-2">
            Ver más
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductosDestacados({ productos }: { productos: Producto[] }) {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  if (productos.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-white" ref={elementRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-motef-primary" />
              <span className="text-sm font-bold text-motef-primary uppercase tracking-wide">
                Lo más elegido
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900">
              Productos Destacados
            </h2>
          </div>
          <Link
            href="/productos"
            className="hidden sm:inline-flex items-center gap-2 text-motef-primary font-bold hover:gap-3 transition-all px-6 py-3 rounded-xl hover:bg-orange-50"
          >
            Ver todos
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productos.map((producto: Producto, index: number) => (
            <div
              key={producto.id}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <ProductCard producto={producto} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:hidden">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-motef-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
          >
            Ver todos los productos
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
