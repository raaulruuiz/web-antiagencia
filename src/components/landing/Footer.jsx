import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const partnerLogos = [
  {
    src: "/images/2a57c54d9_1.png",
    alt: "Shopify Partner",
  },
  {
    src: "/images/032d0e683_2.png",
    alt: "Partner 2",
  },
  {
    src: "/images/45e269286_PRUEBASOCIAL.png",
    alt: "Klaviyo Partner",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* Divisor */}
      <div className="flex items-center gap-4 px-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#0067FD] to-[#7000FF]" />
        <div className="w-2 h-2 rounded-full bg-[#0067FD]" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#0067FD] to-[#7000FF]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center gap-8">

        {/* CTA */}
        <div className="text-center">
          <p className="font-headline text-white/50 text-xs uppercase tracking-widest mb-2">¿Quieres escalar tu tienda?</p>
          <a
            href="mailto:raul@antiagencia.es"
            className="inline-block bg-[#0067FD] hover:bg-[#7000FF] transition-colors text-white font-headline font-bold text-sm px-6 py-3 rounded-full"
          >
            Habla con nosotros
          </a>
        </div>

        {/* Logos partners */}
        <div className="flex flex-row items-center justify-center gap-8 flex-wrap">
          {partnerLogos.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="h-8 w-auto object-contain opacity-80"
            />
          ))}
        </div>

        {/* Legal links + contacto */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/40">
          <Link to={createPageUrl("PoliticaPrivacidad")} className="hover:text-white transition-colors">Privacidad</Link>
          <Link to={createPageUrl("AvisoLegal")} className="hover:text-white transition-colors">Aviso Legal</Link>
          <Link to={createPageUrl("PoliticaCookies")} className="hover:text-white transition-colors">Política de Cookies</Link>
          <a href="mailto:raul@antiagencia.es" className="hover:text-white transition-colors">raul@antiagencia.es</a>
        </div>

        {/* Copyright */}
        <p className="text-white/25 text-xs font-headline tracking-widest text-center">
          ANTIAGENCIA | Copyright 2026 ©
        </p>

      </div>
    </footer>
  );
}
