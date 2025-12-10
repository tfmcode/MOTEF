"use client";

import { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { Producto } from "@/types";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";

interface Props {
  producto: Producto;
  variant?: "default" | "small" | "icon";
  showQuantity?: boolean;
}

export default function AgregarAlCarritoBtn({
  producto,
  variant = "default",
  showQuantity = false,
}: Props) {
  const { agregarProducto } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const handleAgregar = () => {
    if (producto.stock < cantidad) {
      alert(`Solo hay ${producto.stock} unidades disponibles`);
      return;
    }

    agregarProducto(producto, cantidad);
    setAgregado(true);

    // Resetear después de 2 segundos
    setTimeout(() => {
      setAgregado(false);
      setCantidad(1);
    }, 2000);
  };

  // Si no hay stock
  if (producto.stock === 0) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
      >
        Sin stock
      </button>
    );
  }

  // Variant: solo icono
  if (variant === "icon") {
    return (
      <button
        onClick={handleAgregar}
        disabled={agregado}
        className={`p-2 rounded-lg transition-all duration-200 ${
          agregado
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-110"
        }`}
        aria-label="Agregar al carrito"
      >
        {agregado ? <Check size={18} /> : <ShoppingCart size={18} />}
      </button>
    );
  }

  // Variant: small
  if (variant === "small") {
    return (
      <button
        onClick={handleAgregar}
        disabled={agregado}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          agregado
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {agregado ? (
          <>
            <Check size={16} />
            ¡Agregado!
          </>
        ) : (
          <>
            <ShoppingCart size={16} />
            Agregar
          </>
        )}
      </button>
    );
  }

  // Variant: default con selector de cantidad
  return (
    <div className="space-y-3">
      {showQuantity && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Cantidad:</span>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              disabled={cantidad <= 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-medium">{cantidad}</span>
            <button
              onClick={() =>
                setCantidad(Math.min(producto.stock, cantidad + 1))
              }
              disabled={cantidad >= producto.stock}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            ({producto.stock} disponibles)
          </span>
        </div>
      )}

      <button
        onClick={handleAgregar}
        disabled={agregado}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
          agregado
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
        }`}
      >
        {agregado ? (
          <>
            <Check size={20} />
            ¡Agregado al carrito!
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            Agregar al carrito
          </>
        )}
      </button>
    </div>
  );
}
