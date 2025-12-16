import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gray-100">
      {/* Decorative top border with gradient */}
      <div className="h-1 bg-gradient-to-r from-motef-primary via-orange-400 to-motef-primary"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Columna 1: Logo y Redes */}
          <div>
            <div className="mb-6">
              <Image
                src="/Logo.png"
                alt="MOTEF Logo"
                width={180}
                height={90}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              Especialistas en repuestos y accesorios de calidad para
              motocicletas, bicicletas y hogar. Tu confianza, nuestro
              compromiso.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 text-white"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-pink-600 hover:bg-pink-700 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 text-white"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="text-gray-900 font-bold mb-5 text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-motef-primary to-orange-400 rounded-full"></span>
              Mapa del Sitio
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/#categorias"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Categorías
                </Link>
              </li>
              <li>
                <Link
                  href="/#sobre-nosotros"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Políticas Legales
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Cuenta y Ayuda */}
          <div>
            <h3 className="text-gray-900 font-bold mb-5 text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-motef-primary to-orange-400 rounded-full"></span>
              Mi Cuenta y Ayuda
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/cuenta"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Mi Cuenta
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta/pedidos"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Mis Pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Carrito
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="text-gray-700 hover:text-motef-primary transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  → Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-gray-900 font-bold mb-5 text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-motef-primary to-orange-400 rounded-full"></span>
              Contáctanos
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-motef-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block text-xs mb-1">
                    Email Soporte
                  </span>
                  <a
                    href="mailto:motef.tech.ar@gmail.com"
                    className="text-gray-700 hover:text-motef-primary transition-colors text-xs"
                  >
                    motef.tech.ar@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block text-xs mb-1">
                    WhatsApp
                  </span>
                  <a
                    href="tel:+5491168896621"
                    className="text-gray-700 hover:text-motef-primary transition-colors text-xs"
                  >
                    +54 9 11 6889-6621
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block text-xs mb-1">
                    Ubicación
                  </span>
                  <span className="text-gray-700 text-xs">Buenos Aires, Argentina</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-orange-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p className="font-medium">
              © {new Date().getFullYear()} MOTEF. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="/politicas-legales"
                className="hover:text-motef-primary transition-colors font-medium"
              >
                Términos
              </Link>
              <Link
                href="/politicas-legales"
                className="hover:text-motef-primary transition-colors font-medium"
              >
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
