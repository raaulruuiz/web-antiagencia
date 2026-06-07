import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function GraciasJorgeCoronado() {
  const pdfUrl = "/colectivo-minoritario.pdf";

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 pt-10 md:pt-16 pb-16 w-full">
        <div className="max-w-4xl w-full">

          {/* Título */}
          <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight mb-4">
            Aquí tienes el ebook
          </h1>

          {/* Subtítulo */}
          <p className="font-body text-white/70 text-base md:text-lg text-center leading-relaxed mb-8">
            También te llegará por email. Si no te llega puede estar en promociones o Spam, revisa ahí también.
          </p>

          {/* PDF embed — desktop */}
          <div className="hidden md:block w-full rounded-xl overflow-hidden border border-white/10 shadow-lg" style={{ height: "80vh" }}>
            <iframe
              src={pdfUrl}
              title="COLECTIVO MINORITARIO"
              className="w-full h-full"
              style={{ border: "none" }}
            />
          </div>

          {/* PDF link — mobile */}
          <div className="md:hidden flex flex-col items-center gap-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full text-center">
              <p className="font-body text-white/70 text-sm mb-5">
                Pulsa el botón para abrir el ebook en tu dispositivo.
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#7000FF] hover:bg-[#0067FD] transition-colors text-white font-bold font-body text-base px-8 py-3 rounded-lg"
              >
                Abrir ebook
              </a>
            </div>
          </div>

        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
