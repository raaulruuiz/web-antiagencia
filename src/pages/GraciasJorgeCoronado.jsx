import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function GraciasJorgeCoronado() {
  const pdfUrl = "/colectivo-minoritario.pdf";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-4xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

          {/* Título */}
          <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-4">
            Aquí tienes el ebook
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-600 text-base md:text-lg text-center leading-relaxed mb-8">
            También te llegará por email. Si no te llega puede estar en promociones o Spam, revisa ahí también.
          </p>

          {/* PDF embed — desktop */}
          <div className="hidden md:block w-full rounded overflow-hidden shadow" style={{ height: "80vh" }}>
            <iframe
              src={pdfUrl}
              title="COLECTIVO MINORITARIO"
              className="w-full h-full"
              style={{ border: "none" }}
            />
          </div>

          {/* PDF link — mobile */}
          <div className="md:hidden flex flex-col items-center gap-4">
            <div className="border border-gray-200 rounded p-6 w-full text-center">
              <p className="text-gray-600 text-sm mb-5">
                Pulsa el botón para abrir el ebook en tu dispositivo.
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#7000FF] hover:bg-[#0067FD] transition-colors text-white font-bold text-base px-8 py-3 rounded"
              >
                Abrir ebook
              </a>
            </div>
          </div>

            </div>
          </div>
        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
