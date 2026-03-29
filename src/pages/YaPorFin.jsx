import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function YaPorFin() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-16">

        {/* Logo */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/6130113b7_AALogo.png"
          alt="AntiAgencia"
          className="h-14 w-auto mb-10"
        />

        {/* Título */}
        <h1 className="font-headline font-bold text-white text-3xl md:text-5xl text-center tracking-widest mb-8">
          YA ESTÁS EN LA LISTA
        </h1>

        {/* Texto principal */}
        <div className="font-body text-white/70 text-base md:text-lg text-center max-w-xl leading-relaxed mb-10">
          <p className="mb-6">Ya por fin estás dentro de esta increíble lista. Ahora te llegará otro mail con los regalos.</p>
          <p className="mb-6">Aquí tienes tu regalo secreto:</p>

          <ul className="text-left space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0055FF] flex items-center justify-center text-white text-xs font-bold">✓</span>
              <a
                href="https://docs.google.com/document/d/1xJHqXnAIyR04FZAYzXF4oDBeOHLktN3dyEEBdXLMDvM/edit?tab=t.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0055FF] hover:text-[#7000FF] transition-colors underline underline-offset-2"
              >
                El paso a paso para escribir tus mails que aprendí de un calvo cabrón para no sonar como un SPAMMER desesperado que solo manda promociones y cada vez vende menos
              </a>
            </li>
          </ul>
        </div>

      </div>

      <FooterMinimal />
    </div>
  );
}
