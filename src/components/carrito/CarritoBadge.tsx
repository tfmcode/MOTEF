"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCarrito } from "@/context/CarritoContext";

export default function CarritoBadge() {
  const { totalItems } = useCarrito();

  return (
    <Link
      href="/carrito"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={`Carrito (${totalItems} productos)`}
    >
      <ShoppingCart size={20} className="text-gray-700" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
