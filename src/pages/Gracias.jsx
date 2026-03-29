import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function Gracias() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 pt-16 pb-16 max-w-2xl mx-auto w-full">

        {/* Logo */}
        <img
          src="/images/6130113b7_AALogo.png"
          alt="AntiAgencia"
          className="h-12 md:h-16 w-auto mb-10"
        />

        {/* Título */}
        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight mb-8">
          ¡ENHORABUENA!{" "}
          <span className="text-[#0067FD]">Nos vemos dentro de nada</span>
        </h1>

        {/* Texto principal */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 mb-6 w-full">
          <p className="font-body text-white/85 text-base md:text-lg leading-relaxed text-center">
            En esta llamada mi objetivo será entender tu tienda, te haré preguntas relacionadas con los{" "}
            <span className="text-white font-semibold">productos, facturación, objetivos, márgenes, número de suscriptores en la base de datos</span>{" "}
            y otros datos importantes para poder entender lo mejor posible el punto en el que te encuentras, así que{" "}
            <span className="text-[#7000FF] font-bold">cuanta más exactitud me des, mejor te podré asesorar.</span>
          </p>
        </div>

        {/* Aviso importante */}
        <div className="bg-[#FF4400]/10 border border-[#FF4400]/40 rounded-2xl p-6 md:p-8 w-full">
          <div className="flex items-start gap-4">
            <span className="text-[#FF4400] text-2xl mt-0.5 flex-shrink-0">⚠️</span>
            <div>
              <p className="font-headline font-bold text-[#FF4400] text-sm uppercase tracking-widest mb-2">
                MUY IMPORTANTE
              </p>
              <p className="font-body text-white/80 text-sm md:text-base leading-relaxed">
                Valoro y respeto enormemente tu tiempo y el mío por lo que si por algún motivo no puedes asistir a la llamada, te agradezco que me lo comuniques escribiéndome a{" "}
                <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] underline hover:text-[#7000FF] transition-colors">
                  raul@antiagencia.es
                </a>{" "}
                o modificando el horario en el correo que te acaba de llegar.
              </p>
            </div>
          </div>
        </div>

      </div>

      <FooterMinimal />
    </div>
  );
}
