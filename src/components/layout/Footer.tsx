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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <Image
                src="/Logo.jpg"
                alt="MOTEF Logo"
                width={200}
                height={80}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Especialistas en repuestos y accesorios automotrices de calidad.
              Tu confianza, nuestro compromiso.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-motef-primary rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-motef-primary rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-motef-primary rounded-full flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-motef-primary transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="hover:text-motef-primary transition-colors"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/#categorias"
                  className="hover:text-motef-primary transition-colors"
                >
                  Categorías
                </Link>
              </li>
              <li>
                <Link
                  href="/#sobre-nosotros"
                  className="hover:text-motef-primary transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/#preguntas-frecuentes"
                  className="hover:text-motef-primary transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/cuenta"
                  className="hover:text-motef-primary transition-colors"
                >
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta/pedidos"
                  className="hover:text-motef-primary transition-colors"
                >
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="hover:text-motef-primary transition-colors"
                >
                  Carrito
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="hover:text-motef-primary transition-colors"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-legales"
                  className="hover:text-motef-primary transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-motef-primary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:motef.tech.ar@gmail.com"
                  className="hover:text-motef-primary transition-colors"
                >
                  motef.tech.ar@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-motef-primary flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+5491168896621"
                  className="hover:text-motef-primary transition-colors"
                >
                  +54 9 11 6889-6621
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-motef-primary flex-shrink-0 mt-0.5" />
                <span>Buenos Aires, Argentina</span>
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
                Términos de Servicio
              </Link>
              <Link
                href="/politicas-legales"
                className="hover:text-motef-primary transition-colors"
              >
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
