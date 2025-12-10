"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ChevronRight,
} from "lucide-react";

interface Pedido {
  id: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  items_count: number;
  productos_count: number;
}

export default function MisPedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("/api/cuenta/pedidos", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al cargar pedidos");

        const data = await res.json();
        setPedidos(data.pedidos || []);
      } catch (err) {
        console.error("Error:", err);
        setError("Error al cargar tus pedidos");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPedidos();
    }
  }, [user]);

  const estadoConfig = {
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      iconColor: "text-amber-500",
    },
    procesando: {
      label: "Procesando",
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    enviado: {
      label: "Enviado",
      icon: Truck,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      iconColor: "text-purple-500",
    },
    entregado: {
      label: "Entregado",
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
    },
    cancelado: {
      label: "Cancelado",
      icon: XCircle,
      color: "red",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
    },
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-500" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Aún no tenés pedidos
          </h2>
          <p className="text-gray-600 mb-6">
            Explorá nuestro catálogo y hacé tu primera compra
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ver productos
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        </div>
        <p className="text-gray-600">
          Acá podés ver el historial y estado de tus compras
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-900">
              {pedidos.length}
            </div>
            <div className="text-sm text-blue-700 font-medium">
              Total de pedidos
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-900">
              {pedidos.filter((p) => p.estado === "entregado").length}
            </div>
            <div className="text-sm text-green-700 font-medium">Entregados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-900">
              {
                pedidos.filter(
                  (p) =>
                    p.estado === "pendiente" ||
                    p.estado === "procesando" ||
                    p.estado === "enviado"
                ).length
              }
            </div>
            <div className="text-sm text-amber-700 font-medium">En proceso</div>
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const config = estadoConfig[pedido.estado];
          const Icon = config.icon;

          return (
            <div
              key={pedido.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                {/* Header del pedido */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Pedido #{pedido.numero_pedido}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatearFecha(pedido.fecha_pedido)}
                    </p>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
                  >
                    <Icon size={18} className={config.iconColor} />
                    <span className="font-semibold text-sm">
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Detalles del pedido */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Productos</p>
                    <p className="font-semibold text-gray-900">
                      {pedido.productos_count}{" "}
                      {pedido.productos_count === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cantidad</p>
                    <p className="font-semibold text-gray-900">
                      {pedido.items_count}{" "}
                      {pedido.items_count === 1 ? "unidad" : "unidades"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="font-bold text-lg text-gray-900">
                      ${pedido.total.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Link
                      href={`/cuenta/pedidos/${pedido.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                      Ver detalles
                    </Link>
                  </div>
                </div>

                {/* Info de envío */}
                {pedido.costo_envio > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        Envío: ${pedido.costo_envio.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Descuento */}
                {pedido.descuento > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 font-medium">
                        Descuento aplicado: -$
                        {pedido.descuento.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA final */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-purple-900 mb-2">
          ¿Buscás algo más?
        </h3>
        <p className="text-sm text-purple-700 mb-4">
          Explorá nuestro catálogo y encontrá productos tecnológicos útiles
        </p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Ver productos
          <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
}
