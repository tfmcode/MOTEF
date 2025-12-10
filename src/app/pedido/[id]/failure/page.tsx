"use client";

import Link from "next/link";
import { XCircle, RefreshCw, Home, HelpCircle, ArrowRight } from "lucide-react";

export default function PedidoFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-white" />
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          No se pudo procesar el pago
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Hubo un problema al procesar tu pago. No te preocupes, no se realizó
          ningún cargo.
        </p>

        {/* Razones posibles */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center justify-center gap-2">
            <HelpCircle size={20} />
            Posibles causas
          </h3>
          <ul className="text-sm text-red-800 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Fondos insuficientes en tu tarjeta o cuenta</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Datos de la tarjeta incorrectos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>El banco rechazó la transacción por seguridad</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Límite de compra excedido</span>
            </li>
          </ul>
        </div>

        {/* Recomendaciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            ¿Qué podés hacer?
          </h3>
          <ul className="text-sm text-blue-800 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Verificá que los datos de tu tarjeta sean correctos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Intentá con otro método de pago</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Contactá a tu banco para autorizar la compra</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/carrito"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw size={20} />
            Reintentar compra
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home size={20} />
            Volver al inicio
          </Link>
        </div>

        {/* Ayuda adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            ¿Necesitás ayuda?{" "}
            <Link
              href="/contacto"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contactanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
