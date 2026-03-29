import React, { useState, useEffect } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

function AnnouncementBar() {
  const text = "Para tiendas online que facturan +5.000€/mes y ya invierten en publicidad";
  const repeated = Array(8).fill(text).join("   ·   ");

  return (
    <div className="bg-[#7000FF] overflow-hidden py-2.5">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          white-space: nowrap;
          animation: marquee 5s linear infinite;
        }
        @media (min-width: 768px) {
          .marquee-track {
            animation-duration: 20s;
          }
        }
      `}</style>
      <div className="marquee-track">
        <span className="font-headline text-white text-xs tracking-widest uppercase px-4">{repeated}</span>
        <span className="font-headline text-white text-xs tracking-widest uppercase px-4">{repeated}</span>
      </div>
    </div>
  );
}

function CalendlyPopup({ onClose }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl relative"
        style={{ height: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[#121212] text-2xl font-bold hover:text-[#0055FF] z-10"
        >
          ×
        </button>
        <div
          className="calendly-inline-widget w-full h-full"
          data-url="https://calendly.com/raul-antiagencia/1h"
        />
      </div>
    </div>
  );
}

const bullets = [
  { text: "Dedicando", highlight: "MENOS TIEMPO", rest: " del que ya le dedicas." },
  { text: "Sin contratar", highlight: "EQUIPO CREATIVO", rest: " extra para hacerte el trabajo." },
  { text: "Sin aumentar tus", highlight: "COSTES FIJOS", rest: " mensuales." },
];

export default function ComoTrabajamos() {
  const [showCalendly, setShowCalendly] = useState(false);

  useEffect(() => {
    const s1 = document.createElement("script");
    s1.src = "https://fast.wistia.com/player.js";
    s1.async = true;
    document.body.appendChild(s1);

    const s2 = document.createElement("script");
    s2.src = "https://fast.wistia.com/embed/l9q38afs0c.js";
    s2.async = true;
    s2.type = "module";
    document.body.appendChild(s2);

    return () => {
      document.body.removeChild(s1);
      document.body.removeChild(s2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Barra de anuncio */}
      <AnnouncementBar />

      <div className="flex-1 flex flex-col items-center px-4 pt-16 pb-16">

        {/* Logo */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/6130113b7_AALogo.png"
          alt="AntiAgencia"
          className="h-10 md:h-16 w-auto mb-4 md:mb-10"
        />

        {/* Título */}
        <h1 className="font-headline font-bold text-white text-lg md:text-4xl text-center max-w-3xl leading-tight mb-4">
          Caso de estudio de 3 minutos: Cómo invertimos +20.000€/mes en Meta Ads y lo convertimos en +100.000€/mes para nuestros clientes
        </h1>

        {/* Subtítulo */}
        <p className="font-headline font-bold text-[#0055FF] text-sm md:text-2xl text-center mb-10">
          Y cómo lo implementaremos GRATIS en tu tienda
        </p>

        {/* Vídeo Wistia */}
        <div className="w-full max-w-3xl mb-10">
          <style>{`
            wistia-player[media-id='l9q38afs0c']:not(:defined){background:center/contain no-repeat url('https://fast.wistia.com/embed/medias/l9q38afs0c/swatch');display:block;filter:blur(5px);padding-top:56.25%;}
            wistia-player[media-id='l9q38afs0c'] .w-logo { display: none !important; }
            wistia-player[media-id='l9q38afs0c'] .w-bpb-wrapper { display: none !important; }
          `}</style>
          <wistia-player media-id="l9q38afs0c" aspect="1.7777777777777777" playbar="false" fullscreen-button="true" volume-control="true" settings-control="false" playback-rate-control="false" wistia-logo="false" />
        </div>

        {/* Botón CTA */}
        <button
          onClick={() => setShowCalendly(true)}
          className="font-headline font-bold text-white bg-[#0055FF] hover:bg-[#7000FF] transition-colors text-base md:text-lg px-10 py-4 rounded-full tracking-widest mb-14"
        >
          AGENDAR LLAMADA
        </button>

        {/* Bullet points */}
        <div className="flex flex-col gap-5 w-full max-w-2xl">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#7000FF]/20 border border-[#7000FF] flex items-center justify-center">
                <span className="text-[#7000FF] text-xs font-bold">✓</span>
              </span>
              <p className="font-body text-white/80 text-base md:text-lg leading-snug">
                {b.text}{" "}
                <span className="font-bold text-[#7000FF]">{b.highlight}</span>
                {b.rest}
              </p>
            </div>
          ))}
        </div>

      </div>

      <FooterMinimal />

      {showCalendly && <CalendlyPopup onClose={() => setShowCalendly(false)} />}
    </div>
  );
}
