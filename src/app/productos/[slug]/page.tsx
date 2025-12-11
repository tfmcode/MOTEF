import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck, Shield, Star } from "lucide-react";
import ProductGallery from "@/components/productos/ProductGallery";
import AddToCartButton from "@/components/productos/AddToCartButton";
import RelatedProducts from "@/components/productos/RelatedProducts";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

interface ProductDetailProps {
  params: Promise<{ slug: string }>;
}

function parsePgTextArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    const trimmed = s.replace(/^[{\[]|[}\]]$/g, "");
    if (!trimmed) return [];
    return trimmed
      .split(",")
      .map((x) => x.replace(/^"+|"+$/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

function buildFallbackFromSlug(slug: string, count = 6): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/img/productos/${slug}-${i + 1}.jpg`
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

async function getProductoBySlug(slug: string) {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/productos/${slug}`,
      { cache: "no-store", headers: { "Cache-Control": "no-cache" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) {
    return { title: "Producto no encontrado - MOTEF" };
  }

  return {
    title: `${producto.nombre} - MOTEF`,
    description:
      producto.descripcion_corta || producto.descripcion || producto.nombre,
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion_corta || producto.descripcion,
      images: producto.imagen_url ? [producto.imagen_url] : [],
    },
  };
}

export default async function ProductoDetail({ params }: ProductDetailProps) {
  const { slug } = await params;

  const producto = await getProductoBySlug(slug);

  if (!producto || !producto.activo) {
    return notFound();
  }

  const adicionales = parsePgTextArray(producto.imagenes_adicionales);
  const fallback = buildFallbackFromSlug(producto.slug, 6);

  const imagenes = unique([
    producto.imagen_url || "/img/placeholder-product.png",
    ...(adicionales.length ? adicionales : fallback),
  ]).filter(Boolean);

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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
          <Package size={18} />
          <span>Sin stock</span>
        </div>
      );
    }
    if (producto.stock <= 5) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold">
          <Package size={18} />
          <span>¡Solo quedan {producto.stock} unidades!</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
        <Package size={18} />
        <span>En stock - Disponible</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Volver al catálogo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/productos" className="hover:text-gray-900">
                Productos
              </Link>
              {producto.categoria && (
                <>
                  <span>/</span>
                  <Link
                    href={`/productos?categoria=${producto.categoria.slug}`}
                    className="hover:text-gray-900"
                  >
                    {producto.categoria.nombre}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-gray-900 font-medium">
                {producto.nombre}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <ProductGallery imagenes={imagenes} nombre={producto.nombre} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoria.slug}`}
                  className="text-sm font-semibold text-motef-primary hover:text-motef-primary-dark uppercase tracking-wide"
                >
                  {producto.categoria.nombre}
                </Link>
              )}
              <span className="text-sm text-gray-500">SKU: {producto.sku}</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                {producto.nombre}
              </h1>

              <div className="flex items-center gap-4 text-sm">
                {producto.destacado && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} className="fill-current" />
                    <span className="font-semibold">Producto destacado</span>
                  </div>
                )}
                {producto.ventas !== undefined && producto.ventas > 0 && (
                  <span className="text-gray-600">
                    {producto.ventas} vendido{producto.ventas !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              {tieneDescuento && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl text-gray-500 line-through">
                    ${producto.precio_anterior?.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    -{porcentajeDescuento}% OFF
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-gray-900">
                  ${producto.precio.toLocaleString()}
                </span>
                <span className="text-gray-600">ARS</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ✓ Pago seguro con Mercado Pago
              </p>
            </div>

            {stockBadge()}

            {producto.descripcion_corta && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {producto.descripcion_corta}
              </p>
            )}

            <AddToCartButton producto={producto} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck size={20} className="text-motef-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Envíos</p>
                  <p className="text-xs text-gray-600">A todo el país</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Compra segura
                  </p>
                  <p className="text-xs text-gray-600">Mercado Pago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Garantía
                  </p>
                  <p className="text-xs text-gray-600">Calidad asegurada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {producto.descripcion && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Descripción del Producto
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-wrap">{producto.descripcion}</p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Especificaciones
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">SKU</span>
              <span className="text-gray-900 font-semibold">
                {producto.sku}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">
                Stock disponible
              </span>
              <span className="text-gray-900 font-semibold">
                {producto.stock} unidades
              </span>
            </div>
            {producto.peso_gramos && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Peso</span>
                <span className="text-gray-900 font-semibold">
                  {producto.peso_gramos}g
                </span>
              </div>
            )}
            {producto.categoria && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Categoría</span>
                <span className="text-gray-900 font-semibold">
                  {producto.categoria.nombre}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <RelatedProducts
            categoriaId={producto.categoria_id}
            productoActualId={producto.id}
          />
        </div>
      </div>
    </div>
  );
}
