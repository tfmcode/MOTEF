"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Youtube,
  Phone,
  Mail,
  ArrowRight,
  ShoppingBag,
  Shield,
  Truck,
  CreditCard,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Sección principal */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Logo y descripción - Centrado en mobile */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <Link href="/" className="inline-block group mb-6">
            <div className="relative w-56 h-24 sm:w-64 sm:h-28 lg:w-72 lg:h-32">
              <Image
                src="/LogoTrs.png"
                alt="motef Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Tecnología útil y funcional para tu día a día. Soportes de calidad
            para celulares, tablets y notebooks que realmente hacen la
            diferencia.
          </p>

          {/* Redes sociales - Centradas */}
          <div className="flex gap-3 mt-6">
            <a
              href="https://www.instagram.com/motef.tech.arg/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
              aria-label="Instagram"
            >
              <Instagram size={20} className="text-white" />
            </a>
            <a
              href="https://www.youtube.com/@motefTechAR"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
              aria-label="YouTube"
            >
              <Youtube size={20} className="text-white" />
            </a>
            <a
              href="https://www.tiktok.com/@motef.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
              aria-label="TikTok"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Grid de links - 2 columnas en mobile, 3 en tablet, 3 en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-5xl mx-auto">
          {/* Tienda */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tienda</h3>
            <ul className="space-y-3">
              {[
                { label: "Productos", href: "/productos" },
                { label: "Soportes para Celular", href: "/productos" },
                { label: "Soportes para Tablet", href: "/productos" },
                { label: "Soportes para Notebook", href: "/productos" },
                { label: "Ofertas Especiales", href: "/productos" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 inline-flex items-center gap-2 group text-sm"
                  >
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Información
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Sobre Nosotros", href: "/#sobre-nosotros" },
                {
                  label: "Preguntas Frecuentes",
                  href: "/#preguntas-frecuentes",
                },
                {
                  label: "Envíos y Entregas",
                  href: "/politicas-legales#envios",
                },
                {
                  label: "Métodos de Pago",
                  href: "/politicas-legales#terminos",
                },
                {
                  label: "Política de Devoluciones",
                  href: "/politicas-legales#cambios",
                },
                {
                  label: "Términos y Condiciones",
                  href: "/politicas-legales#terminos",
                },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 inline-flex items-center gap-2 group text-sm"
                  >
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contacto</h3>

            {/* Contenedor de contactos */}
            <div className="flex flex-col items-center sm:items-start space-y-3 px-[15%] sm:px-0">
              {/* WhatsApp */}
              <a
                href="https://wa.me/5491168896621?text=Hola! Quiero consultar sobre los productos de motef"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors duration-200 group w-full sm:w-fit"
              >
                <div className="w-11 h-11 flex-shrink-0 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Phone size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    WhatsApp
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    +54 9 11 6889-6621
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:motef.tech.ar@gmail.com"
                className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 group w-full sm:w-fit"
              >
                <div className="w-11 h-11 flex-shrink-0 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Mail size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    Email
                  </p>
                  <p className="text-xs text-gray-500">
                    motef.tech.ar@gmail.com
                  </p>
                </div>
              </a>

              {/* Horarios */}
              <div className="pt-4 mt-2 border-t border-gray-200 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                <p className="text-xs font-semibold text-gray-900 mb-2">
                  Horarios de Atención
                </p>
                <p className="text-xs text-gray-600">Lunes a Viernes</p>
                <p className="text-xs text-gray-600">9:00 - 18:00 hs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beneficios destacados */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Envío Gratis",
                subtitle: "Desde 2da unidad",
              },
              {
                icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Compra Segura",
                subtitle: "Protección total",
              },
              {
                icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Múltiples Pagos",
                subtitle: "Mercado Pago",
              },
              {
                icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Calidad",
                subtitle: "Productos garantizados",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left"
              >
                <div className="flex-shrink-0 text-blue-600">{item.icon}</div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="border-t border-gray-200 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              ¿Buscás el soporte perfecto?
            </h3>
            <p className="text-blue-100 mb-6 text-sm sm:text-base max-w-2xl mx-auto">
              Explorá nuestro catálogo completo y encontrá la solución ideal
              para tus dispositivos
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base"
            >
              Ver Todos los Productos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-600">
            <p className="text-center md:text-left">
              © {currentYear} motef. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/politicas-legales#terminos"
                className="hover:text-blue-600 transition-colors"
              >
                Términos
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/politicas-legales#privacidad"
                className="hover:text-blue-600 transition-colors"
              >
                Privacidad
              </Link>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://tfmcode.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Desarrollado por TFM Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
