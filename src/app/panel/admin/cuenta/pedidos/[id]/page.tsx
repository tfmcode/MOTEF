"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  AlertCircle,
  DollarSign,
} from "lucide-react";

interface DetallePedido {
  id: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  metodo_pago: string;
  fecha_pago?: string;
  fecha_procesado?: string;
  fecha_enviado?: string;
  fecha_entregado?: string;
  notas?: string;
  direccion: {
    nombre_contacto: string;
    telefono_contacto: string;
    direccion: string;
    ciudad: string;
    provincia?: string;
    codigo_postal?: string;
    referencias?: string;
  };
  items: Array<{
    id: number;
    producto_id: number;
    nombre_producto: string;
    sku: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    imagen_url?: string;
    slug?: string;
  }>;
}

export default function PedidoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<DetallePedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await fetch(`/api/pedidos/${params.id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Pedido no encontrado");
          }
          throw new Error("Error al cargar el pedido");
        }

        const data = await res.json();
        setPedido(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Error al cargar pedido");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPedido();
    }
  }, [params.id]);

  const estadoConfig = {
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    procesando: {
      label: "Procesando",
      icon: Package,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    enviado: {
      label: "Enviado",
      icon: Truck,
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    entregado: {
      label: "Entregado",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    cancelado: {
      label: "Cancelado",
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-500" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/cuenta/pedidos")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a mis pedidos
          </button>
        </div>
      </div>
    );
  }

  const config = estadoConfig[pedido.estado];
  const Icon = config.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Botón volver */}
      <Link
        href="/cuenta/pedidos"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver a mis pedidos</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pedido #{pedido.numero_pedido}
            </h1>
            <p className="text-sm text-gray-600">
              Realizado el{" "}
              {new Date(pedido.fecha_pedido).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${config.color}`}
          >
            <Icon size={20} />
            {config.label}
          </div>
        </div>
      </div>

      {/* Timeline del pedido */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Estado del pedido
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Pedido realizado</p>
              <p className="text-sm text-gray-600">
                {new Date(pedido.fecha_pedido).toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {pedido.fecha_procesado && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Procesando</p>
                <p className="text-sm text-gray-600">
                  {new Date(pedido.fecha_procesado).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          )}

          {pedido.fecha_enviado && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">En camino</p>
                <p className="text-sm text-gray-600">
                  {new Date(pedido.fecha_enviado).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          )}

          {pedido.fecha_entregado && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Entregado</p>
                <p className="text-sm text-gray-600">
                  {new Date(pedido.fecha_entregado).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag size={20} className="text-blue-500" />
          Productos
        </h2>

        <div className="space-y-4">
          {pedido.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                {item.imagen_url ? (
                  <Image
                    src={item.imagen_url}
                    alt={item.nombre_producto}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.nombre_producto}
                </h3>
                <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                <p className="text-sm text-gray-600">
                  ${item.precio_unitario.toLocaleString("es-AR")} x{" "}
                  {item.cantidad}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">
                  ${item.subtotal.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dirección de envío */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-green-500" />
          Dirección de envío
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="text-gray-900">
              {pedido.direccion.nombre_contacto}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-400" />
            <span className="text-gray-900">
              {pedido.direccion.telefono_contacto}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-900">{pedido.direccion.direccion}</p>
              <p className="text-gray-600">
                {pedido.direccion.ciudad}
                {pedido.direccion.provincia &&
                  `, ${pedido.direccion.provincia}`}
              </p>
              {pedido.direccion.codigo_postal && (
                <p className="text-gray-600">
                  CP: {pedido.direccion.codigo_postal}
                </p>
              )}
              {pedido.direccion.referencias && (
                <p className="text-sm text-gray-500 mt-2">
                  Referencias: {pedido.direccion.referencias}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de pago */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign size={20} className="text-purple-500" />
          Resumen de pago
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span className="font-semibold">
              ${pedido.subtotal.toLocaleString("es-AR")}
            </span>
          </div>

          {pedido.descuento > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento:</span>
              <span className="font-semibold">
                -${pedido.descuento.toLocaleString("es-AR")}
              </span>
            </div>
          )}

          <div className="flex justify-between text-gray-700">
            <span>Envío:</span>
            <span className="font-semibold">
              {pedido.costo_envio === 0
                ? "Gratis"
                : `$${pedido.costo_envio.toLocaleString("es-AR")}`}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span>${pedido.total.toLocaleString("es-AR")}</span>
          </div>

          <div className="text-sm text-gray-600 mt-4">
            {pedido.metodo_pago === "mercadopago"
              ? "Mercado Pago"
              : pedido.metodo_pago}
          </div>
        </div>
      </div>

      {/* Notas */}
      {pedido.notas && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Notas del pedido</h3>
          <p className="text-sm text-blue-700">{pedido.notas}</p>
        </div>
      )}
    </div>
  );
}
