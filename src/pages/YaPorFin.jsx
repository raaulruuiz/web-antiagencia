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
          <p className="mb-6">Tenle paciencia al sistema, puede tardar un poco en mandarte el mail. Si ves que no te llega, revisa spam o notificaciones y si sigue sin llegarte, escríbeme a raul arroba antiagencia.es y le echo un ojo.</p>
          <p className="mb-6">Mientras tanto, puedes leerlo aquí:</p>
        </div>

        {/* PDF embed — desktop */}
        <div className="hidden md:block w-full max-w-3xl mb-10">
          <iframe
            src="/ebook-sobrino.pdf"
            className="w-full rounded-lg shadow-lg"
            style={{ height: "80vh", minHeight: "600px" }}
            title="Ebook sobrino 3 años"
          />
        </div>

        {/* PDF — móvil: botón de apertura directa */}
        <div className="md:hidden w-full max-w-sm mb-10 flex flex-col items-center gap-4">
          <a
            href="/ebook-sobrino.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center font-bold py-4 px-8 rounded-full text-lg tracking-wide text-white transition-colors duration-200"
            style={{ backgroundColor: '#7000FF' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0067FD'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7000FF'}
          >
            Leer el ebook
          </a>
          <a
            href="/ebook-sobrino.pdf"
            download
            className="w-full text-center font-bold py-4 px-8 rounded-full text-lg tracking-wide transition-colors duration-200"
            style={{ border: '2px solid #7000FF', color: '#7000FF' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0067FD'; e.currentTarget.style.color = '#0067FD'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#7000FF'; e.currentTarget.style.color = '#7000FF'; }}
          >
            Descargar PDF
          </a>
        </div>

      </div>

      <FooterMinimal />
    </div>
  );
}
