"use client";

import { Truck, Shield, DollarSign } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function FeatureCard({
  icon: Icon,
  title,
  description,
  bgColor,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="text-center group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-motef-primary transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl h-full">
      <div className={`w-20 h-20 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float`}>
        <Icon className={`w-10 h-10 ${iconColor}`} strokeWidth={2} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-motef-primary transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default function WhyChooseUs() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-16 sm:py-24 bg-white" ref={elementRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <span className="text-sm font-bold text-motef-primary uppercase tracking-widest mb-2 inline-block">
            Nuestras Ventajas
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            ¿Por qué elegir MOTEF?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trabajamos para brindarte la mejor experiencia de compra con servicios de calidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            <FeatureCard
              icon={Truck}
              title="Envíos Súper Rápidos"
              description="Despachamos tu pedido en 24hs. Recibí en la comodidad de tu hogar con seguimiento en tiempo real."
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
          </div>

          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <FeatureCard
              icon={Shield}
              title="Compra 100% Segura"
              description="Pago protegido por Mercado Pago y tus datos resguardados con encriptación de última generación."
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
          </div>

          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <FeatureCard
              icon={DollarSign}
              title="Precios de Fábrica"
              description="Sin intermediarios. Calidad premium al mejor precio garantizado del mercado argentino."
              bgColor="bg-orange-100"
              iconColor="text-motef-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
