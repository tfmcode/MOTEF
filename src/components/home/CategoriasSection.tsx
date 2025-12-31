"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bike,
  Wind,
  Home,
  Wrench,
  Car,
  Droplets,
  Package
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  imagen_url?: string;
  productos_count?: number;
}

// Mapeo de categorías a iconos y colores
const categoriaConfig: Record<string, { icon: any; bgColor: string; iconColor: string }> = {
  motocicletas: {
    icon: Bike,
    bgColor: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-600"
  },
  bicicletas: {
    icon: Bike,
    bgColor: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600"
  },
  "aire-acondicionado": {
    icon: Wind,
    bgColor: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600"
  },
  climatizacion: {
    icon: Wind,
    bgColor: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600"
  },
  hogar: {
    icon: Home,
    bgColor: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-600"
  },
  repuestos: {
    icon: Wrench,
    bgColor: "from-gray-500/20 to-slate-500/20",
    iconColor: "text-gray-700"
  },
  auto: {
    icon: Car,
    bgColor: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-700"
  },
  piletas: {
    icon: Droplets,
    bgColor: "from-teal-500/20 to-blue-400/20",
    iconColor: "text-teal-600"
  },
};

function CategoriaCard({ categoria }: { categoria: Categoria }) {
  const slugKey = categoria.slug.toLowerCase();
  const config = categoriaConfig[slugKey] || {
    icon: Package,
    bgColor: "from-orange-500/20 to-motef-primary/20",
    iconColor: "text-motef-primary"
  };

  const Icon = config.icon;

  return (
    <Link
      href={`/productos?categoria=${categoria.slug}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl border border-gray-200 hover:border-motef-primary hover:-translate-y-2 h-full"
    >
      {/* Fondo con gradiente según categoría */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} opacity-50`}></div>

      {/* Icono decorativo grande en el fondo con animación */}
      <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:rotate-12 transform">
        <Icon size={120} className={config.iconColor} />
      </div>

      <div className="relative p-8 min-h-[180px] flex flex-col justify-between">
        <div>
          {/* Icono principal */}
          <div className={`w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${config.iconColor}`}>
            <Icon size={28} strokeWidth={2.5} />
          </div>

          {/* Nombre de la categoría */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-motef-primary transition-colors">
            {categoria.nombre}
          </h3>

          {/* Cantidad de productos */}
          {categoria.productos_count !== undefined && (
            <p className="text-gray-600 text-sm font-medium">
              {categoria.productos_count} {categoria.productos_count === 1 ? 'producto' : 'productos'}
            </p>
          )}
        </div>

        {/* Flecha decorativa */}
        <div className="flex items-center gap-2 text-motef-primary font-semibold text-sm mt-4 group-hover:gap-3 transition-all">
          <span>Ver productos</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function CategoriasSection({ categorias }: { categorias: Categoria[] }) {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  if (categorias.length === 0) return null;

  return (
    <section id="categorias" className="relative py-16 sm:py-24" ref={elementRef}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.png"
          alt="MOTEF - Catálogo de Productos"
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <span className="text-sm font-bold text-motef-primary uppercase tracking-widest mb-2 inline-block">
            Descubrí
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Explorá Nuestro Catálogo
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Accesorios y repuestos especializados para vehículos y hogar.
            Todo lo que necesitás, organizado para vos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categorias.map((categoria: Categoria, index: number) => (
            <div
              key={categoria.id}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CategoriaCard categoria={categoria} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
