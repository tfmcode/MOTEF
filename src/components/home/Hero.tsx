"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Imágenes estáticas del directorio public/img/productos
  const slides = [
    {
      id: 1,
      nombre: "Productos de Calidad",
      imagen: "/img/productos/xr250.png",
      alt: "Producto destacado 1",
    },
    {
      id: 2,
      nombre: "Accesorios Premium",
      imagen: "/img/productos/heladera.png",
      alt: "Producto destacado 2",
    },
    {
      id: 3,
      nombre: "Repuestos Originales",
      imagen: "/img/productos/110.png",
      alt: "Producto destacado 3",
    },
    {
      id: 4,
      nombre: "Equipamiento Profesional",
      imagen: "/img/productos/bici.png",
      alt: "Producto destacado 4",
    },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  return (
    <section className="relative text-gray-900 overflow-hidden min-h-[850px] lg:min-h-[750px] flex items-center bg-gradient-to-br from-orange-50 via-white to-gray-50">
      {/* Decorative elements with animation */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-motef-primary/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Contenido izquierdo */}
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <div
              className={`inline-block bg-motef-primary text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Tienda Online
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              Accesorios y Repuestos{" "}
              <span className="text-motef-primary">de Calidad</span>
            </h1>

            <p
              className={`text-xl md:text-2xl mb-8 text-gray-700 font-light leading-relaxed transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              Para motocicletas, bicicletas, climatización y hogar.{" "}
              <span className="font-semibold text-motef-primary">
                ¡Todo en un solo lugar!
              </span>
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <Link
                href="/productos"
                className="group bg-motef-primary hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Ver Productos</span>
              </Link>

              <Link
                href="#categorias"
                className="group bg-white hover:bg-gray-50 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-motef-primary flex items-center justify-center gap-2"
              >
                <span>Ver Categorías</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div
              className={`flex flex-wrap gap-6 text-sm border-t border-gray-200 pt-6 justify-center lg:justify-start transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Envíos a todo el país</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Pago seguro</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-motef-primary rounded-full"></div>
                <span className="font-medium">Productos de calidad</span>
              </div>
            </div>
          </div>

          {/* Slider de productos destacados */}
          {slides.length > 0 && (
            <div className="flex justify-center items-center relative h-[450px] lg:h-[500px] mt-8 lg:mt-0 w-full">
              <div className="absolute inset-0 bg-motef-primary/10 blur-[100px] rounded-full"></div>

              <div className="relative w-full h-full">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentSlide
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 translate-x-8 scale-95"
                    } flex items-center justify-center`}
                  >
                    <Link
                      href="/productos"
                      className="relative hover:scale-105 transition-all duration-500 group w-[280px] h-[380px] sm:w-[350px] sm:h-[450px] lg:w-[400px] lg:h-[500px]"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={slide.imagen}
                          alt={slide.alt}
                          fill
                          sizes="(max-width: 640px) 280px, (max-width: 1024px) 350px, 400px"
                          className="object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl"
                        />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Indicadores */}
              {slides.length > 1 && (
                <div className="absolute -bottom-6 lg:-bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                        index === currentSlide
                          ? "bg-motef-primary w-8 shadow-lg"
                          : "bg-gray-300 w-4 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
