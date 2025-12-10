"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCarrito } from "@/context/CarritoContext";
import Link from "next/link";
import {
  ShoppingCart,
  Lock,
  User,
  CheckCircle,
  ArrowRight,
  Package,
  Truck,
  Shield,
} from "lucide-react";

export default function IniciarCompraPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, costoEnvio, total } = useCarrito();

  // Si ya está autenticado, ir directo a checkout
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/checkout");
    }
  }, [user, authLoading, router]);

  // Si no hay items, redirigir al carrito
  useEffect(() => {
    if (items.length === 0 && !authLoading) {
      router.push("/carrito");
    }
  }, [items.length, authLoading, router]);

  if (authLoading || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Estás a un paso de completar tu compra
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Para finalizar tu pedido necesitamos que inicies sesión o crees una
            cuenta
          </p>
        </div>

        {/* Por qué necesitamos una cuenta */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lock size={24} className="text-blue-600" />
            ¿Por qué necesito una cuenta?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Seguimiento de pedidos
                </h3>
                <p className="text-sm text-gray-600">
                  Podés ver el estado de tu pedido en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Historial de compras
                </h3>
                <p className="text-sm text-gray-600">
                  Accedé a todas tus compras anteriores
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Envío más rápido
                </h3>
                <p className="text-sm text-gray-600">
                  Guardá direcciones para compras futuras
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Compra segura
                </h3>
                <p className="text-sm text-gray-600">
                  Tus datos están protegidos y encriptados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Resumen de tu pedido
          </h2>

          <div className="space-y-4 mb-6">
            {items.slice(0, 3).map((item) => (
              <div key={item.producto.id} className="flex items-center gap-4">
                {item.producto.imagen_url && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.producto.imagen_url}
                      alt={item.producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.producto.nombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    x{item.cantidad} - $
                    {(item.producto.precio * item.cantidad).toLocaleString(
                      "es-AR"
                    )}
                  </p>
                </div>
              </div>
            ))}

            {items.length > 3 && (
              <p className="text-sm text-gray-600 text-center">
                +{items.length - 3} producto
                {items.length - 3 !== 1 ? "s" : ""} más
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                ${subtotal.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span className="font-medium text-gray-900">
                {costoEnvio === 0 ? (
                  <span className="text-green-600 font-semibold">¡GRATIS!</span>
                ) : (
                  `$${costoEnvio.toLocaleString("es-AR")}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link
            href="/login?redirect=/checkout"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:shadow-lg"
          >
            <User size={20} />
            Ya tengo cuenta
            <ArrowRight size={20} />
          </Link>

          <Link
            href="/registro?redirect=/checkout"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all"
          >
            <User size={20} />
            Crear cuenta
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Link volver */}
        <div className="text-center">
          <Link
            href="/carrito"
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            ← Volver al carrito
          </Link>
        </div>

        {/* Garantías */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Lock size={24} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">
                Pago 100% seguro
              </p>
              <p className="text-xs text-gray-600">Mercado Pago</p>
            </div>
            <div>
              <Truck size={24} className="text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">
                Envío gratis desde 2da unidad
              </p>
              <p className="text-xs text-gray-600">Entrega en 3-5 días</p>
            </div>
            <div>
              <Shield size={24} className="text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">
                Garantía de calidad
              </p>
              <p className="text-xs text-gray-600">Productos verificados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
