"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Package,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCarrito } from "@/context/CarritoContext";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalItems } = useCarrito();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-100/95 backdrop-blur-md shadow-lg"
          : "bg-gray-100 border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b border-gray-100">
          <div className="flex items-center gap-6 text-gray-600">
            <span className="flex items-center gap-2 font-medium">
              <Package className="w-4 h-4 text-motef-primary" />
              Envíos a todo el país
            </span>
            <span>•</span>
            <span className="font-medium">Pago seguro con Mercado Pago</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/#sobre-nosotros"
              className="text-gray-600 hover:text-motef-primary transition-colors font-medium"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/#preguntas-frecuentes"
              className="text-gray-600 hover:text-motef-primary transition-colors font-medium"
            >
              Ayuda
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between h-20 lg:h-28">
          <Link href="/" className="flex items-center group">
            {/* Logo visible y centrado */}
            <div className="relative w-32 h-20 sm:w-48 sm:h-24 lg:w-64 lg:h-34">
              <Image
                src="/Logo.png"
                alt="MOTEF Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`font-semibold text-sm transition-colors ${
                isActive("/")
                  ? "text-motef-primary border-b-2 border-motef-primary pb-1"
                  : "text-gray-700 hover:text-motef-primary"
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/productos"
              className={`font-semibold text-sm transition-colors ${
                isActive("/productos")
                  ? "text-motef-primary border-b-2 border-motef-primary pb-1"
                  : "text-gray-700 hover:text-motef-primary"
              }`}
            >
              Productos
            </Link>

            <Link
              href="/#categorias"
              className="font-semibold text-sm transition-colors text-gray-700 hover:text-motef-primary"
            >
              Categorías
            </Link>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <Link
              href="/productos"
              className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/carrito"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-motef-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={user.rol === "admin" ? "/panel/admin" : "/panel/cuenta"}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    {user.rol === "admin" ? "Admin" : "Mi Cuenta"}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-motef-primary transition-colors flex items-center gap-1"
                >
                  <LogIn size={18} />
                  Iniciar
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 text-sm font-semibold bg-motef-primary text-white rounded-full hover:bg-motef-primary-dark transition-all shadow-md flex items-center gap-1 hover:shadow-lg"
                >
                  <UserPlus size={18} />
                  Regístrate
                </Link>
              </div>
            )}

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={showMenu ? "Cerrar menú" : "Abrir menú"}
            >
              {showMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            showMenu
              ? "max-h-[600px] opacity-100 visible pb-6"
              : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
        >
          <nav className="pt-4 space-y-1">
            <Link
              href="/"
              onClick={() => setShowMenu(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive("/")
                  ? "bg-orange-50 text-motef-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/productos"
              onClick={() => setShowMenu(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive("/productos")
                  ? "bg-orange-50 text-motef-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Productos
            </Link>

            <Link
              href="/#categorias"
              onClick={() => setShowMenu(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Categorías
            </Link>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <Link
                    href={
                      user.rol === "admin" ? "/panel/admin" : "/panel/cuenta"
                    }
                    onClick={() => setShowMenu(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700"
                  >
                    <User className="w-5 h-5" />
                    {user.rol === "admin" ? "Panel Admin" : "Mi Cuenta"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg border-2 border-motef-primary text-motef-primary font-medium text-center hover:bg-orange-50"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg bg-motef-primary text-white font-medium text-center hover:bg-motef-primary-dark"
                  >
                    Regístrate
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
