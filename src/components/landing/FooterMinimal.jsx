import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const partnerLogos = [
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/2a57c54d9_1.png",
    alt: "Shopify Partner",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/032d0e683_2.png",
    alt: "Partner 2",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/45e269286_PRUEBASOCIAL.png",
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
              className="h-8 w-auto object-contain opacity-80"
            />
          ))}
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/40">
          <Link to={createPageUrl("PoliticaPrivacidad")} className="hover:text-white transition-colors">Privacidad</Link>
          <Link to={createPageUrl("AvisoLegal")} className="hover:text-white transition-colors">Aviso Legal</Link>
          <Link to={createPageUrl("PoliticaCookies")} className="hover:text-white transition-colors">Política de Cookies</Link>
        </div>

        {/* Copyright */}
        <p className="text-white/25 text-xs font-headline tracking-widest text-center">
          ANTIAGENCIA | Copyright 2026 ©
        </p>

        {/* Disclaimer */}
        <p className="text-white/20 text-[10px] font-body text-center max-w-2xl leading-relaxed">
          DISCLAIMER: Results are never guaranteed. Any client outcomes we share are provided as examples of what has been achieved in the past, not as promises of future performance. Every business is different, and your results will depend on your own effort, circumstances, and market conditions.
          This website is not affiliated with, sponsored by, or endorsed by YouTube, Google, Facebook, or Meta in any way. FACEBOOK is a registered trademark of FACEBOOK Inc. YOUTUBE is a registered trademark of GOOGLE Inc.
        </p>

      </div>
    </footer>
  );
}
