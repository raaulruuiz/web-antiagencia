import React, { useEffect } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function Contacto() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 pt-28 pb-12">

        {/* Logo */}
        <img
          src="/images/6130113b7_AALogo.png"
          alt="AntiAgencia"
          className="h-24 w-auto mb-8"
        />

        {/* Título */}
        <h1 className="font-headline font-bold text-white text-3xl md:text-5xl text-center mb-10">
          Agenda tu llamada estratégica
        </h1>

        {/* Calendly */}
        <div className="w-full max-w-3xl">
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/raul-antiagencia/1h"
            style={{ minWidth: "320px", height: "700px" }}
          />
        </div>
      </div>

      <FooterMinimal />
    </div>
  );
}
