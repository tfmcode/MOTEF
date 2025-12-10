"use client";

import React from "react";
import Image from "next/image";

const WhatsappFloating: React.FC = () => {
  const phone = "5491168896621";
  const message = "Hola! Quiero consultar sobre los productos de motef";

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Chatear por WhatsApp"
      aria-label="Abrir conversación por WhatsApp"
      className="fixed bottom-4 right-4 z-50"
    >
      <Image
        src="/WhatsApp.svg"
        alt="WhatsApp"
        width={75}
        height={75}
        className="hover:scale-105 transition-all drop-shadow-xl"
        priority
      />
    </a>
  );
};

export default WhatsappFloating;
