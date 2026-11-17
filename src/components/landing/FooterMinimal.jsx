import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ConfigurarCookies from "@/components/ConfigurarCookies";

const partnerLogos = [
  {
    src: "/images/2a57c54d9_1-320.webp",
    alt: "Shopify Partner",
  },
  {
    src: "/images/032d0e683_2-320.webp",
    alt: "Partner 2",
  },
  {
    src: "/images/45e269286_PRUEBASOCIAL-320.webp",
    alt: "Klaviyo Partner",
  },
];

export default function FooterMinimal() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* Divisor */}
      <div className="flex items-center gap-4 px-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#0067FD] to-[#7000FF]" />
        <div className="w-2 h-2 rounded-full bg-[#0067FD]" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#0067FD] to-[#7000FF]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center gap-8">

        {/* Logos partners */}
        <div className="flex flex-row items-center justify-center gap-8 flex-wrap">
          {partnerLogos.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              width={320}
              height={180}
              loading="lazy"
              decoding="async"
              className="h-8 w-auto object-contain opacity-80"
            />
          ))}
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/40">
          <Link to={createPageUrl("PoliticaPrivacidad")} className="hover:text-white transition-colors">Privacidad</Link>
          <Link to={createPageUrl("AvisoLegal")} className="hover:text-white transition-colors">Aviso Legal</Link>
          <Link to={createPageUrl("AvisoLegal")} className="hover:text-white transition-colors">Términos de Servicio</Link>
          <Link to={createPageUrl("PoliticaCookies")} className="hover:text-white transition-colors">Política de Cookies</Link>
          <ConfigurarCookies className="hover:text-white transition-colors" />
        </div>

        {/* Copyright */}
        <p className="text-white/25 text-xs font-headline tracking-widest text-center">
          ANTIAGENCIA | Copyright 2026 ©
        </p>

        {/* Disclaimer */}
        <p className="text-white/20 text-[10px] font-body text-center max-w-2xl leading-relaxed">
          AVISO: Los resultados nunca están garantizados. Los resultados de clientes que mostramos son ejemplos de lo que se ha conseguido en el pasado, no promesas de resultados futuros. Cada negocio es distinto y tus resultados dependerán de tu esfuerzo, tus circunstancias y el mercado.
          Esta web no está afiliada, patrocinada ni respaldada de ningún modo por YouTube, Google, Facebook ni Meta. FACEBOOK es una marca registrada de Meta Platforms, Inc. YOUTUBE es una marca registrada de Google LLC.
        </p>

      </div>
    </footer>
  );
}
