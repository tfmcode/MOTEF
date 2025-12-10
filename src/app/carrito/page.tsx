"use client";

import { useCarrito } from "@/context/CarritoContext";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";

export default function CarritoPage() {
  const {
    items,
    quitarProducto,
    actualizarCantidad,
    totalItems,
    subtotal,
    costoEnvio,
    total,
  } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-6">
            Explorá nuestro catálogo y agregá productos para comenzar tu compra
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ver productos
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingCart size={24} className="text-white" />
            </div>
            Mi Carrito
          </h1>
          <p className="text-gray-600 mt-2">
            {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu
            carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.producto.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.producto.imagen_url ? (
                      <img
                        src={item.producto.imagen_url}
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.producto.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          SKU: {item.producto.sku}
                        </p>
                      </div>
                      <button
                        onClick={() => quitarProducto(item.producto.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Precio y cantidad */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-lg font-bold text-gray-900">
                        ${item.producto.precio.toLocaleString("es-AR")}
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                          <button
                            onClick={() =>
                              actualizarCantidad(
                                item.producto.id,
                                item.cantidad - 1
                              )
                            }
                            disabled={item.cantidad <= 1}
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">
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
                            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">
                          Stock: {item.producto.stock}
                        </div>
                      </div>

                      {/* Subtotal del item */}
                      <div className="text-lg font-bold text-blue-600">
                        $
                        {(item.producto.precio * item.cantidad).toLocaleString(
                          "es-AR"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${subtotal.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Truck size={16} />
                    Envío
                  </span>
                  <span className="font-medium text-gray-900">
                    {costoEnvio === 0 ? (
                      <span className="text-green-600 font-semibold">
                        ¡GRATIS!
                      </span>
                    ) : (
                      `$${costoEnvio.toLocaleString("es-AR")}`
                    )}
                  </span>
                </div>

                {/* Info envío gratis */}
                {costoEnvio === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-medium">
                      🎉 ¡Tenés envío gratis!
                    </p>
                  </div>
                ) : totalItems === 1 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium">
                      💡 Agregá un producto más y obtenés envío gratis
                    </p>
                  </div>
                ) : null}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${total.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ CAMBIO PRINCIPAL: Link ahora va a /iniciar-compra */}
              <Link
                href="/iniciar-compra"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Continuar al pago
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/productos"
                className="block w-full text-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mt-3"
              >
                Seguir comprando
              </Link>

              {/* Info adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-gray-400 mt-0.5" />
                    <p>
                      Los precios incluyen IVA. El envío se calcula según tu
                      ubicación.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck size={14} className="text-gray-400 mt-0.5" />
                    <p>
                      Envío gratis desde la segunda unidad. Entrega en 3-5 días
                      hábiles.
                    </p>
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
