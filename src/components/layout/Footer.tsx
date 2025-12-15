import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t-8 border-motef-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Columna 1: Logo y Redes */}
          <div>
            <div className="mb-6">
              <Image
                src="/Logo.jpg"
                alt="MOTEF Logo"
                width={150}
                height={60}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Especialistas en repuestos y accesorios de calidad para
              motocicletas, bicicletas y hogar. Tu confianza, nuestro
              compromiso.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-motef-primary rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-motef-primary rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-motef-primary rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg border-b-2 border-motef-primary-dark/50 pb-2">
              Mapa del Sitio
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/#categorias"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Categorías
                </Link>
              </li>
              <li>
                <Link
                  href="/#sobre-nosotros"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Políticas Legales
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Cuenta y Ayuda */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg border-b-2 border-motef-primary-dark/50 pb-2">
              Mi Cuenta y Ayuda
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/cuenta"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta/pedidos"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Carrito
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="text-gray-400 hover:text-motef-primary transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-white font-bold mb-5 text-lg border-b-2 border-motef-primary-dark/50 pb-2">
              Contáctanos
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-motef-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    Email Soporte
                  </span>
                  <a
                    href="mailto:motef.tech.ar@gmail.com"
                    className="text-gray-400 hover:text-motef-primary transition-colors"
                  >
                    motef.tech.ar@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-motef-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    WhatsApp
                  </span>
                  <a
                    href="tel:+5491168896621"
                    className="text-gray-400 hover:text-motef-primary transition-colors"
                  >
                    +54 9 11 6889-6621
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-motef-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    Ubicación
                  </span>
                  <span className="text-gray-400">Buenos Aires, Argentina</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} MOTEF. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="/politicas-legales"
                className="hover:text-motef-primary transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/politicas-legales"
                className="hover:text-motef-primary transition-colors"
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
