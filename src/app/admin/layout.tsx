"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Shield,
  Menu,
  X,
  Home,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Eye,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.rol !== "admin") {
        router.push("/unauthorized");
        return;
      }
    }
  }, [user, loading, mounted, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    if (sidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [sidebarOpen]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Cargando panel de administrador...
          </p>
        </div>
      </div>
    );
  }

  if (user.rol !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso no autorizado
          </h3>
          <p className="text-gray-600 mb-4">
            No tenés permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: Home,
      exact: true,
    },
    {
      label: "Productos",
      href: "/admin/productos",
      icon: Package,
      exact: false,
    },
    {
      label: "Pedidos",
      href: "/admin/pedidos",
      icon: ShoppingCart,
      exact: false,
    },
    {
      label: "Usuarios",
      href: "/admin/usuarios",
      icon: Users,
      exact: false,
    },
    {
      label: "Configuración",
      href: "/admin/configuracion",
      icon: Settings,
      exact: false,
      disabled: true,
    },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              motef Admin
            </h2>
            <p className="text-sm text-gray-500 truncate">
              {user?.nombre || "Administrador"}
            </p>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Eye size={14} />
          Ver tienda
          <ChevronRight size={14} />
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map(({ label, href, icon: Icon, exact, disabled }) => {
            const active = !disabled && isActive(href, exact);
            return (
              <li key={href}>
                {disabled ? (
                  <div className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed">
                    <Icon size={18} className="text-gray-300" />
                    <span className="flex-1">{label}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      Pronto
                    </span>
                  </div>
                ) : (
                  <Link
                    href={href}
                    className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`${
                        active
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle size={16} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Acceso de administrador
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                Tenés control total sobre productos, pedidos y usuarios.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <aside className="w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          <SidebarContent />
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin</h1>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            <aside className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-out">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Menú Admin
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </aside>
          </div>
        )}

        <main className="p-4 pb-safe">{children}</main>
      </div>
    </div>
  );
}
