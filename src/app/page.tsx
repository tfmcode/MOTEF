import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  TrendingUp,
  Package,
  Star,
  Truck,
  Shield,
  DollarSign,
  Zap,
} from "lucide-react";
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
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl hover:border-motef-primary transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={producto.imagen_url || "/img/placeholder-product.png"}
          alt={producto.nombre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {tieneDescuento && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-105 transition-transform">
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
          <span className="text-3xl font-extrabold text-gray-900 group-hover:text-motef-primary transition-colors">
            ${producto.precio.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
          </span>
          <span className="text-motef-primary text-sm font-semibold inline-flex items-center gap-1 transition-all group-hover:gap-2">
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
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
    >
      <div className="aspect-video relative overflow-hidden">
        {categoria.imagen_url ? (
          <Image
            src={categoria.imagen_url}
            alt={categoria.nombre}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Package size={48} className="text-motef-primary opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-motef-primary-light transition-colors">
            {categoria.nombre}
          </h3>
          {categoria.productos_count !== undefined && (
            <p className="text-white/90 text-sm font-medium">
              {categoria.productos_count} productos
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center group bg-white p-6 rounded-xl shadow-lg border-2 border-transparent hover:border-motef-primary transition-all duration-300 hover:-translate-y-1">
      <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-motef-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-motef-primary">
        {title}
      </h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function HeroSection() {
  const HERO_IMAGE_URL = "/banner.png";
  const ALT_TEXT =
    "Variedad de productos, repuestos de motocicletas, bicicletas y aire acondicionado.";

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={HERO_IMAGE_URL}
          alt={ALT_TEXT}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 100vw"
        />
      </div>

      {/* Capa de contraste mínima solo en la parte inferior para el texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
        <div className="text-center max-w-4xl mx-auto py-16">
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-down text-white drop-shadow-lg"
            style={{ textShadow: "0 4px 6px rgba(0,0,0,0.5)" }}
          >
            ACCESORIOS Y REPUESTOS PARA TODO LO QUE TE MUEVE
          </h1>

          <p className="text-lg sm:text-2xl mb-10 font-medium animate-fade-in delay-200 text-gray-100 drop-shadow-md">
            Motocicletas, Climatización, Hogar y más.{" "}
            <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-motef-primary-light to-orange-400 drop-shadow-lg">
              ¡Encontrá todo en un solo lugar!
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-400">
            <Link
              href="/productos"
              className="group inline-flex items-center justify-center gap-2 bg-motef-primary text-white px-8 py-4 rounded-full font-extrabold transition-all duration-300 shadow-2xl 
                       hover:bg-orange-700 hover:shadow-[0_0_25px_rgba(244,134,52,0.9)] transform hover:scale-[1.05] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-motef-primary-light"
            >
              Comprar Ahora
              <Zap
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </Link>

            <Link
              href="#categorias"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-bold transition-all duration-300 
                       hover:bg-white/10 hover:border-motef-primary-light hover:shadow-xl transform hover:scale-[1.02]"
            >
              Explorar Categorías
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const productosDestacados = await getProductosDestacados();
  const categorias = await getCategorias();

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      {categorias.length > 0 && (
        <section id="categorias" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-motef-primary uppercase tracking-widest mb-2 inline-block animate-fade-in">
                Descubrí
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Explorá Nuestro Catálogo por Categoría
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Accesorios y repuestos especializados para vehículos y hogar.
                Todo lo que necesitás, organizado para vos.
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
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6 text-motef-primary" />
                  <span className="text-sm font-bold text-motef-primary uppercase tracking-wide">
                    Lo más caliente
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Productos Destacados
                </h2>
              </div>
              <Link
                href="/productos"
                className="hidden sm:inline-flex items-center gap-2 text-motef-primary font-semibold hover:gap-3 transition-all p-3 rounded-full hover:bg-orange-50"
              >
                Ver todos los productos
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {productosDestacados.map((producto: Producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>

            <div className="text-center mt-12 sm:hidden">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-motef-primary text-white px-8 py-4 rounded-full font-bold hover:bg-motef-primary-dark transition-all shadow-lg"
              >
                Ver todos los productos
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            ¿Por qué elegir MOTEF?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={Truck}
              title="Envíos Súper Rápidos"
              description="Despachamos tu pedido en 24hs. Recibí en la comodidad de tu hogar con seguimiento."
            />

            <FeatureCard
              icon={Shield}
              title="Compra 100% Segura"
              description="Pago protegido por Mercado Pago y tus datos resguardados con encriptación."
            />

            <FeatureCard
              icon={DollarSign}
              title="Precios de Fábrica"
              description="Sin intermediarios. Calidad premium al mejor precio garantizado del mercado."
            />
          </div>
        </div>
      </section>
    </main>
  );
}
