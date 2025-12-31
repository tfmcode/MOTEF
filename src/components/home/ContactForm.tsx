"use client";

import { useState } from "react";
import { Mail, User, MessageSquare, Send, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ContactForm() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ nombre: "", email: "", mensaje: "" });
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 5000);
      }
    } catch (error) {
      console.error("Error al enviar consulta:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-orange-50/30 relative overflow-hidden" ref={elementRef}>
      {/* Elementos decorativos animados */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-motef-primary/5 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-300/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Lado izquierdo - Información */}
          <div className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
          }`}>
            <span className="text-sm font-bold text-motef-primary uppercase tracking-widest mb-2 inline-block">
              Contacto
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              ¿Tenés alguna consulta?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Estamos acá para ayudarte. Envianos tu consulta y te responderemos a la brevedad.
              Nuestro equipo está disponible para asesorarte sobre productos, envíos y cualquier
              duda que tengas.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-motef-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <a
                    href="mailto:motef.tech.ar@gmail.com"
                    className="text-gray-600 hover:text-motef-primary transition-colors"
                  >
                    motef.tech.ar@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                  <a
                    href="tel:+5491168896621"
                    className="text-gray-600 hover:text-motef-primary transition-colors"
                  >
                    +54 9 11 6889-6621
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className={`bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-700 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Nombre */}
              <div className="group">
                <label htmlFor="nombre" className="block text-sm font-bold text-gray-900 mb-2 transition-colors group-focus-within:text-motef-primary">
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-motef-primary transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-motef-primary focus:ring-4 focus:ring-motef-primary/10 focus:outline-none transition-all duration-300 focus:shadow-lg hover:border-gray-300"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              {/* Campo Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2 transition-colors group-focus-within:text-motef-primary">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-motef-primary transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-motef-primary focus:ring-4 focus:ring-motef-primary/10 focus:outline-none transition-all duration-300 focus:shadow-lg hover:border-gray-300"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Campo Mensaje */}
              <div className="group">
                <label htmlFor="mensaje" className="block text-sm font-bold text-gray-900 mb-2 transition-colors group-focus-within:text-motef-primary">
                  Mensaje
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-4 pointer-events-none transition-all duration-300 group-focus-within:scale-110">
                    <MessageSquare className="w-5 h-5 text-gray-400 group-focus-within:text-motef-primary transition-colors duration-300" />
                  </div>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-motef-primary focus:ring-4 focus:ring-motef-primary/10 focus:outline-none transition-all duration-300 resize-none focus:shadow-lg hover:border-gray-300"
                    placeholder="Escribí tu consulta..."
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 hover:-translate-y-1 active:scale-95 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : submitStatus === "success"
                    ? "bg-green-600 hover:bg-green-700 hover:shadow-2xl"
                    : "bg-motef-primary hover:bg-orange-600 hover:shadow-2xl"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : submitStatus === "success" ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Enviado con éxito</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Consulta</span>
                  </>
                )}
              </button>

              {/* Mensajes de estado */}
              {submitStatus === "error" && (
                <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-4 rounded-xl border-2 border-red-200 animate-slide-in">
                  Hubo un error al enviar tu consulta. Por favor, intentá nuevamente.
                </div>
              )}
              {submitStatus === "success" && (
                <div className="text-green-700 text-sm text-center font-medium bg-green-50 p-4 rounded-xl border-2 border-green-200 animate-slide-in">
                  ¡Gracias por tu consulta! Te responderemos a la brevedad.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
