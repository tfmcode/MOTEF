"use client";

import { useCarrito } from "@/context/CarritoContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CarritoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, actualizarCantidad, quitarProducto, total, totalItems } =
    useCarrito();

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8">
              Agrega productos para comenzar tu compra
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-motef-primary text-white rounded-lg font-semibold hover:bg-motef-primary-dark transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ver Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carrito de Compras
          </h1>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu
            carrito
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.producto.id}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.producto.imagen_url ? (
                      <Image
                        src={item.producto.imagen_url}
                        alt={item.producto.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                          {item.producto.nombre}
                        </h3>
                        {item.producto.descripcion && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.producto.descripcion}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => quitarProducto(item.producto.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() =>
                            actualizarCantidad(
                              item.producto.id,
                              item.cantidad - 1
                            )
                          }
                          disabled={item.cantidad <= 1}
                          className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            actualizarCantidad(
                              item.producto.id,
                              item.cantidad + 1
                            )
                          }
                          disabled={item.cantidad >= item.producto.stock}
                          className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-motef-primary">
                          $
                          {(
                            item.producto.precio * item.cantidad
                          ).toLocaleString("es-AR")}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.producto.precio.toLocaleString("es-AR")} c/u
                        </p>
                      </div>
                    </div>

                    {item.cantidad >= item.producto.stock && (
                      <p className="text-xs text-amber-600 mt-2">
                        Stock máximo alcanzado
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({totalItems}{" "}
                    {totalItems === 1 ? "producto" : "productos"})
                  </span>
                  <span className="font-medium">
                    ${total.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-sm text-motef-primary font-medium">
                    A calcular en el checkout
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-motef-primary">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-motef-primary text-white hover:bg-motef-primary-dark rounded-lg font-semibold text-lg transition-colors mb-4"
              >
                <ShoppingBag className="w-5 h-5" />
                Continuar al Pago
              </button>

              <Link
                href="/productos"
                className="block text-center text-motef-primary hover:text-motef-primary-dark font-medium transition-colors"
              >
                ← Seguir Comprando
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Compra Segura</p>
                    <p>Pago protegido con Mercado Pago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
