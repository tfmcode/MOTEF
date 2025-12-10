"use client";

import { useEffect, useRef } from "react";
import {
  Shield,
  FileText,
  Truck,
  RefreshCw,
  DollarSign,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PoliticasLegales = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -30,
          duration: 1,
          ease: "power3.out",
        });
      }

      sectionsRef.current.forEach((section, i) => {
        if (section) {
          gsap.from(section, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const policies = [
    {
      id: "privacidad",
      icon: <Shield className="w-6 h-6" />,
      title: "Política de Privacidad",
      color: "from-blue-500 to-blue-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            En <span className="font-semibold">motef Tech ARG</span> valoramos
            la privacidad de nuestros clientes y nos comprometemos a proteger
            sus datos personales conforme a la{" "}
            <span className="font-semibold">
              Ley N° 25.326 de Protección de Datos Personales de la República
              Argentina
            </span>
            .
          </p>
          <p className="text-gray-700 leading-relaxed">
            Los datos proporcionados por los usuarios (como nombre, correo
            electrónico, dirección o teléfono) serán utilizados exclusivamente
            para:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Procesar pedidos</li>
            <li>Coordinar envíos</li>
            <li>Brindar atención postventa</li>
            <li>Enviar información relevante sobre nuestros productos</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            <span className="font-semibold">No compartimos</span>, vendemos ni
            cedemos información personal a terceros, salvo cuando sea necesario
            para el cumplimiento del servicio (por ejemplo, empresas de envío o
            medios de pago).
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-gray-800 font-medium">
              El usuario podrá solicitar en cualquier momento la modificación,
              actualización o eliminación de sus datos escribiendo a{" "}
              <a
                href="mailto:motef.tech.ar@gmail.com"
                className="text-blue-600 hover:underline"
              >
                motef.tech.ar@gmail.com
              </a>{" "}
              con el asunto{" "}
              <span className="font-semibold">
                &quot;Baja de datos personales&quot;
              </span>
              .
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "terminos",
      icon: <FileText className="w-6 h-6" />,
      title: "Términos y Condiciones de Uso",
      color: "from-purple-500 to-purple-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            El presente documento regula el uso del sitio web de{" "}
            <span className="font-semibold">motef Tech ARG</span>, dedicado a
            la comercialización de soportes ergonómicos para notebooks de
            aluminio y otros accesorios tecnológicos.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Al acceder y realizar una compra, el usuario acepta los presentes
            Términos y Condiciones:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                📦 Disponibilidad de productos
              </h4>
              <p className="text-gray-700">
                Todos los artículos publicados están sujetos a disponibilidad de
                stock.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">💰 Precios</h4>
              <p className="text-gray-700">
                Los precios están expresados en pesos argentinos (ARS). motef
                Tech ARG se reserva el derecho de modificar precios o
                promociones sin previo aviso.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                💳 Medios de pago
              </h4>
              <p className="text-gray-700">
                Las compras pueden abonarse mediante Mercado Libre o efectivo en
                el local al momento del retiro.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                ✅ Uso del sitio
              </h4>
              <p className="text-gray-700">
                El usuario se compromete a brindar información veraz y
                actualizada al momento de realizar su pedido.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                © Propiedad intelectual
              </h4>
              <p className="text-gray-700">
                Todos los contenidos, imágenes y textos del sitio pertenecen a
                motef Tech ARG y no pueden ser reproducidos sin autorización
                previa.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "envios",
      icon: <Truck className="w-6 h-6" />,
      title: "Política de Envíos",
      color: "from-green-500 to-green-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            En <span className="font-semibold">motef Tech ARG</span>{" "}
            realizamos envíos a todo el país a través de{" "}
            <span className="font-semibold">Andreani</span> o{" "}
            <span className="font-semibold">Correo Argentino</span>, según la
            elección del cliente al momento de la compra.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Plazo de despacho
              </h4>
              <p className="text-gray-700">
                Los pedidos se despachan dentro de las{" "}
                <span className="font-semibold">24 a 48 horas hábiles</span>{" "}
                posteriores a la confirmación del pago.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                ⏱️ Tiempos de entrega
              </h4>
              <p className="text-gray-700">
                Dependen del destino y del servicio de correo seleccionado.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                📍 Seguimiento
              </h4>
              <p className="text-gray-700">
                Una vez despachado el pedido, se enviará al cliente un número de
                seguimiento para controlar el estado del envío.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">💵 Costos</h4>
              <p className="text-gray-700">
                Los costos de envío se informan antes de finalizar la compra.
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              ⚠️ Retrasos o pérdidas
            </h4>
            <p className="text-gray-700">
              motef Tech ARG no se responsabiliza por demoras atribuibles a
              las empresas de correo, aunque acompañará al cliente en la gestión
              de reclamos correspondientes.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">
              🏪 Retiro en persona
            </h4>
            <p className="text-gray-700">
              También ofrecemos la opción de retiro en persona en nuestro punto
              de entrega, abonando en efectivo al momento del retiro.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "cambios",
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Política de Cambios y Devoluciones",
      color: "from-orange-500 to-orange-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Todos nuestros productos pasan por un{" "}
            <span className="font-semibold">proceso de control de calidad</span>{" "}
            antes de ser enviados, garantizando que lleguen en perfectas
            condiciones.
          </p>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-3">
              Solo se aceptarán devoluciones o cambios en los siguientes casos:
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>
                  El producto presenta defectos de fabricación o daños de origen
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>
                  El cliente recibe un producto distinto al solicitado
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              📝 Procedimiento de reclamo
            </h4>
            <p className="text-gray-700 mb-3">
              El cliente deberá comunicarse dentro de las{" "}
              <span className="font-semibold text-red-600">
                48 horas hábiles
              </span>{" "}
              posteriores a la recepción del pedido al correo{" "}
              <a
                href="mailto:motef.tech.ar@gmail.com"
                className="text-blue-600 hover:underline font-semibold"
              >
                motef.tech.ar@gmail.com
              </a>
              , adjuntando:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>Fotos del producto</li>
              <li>Número de pedido</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Luego de la evaluación, se coordinará la devolución o reemplazo{" "}
            <span className="font-semibold">sin costo adicional</span>.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2">❌ Importante</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  No se aceptan devoluciones por motivos de gusto,
                  incompatibilidad o mal uso del producto
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  Si el reclamo se realiza luego de las 48 horas establecidas,
                  el reclamo no será validado
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "reembolsos",
      icon: <DollarSign className="w-6 h-6" />,
      title: "Política de Reembolsos",
      color: "from-indigo-500 to-indigo-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            En caso de que un producto presente defectos y no sea posible
            reemplazarlo,{" "}
            <span className="font-semibold">motef Tech ARG</span> procederá al{" "}
            <span className="font-semibold">reembolso total</span> del monto
            abonado, utilizando el mismo medio de pago empleado por el cliente.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-gray-900 mb-2">
              ⏳ Tiempo de procesamiento
            </h4>
            <p className="text-gray-700">
              El proceso de reembolso podrá demorar entre{" "}
              <span className="font-semibold">5 y 10 días hábiles</span>, según
              los tiempos administrativos de Mercado Libre o la entidad
              correspondiente.
            </p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-gray-700">
              <span className="font-semibold">No se realizarán reembolsos</span>{" "}
              por productos sin fallas o fuera del plazo establecido para
              reclamos.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "contacto",
      icon: <Mail className="w-6 h-6" />,
      title: "Contacto",
      color: "from-pink-500 to-pink-600",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed mb-6">
            Para cualquier consulta, reclamo o solicitud relacionada con
            nuestras políticas, podés contactarnos a través de:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg">Email</h4>
              </div>
              <a
                href="mailto:motef.tech.ar@gmail.com"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline break-all"
              >
                motef.tech.ar@gmail.com
              </a>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  Teléfono
                </h4>
              </div>
              <a
                href="https://wa.me/5491168896621"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
              >
                +54 9 11-6889-6621
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-gray-900 text-lg">
                Horario de atención
              </h4>
            </div>
            <p className="text-gray-700">
              <span className="font-semibold">Lunes a Viernes</span> de 10:00 a
              18:00 hs
            </p>
            <p className="text-gray-600 text-sm mt-1">
              (excepto feriados nacionales)
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Políticas Legales
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu tranquilidad es nuestra prioridad. Conocé nuestras políticas y
            términos de servicio.
          </p>
        </div>

        {/* Políticas */}
        <div className="space-y-8">
          {policies.map((policy) => (
            <div
              key={policy.id}
              ref={addToRefs}
              id={policy.id}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 scroll-mt-32"
            >
              {/* Header de la política */}
              <div
                className={`bg-gradient-to-r ${policy.color} p-6 flex items-center gap-4`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {policy.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {policy.title}
                </h2>
              </div>

              {/* Contenido de la política */}
              <div className="p-6 md:p-8">{policy.content}</div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 md:p-10 text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Tenés alguna duda?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nuestro equipo está disponible para ayudarte con cualquier consulta
            sobre nuestras políticas o productos.
          </p>
          <a
            href="https://wa.me/5491168896621?text=Hola! Tengo una consulta sobre las políticas de motef"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Phone className="w-5 h-5" />
            Contactanos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default PoliticasLegales;
