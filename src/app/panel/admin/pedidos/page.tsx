"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import axios from "axios";
import {
  ShoppingCart,
  AlertCircle,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import Image from "next/image";

interface Pedido {
  id: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  metodo_pago: string;
  mercadopago_payment_id?: string;
  mercadopago_status?: string;
  usuario_id: number;
  usuario_nombre?: string;
  usuario_email?: string;
  items_count: number;
  productos_count: number;
}

interface DetallePedido {
  id: number;
  producto_id: number;
  nombre_producto: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen_url?: string;
  slug?: string;
}

interface DireccionPedido {
  nombre_contacto: string;
  telefono_contacto: string;
  direccion: string;
  ciudad: string;
  provincia?: string;
  codigo_postal?: string;
  referencias?: string;
}

interface PedidoDetallado extends Pedido {
  direccion: DireccionPedido;
  items: DetallePedido[];
  fecha_pago?: string;
  fecha_procesado?: string;
  fecha_enviado?: string;
  fecha_entregado?: string;
  notas?: string;
}

type PedidoWithIndex = Pedido & Record<string, unknown>;

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PedidoDetallado | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setTableLoading(true);
    try {
      const res = await fetch("/api/admin/pedidos");
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setError("Error al cargar pedidos.");
    } finally {
      setTableLoading(false);
    }
  };

  const verDetalle = async (pedido: PedidoWithIndex) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}`);
      if (!res.ok) throw new Error("Error al cargar detalle");
      const data = await res.json();
      setPedidoSeleccionado(data);
      setModalAbierto(true);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      setError("Error al cargar detalle del pedido.");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!pedidoSeleccionado) return;

    const confirmMsg = `¿Cambiar estado del pedido ${pedidoSeleccionado.numero_pedido} a "${nuevoEstado}"?`;
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setError("");

    try {
      await axios.put(`/api/admin/pedidos/${pedidoSeleccionado.id}`, {
        estado: nuevoEstado,
      });

      setSuccess(`Estado actualizado a: ${nuevoEstado}`);
      setTimeout(() => {
        setModalAbierto(false);
        setSuccess("");
        fetchPedidos();
      }, 1500);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("Error al cambiar estado del pedido.");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEstado = (pedido: PedidoWithIndex) => {
    const estados = {
      pendiente: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
        label: "Pendiente",
      },
      procesando: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Package,
        label: "Procesando",
      },
      enviado: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Truck,
        label: "Enviado",
      },
      entregado: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Entregado",
      },
      cancelado: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Cancelado",
      },
    };

    const estado = estados[pedido.estado as keyof typeof estados];
    const Icon = estado.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${estado.color}`}
      >
        <Icon size={14} />
        {estado.label}
      </span>
    );
  };

  const renderEstadoDetalle = (estado: string) => {
    const estados = {
      pendiente: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
        label: "Pendiente",
      },
      procesando: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Package,
        label: "Procesando",
      },
      enviado: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Truck,
        label: "Enviado",
      },
      entregado: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Entregado",
      },
      cancelado: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Cancelado",
      },
    };

    const estadoData = estados[estado as keyof typeof estados];
    const Icon = estadoData.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${estadoData.color}`}
      >
        <Icon size={14} />
        {estadoData.label}
      </span>
    );
  };

  const renderPedido = (pedido: PedidoWithIndex) => (
    <div className="space-y-1">
      <div className="font-semibold text-gray-900 text-sm">
        {pedido.numero_pedido}
      </div>
      <div className="text-xs text-gray-500">
        {formatearFecha(pedido.fecha_pedido)}
      </div>
    </div>
  );

  const renderCliente = (pedido: PedidoWithIndex) => (
    <div className="space-y-1">
      <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
        <User size={14} className="text-gray-500" />
        {pedido.usuario_nombre || "Sin nombre"}
      </div>
      <div className="text-xs text-gray-500">{pedido.usuario_email}</div>
    </div>
  );

  const renderTotal = (pedido: PedidoWithIndex) => (
    <div className="space-y-1">
      <div className="text-sm font-bold text-gray-900">
        ${(pedido.total as number).toLocaleString("es-AR")}
      </div>
      <div className="text-xs text-gray-500">
        {pedido.items_count} item{pedido.items_count !== 1 ? "s" : ""} (
        {pedido.productos_count} prod.)
      </div>
    </div>
  );

  const renderMetodoPago = (pedido: PedidoWithIndex) => {
    const metodo = pedido.metodo_pago as string;
    return (
      <div className="flex items-center gap-2">
        <DollarSign size={14} className="text-gray-500" />
        <span className="text-sm text-gray-700 capitalize">
          {metodo === "mercadopago" ? "Mercado Pago" : metodo}
        </span>
      </div>
    );
  };

  const pedidosConIndex: PedidoWithIndex[] = pedidos.map((p) => ({ ...p }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Pedidos
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los pedidos de la tienda
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {error && !modalAbierto && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabla */}
      <DataTable<PedidoWithIndex>
        data={pedidosConIndex}
        loading={tableLoading}
        searchKeys={["numero_pedido", "usuario_nombre", "usuario_email"]}
        columns={[
          {
            key: "numero_pedido",
            label: "Pedido",
            sortable: true,
            render: renderPedido,
            width: "min-w-[180px]",
            sticky: true,
          },
          {
            key: "usuario_nombre",
            label: "Cliente",
            sortable: true,
            render: renderCliente,
            width: "min-w-[200px]",
          },
          {
            key: "estado",
            label: "Estado",
            sortable: true,
            render: renderEstado,
            width: "min-w-[140px]",
          },
          {
            key: "total",
            label: "Total",
            sortable: true,
            render: renderTotal,
            width: "min-w-[140px]",
          },
          {
            key: "metodo_pago",
            label: "Método de Pago",
            sortable: true,
            render: renderMetodoPago,
            width: "min-w-[150px]",
          },
        ]}
        onView={verDetalle}
        pageSize={15}
      />

      {/* Modal de detalle */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={`Pedido ${pedidoSeleccionado?.numero_pedido || ""}`}
        size="xl"
      >
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando detalle...</p>
            </div>
          </div>
        )}

        {!loading && pedidoSeleccionado && (
          <div className="max-h-[85vh] overflow-y-auto p-2">
            <div className="space-y-6">
              {/* Mensajes */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle size={14} className="text-green-500" />
                  <p className="text-green-700 text-sm font-medium">
                    {success}
                  </p>
                </div>
              )}

              {/* Estado y acciones */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Estado del Pedido
                  </h3>
                  {renderEstadoDetalle(pedidoSeleccionado.estado)}
                </div>

                <div className="flex flex-wrap gap-2">
                  {pedidoSeleccionado.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => cambiarEstado("procesando")}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                      >
                        Marcar como Procesando
                      </button>
                      <button
                        onClick={() => cambiarEstado("cancelado")}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Cancelar Pedido
                      </button>
                    </>
                  )}

                  {pedidoSeleccionado.estado === "procesando" && (
                    <button
                      onClick={() => cambiarEstado("enviado")}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50"
                    >
                      Marcar como Enviado
                    </button>
                  )}

                  {pedidoSeleccionado.estado === "enviado" && (
                    <button
                      onClick={() => cambiarEstado("entregado")}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                    >
                      Marcar como Entregado
                    </button>
                  )}
                </div>
              </div>

              {/* Información del cliente y dirección */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Nombre:</span>{" "}
                      {pedidoSeleccionado.usuario_nombre}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {pedidoSeleccionado.usuario_email}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-green-500" />
                    Dirección de Envío
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Contacto:</span>{" "}
                      {pedidoSeleccionado.direccion.nombre_contacto}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone size={12} />
                      {pedidoSeleccionado.direccion.telefono_contacto}
                    </p>
                    <p className="text-gray-600">
                      {pedidoSeleccionado.direccion.direccion}
                    </p>
                    <p className="text-gray-600">
                      {pedidoSeleccionado.direccion.ciudad}
                      {pedidoSeleccionado.direccion.provincia &&
                        `, ${pedidoSeleccionado.direccion.provincia}`}
                    </p>
                    {pedidoSeleccionado.direccion.referencias && (
                      <p className="text-gray-500 text-xs italic">
                        {pedidoSeleccionado.direccion.referencias}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={16} className="text-purple-500" />
                  Productos del Pedido
                </h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.imagen_url ? (
                          <Image
                            src={item.imagen_url}
                            alt={item.nombre_producto}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.nombre_producto}
                        </p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        <p className="text-xs text-gray-600">
                          ${item.precio_unitario.toLocaleString("es-AR")} x{" "}
                          {item.cantidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${item.subtotal.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de pago */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-green-500" />
                  Resumen de Pago
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${pedidoSeleccionado.subtotal.toLocaleString("es-AR")}
                    </span>
                  </div>
                  {pedidoSeleccionado.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span className="font-medium">
                        -$
                        {pedidoSeleccionado.descuento.toLocaleString("es-AR")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium">
                      {pedidoSeleccionado.costo_envio === 0
                        ? "Gratis"
                        : `$${pedidoSeleccionado.costo_envio.toLocaleString(
                            "es-AR"
                          )}`}
                    </span>
                  </div>
                  <div className="border-t border-green-300 pt-2 flex justify-between text-lg font-bold text-green-900">
                    <span>Total:</span>
                    <span>
                      ${pedidoSeleccionado.total.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Método:</span>{" "}
                    {pedidoSeleccionado.metodo_pago === "mercadopago"
                      ? "Mercado Pago"
                      : pedidoSeleccionado.metodo_pago}
                  </div>
                </div>
              </div>

              {/* Botón cerrar */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
