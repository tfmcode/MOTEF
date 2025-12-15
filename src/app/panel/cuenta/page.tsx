"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  Edit,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function CuentaPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      title: "Mis Pedidos",
      description: "Ver el historial de compras",
      icon: ShoppingBag,
      href: "/cuenta/pedidos",
      color: "blue",
    },
    {
      title: "Direcciones",
      description: "Gestionar direcciones de envío",
      icon: MapPin,
      href: "/cuenta/direcciones",
      color: "green",
      disabled: false,
    },
    {
      title: "Seguir Comprando",
      description: "Explorar productos",
      icon: ShoppingBag,
      href: "/productos",
      color: "purple",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user.nombre}!
          </h1>
          <p className="text-gray-600 mt-2">Bienvenido a tu panel de cliente</p>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User size={20} className="text-blue-500" />
            Mi Información
          </h2>
          <Link
            href="/cuenta/editar"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit size={16} />
            Editar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Nombre completo
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.nombre} {user.apellido}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.email}
                </p>
                {user.email_verificado ? (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-xs text-green-600 font-medium">
                      Verificado
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle size={14} className="text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">
                      Sin verificar
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {user.telefono && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                    Teléfono
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.telefono}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  Miembro desde
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(user.fecha_registro).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.disabled ? "#" : action.href}
              className={`group flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 ${
                action.disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
              }`}
            >
              <div
                className={`w-14 h-14 bg-${action.color}-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <action.icon size={28} className="text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </p>
                <p className="text-sm text-gray-600">{action.description}</p>
                {action.disabled && (
                  <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    Próximamente
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              ¿Primera vez comprando?
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed mb-4">
              Explorá nuestro catálogo de productos tecnológicos funcionales.
              Envío gratis en compras a partir de la segunda unidad.
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
