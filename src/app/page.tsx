import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Package, Star } from "lucide-react";
import type { Metadata } from "next";

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  imagen_url?: string;
  productos_count?: number;
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "MOTEF - Tienda Online de Accesorios y Repuestos",
  description:
    "Tu tienda online de confianza para motocicletas, bicicletas, aire acondicionado, piletas, artículos de auto y electrodomésticos.",
};

async function getProductosDestacados(): Promise<Producto[]> {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/productos?destacado=true&limite=8`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    return [];
  }
}

async function getCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/categorias`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
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
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={producto.imagen_url || "/img/placeholder-product.png"}
          alt={producto.nombre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {tieneDescuento && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{porcentajeDescuento}%
          </div>
        )}
        {producto.destacado && (
          <div className="absolute top-3 left-3 bg-motef-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Star size={12} className="fill-current" />
            Destacado
          </div>
        )}
      </div>

      <div className="p-5">
        {producto.categoria && (
          <p className="text-xs font-semibold text-motef-primary uppercase tracking-wide mb-2">
            {producto.categoria.nombre}
          </p>
        )}

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-motef-primary transition-colors">
          {producto.nombre}
        </h3>

        {producto.descripcion_corta && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {producto.descripcion_corta}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          {tieneDescuento && (
            <span className="text-sm text-gray-500 line-through">
              ${producto.precio_anterior?.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-extrabold text-gray-900">
            ${producto.precio.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
          </span>
          <span className="text-motef-primary text-sm font-semibold group-hover:gap-2 inline-flex items-center gap-1 transition-all">
            Ver detalles
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

function CategoriaCard({ categoria }: { categoria: Categoria }) {
  return (
    <Link
      href={`/productos?categoria=${categoria.slug}`}
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-video bg-gradient-to-br from-motef-primary to-orange-600 relative overflow-hidden">
        {categoria.imagen_url ? (
          <Image
            src={categoria.imagen_url}
            alt={categoria.nombre}
            fill
            className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white mb-1">
            {categoria.nombre}
          </h3>
          {categoria.productos_count !== undefined && (
            <p className="text-white/90 text-sm">
              {categoria.productos_count} productos
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Ahora HomePage es un Server Component
export default async function HomePage() {
  const productosDestacados = await getProductosDestacados();
  const categorias = await getCategorias();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-motef-primary via-orange-600 to-orange-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              Bienvenido a MOTEF
            </h1>
            <p className="text-lg sm:text-xl text-orange-100 mb-8">
              Tu tienda online de confianza para motocicletas, bicicletas, aire
              acondicionado, piletas, artículos de auto y electrodomésticos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 bg-white text-motef-primary px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Ver Todos los Productos
                <ArrowRight size={20} />
              </Link>
              <Link
                href="#categorias"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all duration-300"
              >
                Explorar Categorías
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categorias.length > 0 && (
        <section id="categorias" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Explorá por Categoría
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encontrá exactamente lo que necesitás navegando por nuestras
                categorías especializadas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categorias.map((categoria: Categoria) => (
                <CategoriaCard key={categoria.id} categoria={categoria} />
              ))}
            </div>
          </div>
        </section>
      )}

      {productosDestacados.length > 0 && (
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6 text-motef-primary" />
                  <span className="text-sm font-bold text-motef-primary uppercase tracking-wide">
                    Destacados
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Productos Destacados
                </h2>
              </div>
              <Link
                href="/productos"
                className="hidden sm:inline-flex items-center gap-2 text-motef-primary font-semibold hover:gap-3 transition-all"
              >
                Ver todos
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosDestacados.map((producto: Producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-motef-primary text-white px-8 py-3 rounded-full font-bold hover:bg-motef-primary-dark transition-all"
              >
                Ver todos los productos
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-motef-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Envíos a Todo el País
              </h3>
              <p className="text-gray-600">
                Recibí tus productos en la comodidad de tu hogar con envíos
                seguros y rápidos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-motef-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Productos de Calidad
              </h3>
              <p className="text-gray-600">
                Seleccionamos cuidadosamente cada producto para garantizar tu
                satisfacción
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-motef-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Mejores Precios
              </h3>
              <p className="text-gray-600">
                Encontrá los mejores productos al mejor precio del mercado
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
