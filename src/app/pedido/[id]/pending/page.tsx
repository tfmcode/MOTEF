"use client";

import Link from "next/link";
import { Clock, Package, ArrowRight, Home, RefreshCw } from "lucide-react";

export default function PedidoPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de pendiente */}
        <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock size={48} className="text-white" />
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago Pendiente
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Estamos esperando la confirmación de tu pago
        </p>

        {/* Información */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center justify-center gap-2">
            <RefreshCw size={20} />
            ¿Qué significa esto?
          </h3>
          <ul className="text-sm text-amber-800 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Tu pago está siendo procesado por Mercado Pago</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>
                Esto puede demorar algunos minutos u horas según el método de
                pago
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Te enviaremos un email cuando se confirme el pago</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
          
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cuenta/pedidos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            <Package size={20} />
            Ver mis pedidos
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
      </div>
    </div>
  );
}
