"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface Props {
  imagenes: string[];
  nombre: string;
}

const ProductGallery = ({ imagenes: rawImagenes, nombre }: Props) => {
  // Guardas básicas
  const fallback = ["/img/placeholder-product.png"];
  const imagenes = (
    rawImagenes?.filter(Boolean)?.length ? rawImagenes : fallback
  ).map(String);

  const [imagenActual, setImagenActual] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const siguiente = useCallback(
    () => setImagenActual((prev) => (prev + 1) % imagenes.length),
    [imagenes.length]
  );
  const anterior = useCallback(
    () =>
      setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length),
    [imagenes.length]
  );

  // Navegación por teclado en lightbox
  useEffect(() => {
    if (!showLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "Escape") setShowLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLightbox, siguiente, anterior]);

  return (
    <>
      {/* Galería principal */}
      <div className="space-y-4">
        {/* Imagen principal */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
          <Image
            src={imagenes[imagenActual]}
            alt={`${nombre} - Imagen ${imagenActual + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={imagenActual === 0}
          />

          {/* Botones navegación */}
          {imagenes.length > 1 && (
            <>
              <button
                onClick={anterior}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={20} className="text-gray-900" />
              </button>

              <button
                onClick={siguiente}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={20} className="text-gray-900" />
              </button>
            </>
          )}

          {/* Botón zoom */}
          <button
            onClick={() => setShowLightbox(true)}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Ver en pantalla completa"
          >
            <Maximize2 size={18} className="text-gray-900" />
          </button>

          {/* Indicador */}
          {imagenes.length > 1 && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-full">
              {imagenActual + 1} / {imagenes.length}
            </div>
          )}
        </div>

        {/* Miniaturas: carrusel horizontal con snap */}
        {imagenes.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {imagenes.map((imagen, index) => (
              <button
                key={index}
                onClick={() => setImagenActual(index)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all snap-start
                  ${
                    index === imagenActual
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
                style={{ minWidth: 80, width: 80, height: 80 }}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <Image
                  src={imagen}
                  alt={`${nombre} - Miniatura ${index + 1}`}
                  fill
                  className="object-contain bg-white"
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Cerrar */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Cerrar"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Navegación lightbox */}
          {imagenes.length > 1 && (
            <>
              <button
                onClick={anterior}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>

              <button
                onClick={siguiente}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}

          {/* Imagen grande */}
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto">
            <Image
              src={imagenes[imagenActual]}
              alt={`${nombre} - Vista ampliada ${imagenActual + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Contador */}
          {imagenes.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full">
              {imagenActual + 1} / {imagenes.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductGallery;
