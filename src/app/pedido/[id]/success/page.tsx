"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";

interface Pedido {
  id: number;
  numero_pedido: string;
  total: number;
  estado: string;
}

export default function PedidoSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await fetch(`/api/pedidos/${params.id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/cuenta/pedidos");
          return;
        }

        const data = await res.json();
        setPedido(data);
      } catch (error) {
        console.error("Error:", error);
        router.push("/cuenta/pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de éxito */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={48} className="text-white" />
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tu pedido ha sido confirmado y lo estamos preparando para el envío
        </p>

        {/* Información del pedido */}
        {pedido && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
                <p className="font-bold text-gray-900">
                  {pedido.numero_pedido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total pagado</p>
                <p className="font-bold text-green-600 text-xl">
                  ${pedido.total.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Próximos pasos */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
            <Package size={20} />
            Próximos Pasos
          </h3>
          <ul className="text-sm text-blue-800 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>
                Te enviamos un email de confirmación con los detalles de tu
                compra
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Preparamos tu pedido y lo enviamos en 24-48hs hábiles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cuenta/pedidos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Package size={20} />
            Ver mis pedidos
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home size={20} />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
