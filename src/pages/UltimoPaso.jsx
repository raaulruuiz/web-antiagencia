import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function UltimoPaso() {
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
          AÚN NO ESTÁS EN LA LISTA
        </h1>

        {/* Texto principal */}
        <p className="font-body text-gray-600 text-base md:text-lg text-center max-w-xl leading-relaxed mb-10">
          Te acaba de llegar a tu mail un correo donde podrás confirmar tu correo para recibir el ebook de 16 páginas donde te cuento como mi sobrino de 3 años te enseña a vender más con tu tienda online.
          <br /><br />
          Puede que esté en spam o en la bandeja de notificaciones, en ese caso añade la dirección raul@antiagencia.es a tu lista de contactos.
        </p>

        {/* Subtítulo */}
        <h2 className="font-headline font-bold text-gray-900 text-xl md:text-2xl text-center tracking-widest mb-6">
          MUY IMPORTANTE
        </h2>

        {/* Texto regalo secreto */}
        <p className="font-body text-gray-600 text-base md:text-lg text-center max-w-xl leading-relaxed mb-10">
          Una vez confirmes tu suscripción se abrirá una nueva página (no la cierres) donde tendrás acceso al ebook
        </p>

        {/* Botones de confirmación */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-6">
          <a
            href="https://mail.google.com/mail/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center font-headline font-bold text-white bg-[#EA4335] hover:bg-[#c5362a] transition-colors text-sm md:text-base px-6 py-4 rounded-lg tracking-widest"
          >
            Confirmar registro en Gmail
          </a>
          <a
            href="https://outlook.live.com/mail/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center font-headline font-bold text-white bg-[#0078D4] hover:bg-[#005fa3] transition-colors text-sm md:text-base px-6 py-4 rounded-lg tracking-widest"
          >
            Confirmar registro en Outlook
          </a>
        </div>

        {/* Texto bajo los botones */}
        <p className="font-body text-gray-400 text-sm text-center max-w-md leading-relaxed">
          Si el mail que has puesto no es ninguno de estos dos, no pasa nada. El proceso es el mismo.
        </p>

      </div>

      <FooterMinimal />
    </div>
  );
}
