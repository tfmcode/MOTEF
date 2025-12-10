"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCarrito } from "@/context/CarritoContext";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

interface CheckoutForm {
  nombre_contacto: string;
  telefono_contacto: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  referencias?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, costoEnvio, total, vaciarCarrito } = useCarrito();

  const [form, setForm] = useState<CheckoutForm>({
    nombre_contacto: "",
    telefono_contacto: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    referencias: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirigir si no hay items en el carrito
  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.push("/carrito");
    }
  }, [items.length, authLoading, router]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout`);
    }
  }, [user, authLoading, router]);

  // Pre-llenar con datos del usuario
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        nombre_contacto: user.nombre
          ? `${user.nombre} ${user.apellido || ""}`.trim()
          : "",
        telefono_contacto: user.telefono || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.nombre_contacto.trim()) {
      setError("El nombre de contacto es obligatorio");
      return false;
    }
    if (!form.telefono_contacto.trim()) {
      setError("El teléfono es obligatorio");
      return false;
    }
    if (!form.direccion.trim()) {
      setError("La dirección es obligatoria");
      return false;
    }
    if (!form.ciudad.trim()) {
      setError("La ciudad es obligatoria");
      return false;
    }
    if (!form.provincia.trim()) {
      setError("La provincia es obligatoria");
      return false;
    }
    if (!form.codigo_postal.trim()) {
      setError("El código postal es obligatorio");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      console.log("🛒 Iniciando proceso de checkout...");

      // Crear pedido y preferencia de MP
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: items.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
          direccion: form,
          metodo_pago: "mercadopago", // Siempre Mercado Pago
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear el pedido");
      }

      const data = await response.json();
      console.log("✅ Respuesta del servidor:", data);

      // Verificar que tengamos el init_point
      if (!data.init_point) {
        console.error("❌ No se recibió init_point:", data);
        throw new Error("No se pudo generar el link de pago de Mercado Pago");
      }

      console.log("🔗 Redirigiendo a Mercado Pago:", data.init_point);

      // Vaciar carrito antes de redirigir
      vaciarCarrito();

      // Redirigir a Mercado Pago
      window.location.href = data.init_point;
    } catch (err) {
      console.error("❌ Error en checkout:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar el pedido. Por favor, intentá nuevamente."
      );
      setLoading(false);
    }
  };

  if (authLoading || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const inputStyles =
    "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Lock size={28} className="text-blue-600" />
            Finalizar Compra
          </h1>
          <p className="text-gray-600 mt-2">
            Completá tus datos para finalizar la compra de forma segura
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Datos de contacto */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Datos de Contacto
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre_contacto"
                      value={form.nombre_contacto}
                      onChange={handleChange}
                      className={inputStyles}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono_contacto"
                      value={form.telefono_contacto}
                      onChange={handleChange}
                      className={inputStyles}
                      placeholder="11 1234-5678"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck size={20} className="text-green-600" />
                  Dirección de Envío
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección completa *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      className={inputStyles}
                      placeholder="Av. Corrientes 1234, Piso 5, Dto A"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={form.ciudad}
                        onChange={handleChange}
                        className={inputStyles}
                        placeholder="CABA"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia *
                      </label>
                      <input
                        type="text"
                        name="provincia"
                        value={form.provincia}
                        onChange={handleChange}
                        className={inputStyles}
                        placeholder="Buenos Aires"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="codigo_postal"
                        value={form.codigo_postal}
                        onChange={handleChange}
                        className={inputStyles}
                        placeholder="1234"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencias (opcional)
                    </label>
                    <textarea
                      name="referencias"
                      value={form.referencias}
                      onChange={handleChange}
                      className={`${inputStyles} resize-none`}
                      rows={3}
                      placeholder="Ej: Timbre 5A, portero eléctrico"
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago - Solo Mercado Pago */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-600" />
                  Método de Pago
                </h2>

                <div className="p-4 border-2 border-blue-600 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        Mercado Pago
                      </div>
                      <div className="text-sm text-gray-600">
                        Tarjetas de crédito/débito, efectivo, más cuotas sin
                        interés
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                  <Lock size={12} className="text-green-600" />
                  <span>Pago 100% seguro procesado por Mercado Pago</span>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Resumen
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.producto.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.producto.nombre} x{item.cantidad}
                      </span>
                      <span className="font-medium text-gray-900">
                        $
                        {(item.producto.precio * item.cantidad).toLocaleString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        ${subtotal.toLocaleString("es-AR")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-medium text-gray-900">
                        {costoEnvio === 0 ? (
                          <span className="text-green-600 font-semibold">
                            GRATIS
                          </span>
                        ) : (
                          `$${costoEnvio.toLocaleString("es-AR")}`
                        )}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${total.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg transition-all ${
                    loading
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-blue-700 hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Pagar con Mercado Pago
                    </>
                  )}
                </button>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Lock size={12} className="text-green-600" />
                    <span>Compra 100% segura y protegida</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
