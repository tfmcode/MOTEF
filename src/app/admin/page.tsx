"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  DollarSign,
  Box,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total_productos: number;
  productos_activos: number;
  productos_destacados: number;
  productos_sin_stock: number;
  productos_stock_bajo: number;
  stock_total: number;
  total_pedidos: number;
  pedidos_pendientes: number;
  pedidos_procesando: number;
  pedidos_enviados: number;
  pedidos_entregados: number;
  pedidos_hoy: number;
  pedidos_semana: number;
  pedidos_mes: number;
  ingresos_total: number;
  ingresos_mes: number;
  total_usuarios: number;
  total_admins: number;
  total_clientes: number;
  usuarios_mes: number;
  usuarios_activos: number;
  top_productos: Array<{
    id: number;
    nombre: string;
    slug: string;
    imagen_url?: string;
    veces_vendido: number;
    unidades_vendidas: number;
    ingresos_totales: number;
  }>;
  last_updated: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Error al cargar estadísticas");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error:", err);
        setError("Error al cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    href,
    subtitle,
    trend,
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    href: string;
    subtitle?: string;
    trend?: {
      value: number;
      isPositive: boolean;
      period: string;
    };
  }) => (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-blue-200 group-hover:shadow-blue-100/50">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 bg-${color}-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon size={24} className="text-white" />
          </div>
          <ArrowRight
            size={20}
            className={`text-gray-400 group-hover:text-${color}-500 transition-colors`}
          />
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <div className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
            ) : typeof value === "number" ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}%</span>
              <span className="text-gray-500">{trend.period}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle size={24} className="text-red-500" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar estadísticas
            </h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Nuevo Producto",
      description: "Agregar producto al catálogo",
      icon: Package,
      href: "/admin/productos",
      color: "blue",
    },
    {
      title: "Ver Pedidos",
      description: "Gestionar pedidos pendientes",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      color: "green",
    },
    {
      title: "Ver Tienda",
      description: "Ir al sitio público",
      icon: TrendingUp,
      href: "/",
      color: "purple",
      external: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona productos, pedidos y usuarios de motef
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>
              Actualizado:{" "}
              {new Date(stats.last_updated).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats.total_productos}
          icon={Package}
          color="blue"
          href="/admin/productos"
          subtitle={`${stats.productos_activos} activos`}
        />
        <StatCard
          title="Pedidos Pendientes"
          value={stats.pedidos_pendientes}
          icon={ShoppingCart}
          color="amber"
          href="/admin/pedidos"
          subtitle="Requieren atención"
        />
        <StatCard
          title="Clientes"
          value={stats.total_clientes}
          icon={Users}
          color="green"
          href="/admin/usuarios"
          subtitle={`${stats.usuarios_mes} este mes`}
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${stats.ingresos_mes.toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          icon={DollarSign}
          color="purple"
          href="/admin/pedidos"
          subtitle={`${stats.pedidos_mes} pedidos`}
        />
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda */}
        <div className="lg:col-span-1 space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-500" />
              Acciones Rápidas
            </h2>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Alertas de stock */}
          {(stats.productos_sin_stock > 0 ||
            stats.productos_stock_bajo > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" />
                Alertas de Stock
              </h3>
              <div className="space-y-3">
                {stats.productos_sin_stock > 0 && (
                  <Link
                    href="/admin/productos?filtro=sin_stock"
                    className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <span className="text-sm text-red-900 font-medium">
                      Sin stock
                    </span>
                    <span className="font-bold text-red-600">
                      {stats.productos_sin_stock}
                    </span>
                  </Link>
                )}
                {stats.productos_stock_bajo > 0 && (
                  <Link
                    href="/admin/productos?filtro=stock_bajo"
                    className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <span className="text-sm text-amber-900 font-medium">
                      Stock bajo (≤5)
                    </span>
                    <span className="font-bold text-amber-600">
                      {stats.productos_stock_bajo}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumen de ventas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-green-500" />
              Resumen de Ventas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Ingresos Totales
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-900">
                  ${stats.ingresos_total.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Pedidos Hoy
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.pedidos_hoy}
                </p>
              </div>
            </div>
          </div>

          {/* Top Productos */}
          {stats.top_productos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-500" />
                Productos Más Vendidos
              </h2>

              <div className="space-y-3">
                {stats.top_productos.map((producto, index) => (
                  <Link
                    key={producto.id}
                    href={`/productos/${producto.slug}`}
                    target="_blank"
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-200 transition-all"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        #{index + 1} {producto.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {producto.unidades_vendidas} unidades • $
                        {producto.ingresos_totales.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
