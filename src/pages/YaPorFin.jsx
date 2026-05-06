import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function YaPorFin() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-16">

        {/* Logo */}
        <img
          src="https://media.base44.com/images/public/697678eac9cf34e2aefb7d57/82b3b8d5c_freepik__background__33914.png"
          alt="AntiAgencia"
          className="h-14 w-auto mb-10"
        />

        {/* Título */}
        <h1 className="font-headline font-bold text-gray-900 text-3xl md:text-5xl text-center tracking-widest mb-8">
          YA ESTÁS EN LA LISTA
        </h1>

        {/* Texto principal */}
        <div className="font-body text-gray-600 text-base md:text-lg text-center max-w-xl leading-relaxed mb-10">
          <p className="mb-6">Ya por fin estás dentro de esta increíble lista. Ahora te llegará otro mail con el ebook para que lo tengas también por ahí.</p>
          <p className="mb-6">Mientras tanto, puedes leerlo aquí:</p>
        </div>

        {/* PDF embed */}
        <div className="w-full max-w-3xl mb-10">
          <iframe
            src="/ebook-sobrino.pdf"
            className="w-full rounded-lg shadow-lg"
            style={{ height: "80vh", minHeight: "600px" }}
            title="Ebook sobrino 3 años"
          />
        </div>

      </div>

      <FooterMinimal />
    </div>
  );
}
