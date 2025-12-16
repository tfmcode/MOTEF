import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import CategoriasSection from "@/components/home/CategoriasSection";
import ProductosDestacados from "@/components/home/ProductosDestacados";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ContactForm from "@/components/home/ContactForm";

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

export default async function HomePage() {
  const productosDestacados = await getProductosDestacados();
  const categorias = await getCategorias();

  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />

      <CategoriasSection categorias={categorias} />

      <ProductosDestacados productos={productosDestacados} />

      <WhyChooseUs />

      <ContactForm />
    </main>
  );
}
