"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, User, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCartCount(0);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b border-gray-100">
          <div className="flex items-center gap-6 text-gray-600">
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Envíos a todo el país
            </span>
            <span>•</span>
            <span>Pago seguro con Mercado Pago</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/#sobre-nosotros"
              className="text-gray-600 hover:text-motef-primary transition-colors"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/#preguntas-frecuentes"
              className="text-gray-600 hover:text-motef-primary transition-colors"
            >
              Preguntas Frecuentes
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link href="/" className="flex items-center group">
            <div className="relative w-48 h-16 sm:w-56 sm:h-20 md:w-64 md:h-22 lg:w-72 lg:h-24">
              <Image
                src="/Logo.jpg"
                alt="MOTEF Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive("/")
                  ? "text-motef-primary"
                  : "text-gray-700 hover:text-motef-primary"
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/productos"
              className={`font-medium transition-colors ${
                isActive("/productos")
                  ? "text-motef-primary"
                  : "text-gray-700 hover:text-motef-primary"
              }`}
            >
              Productos
            </Link>

            <Link
              href="/#categorias"
              className="font-medium transition-colors text-gray-700 hover:text-motef-primary"
            >
              Categorías
            </Link>

            <Link
              href="/#sobre-nosotros"
              className="font-medium transition-colors text-gray-700 hover:text-motef-primary"
            >
              Sobre Nosotros
            </Link>
          </nav>

          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              href="/productos"
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Buscar</span>
            </Link>

            <Link
              href="/carrito"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-motef-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={user.rol === "admin" ? "/admin" : "/cuenta"}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.rol === "admin" ? "Admin" : "Mi Cuenta"}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-motef-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 text-sm font-medium bg-motef-primary text-white rounded-full hover:bg-motef-primary-dark transition-colors"
                >
                  Registrarse
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

            <Link
              href="/#sobre-nosotros"
              onClick={() => setShowMenu(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sobre Nosotros
            </Link>

            <Link
              href="/#preguntas-frecuentes"
              onClick={() => setShowMenu(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Preguntas Frecuentes
            </Link>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <Link
                    href={user.rol === "admin" ? "/admin" : "/cuenta"}
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-center"
                  >
                    {user.rol === "admin" ? "Panel Admin" : "Mi Cuenta"}
                  </Link>
                  {user.rol === "cliente" && (
                    <Link
                      href="/cuenta/pedidos"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 rounded-lg text-gray-700 text-center"
                    >
                      Mis Pedidos
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg border-2 border-motef-primary text-motef-primary font-medium text-center"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-lg bg-motef-primary text-white font-medium text-center"
                  >
                    Registrarse
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
