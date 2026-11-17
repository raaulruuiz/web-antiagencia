import React, { useEffect, useState } from "react";
import { leerConsentimiento, EVENTO_ACEPTADAS } from "@/lib/consentimiento";

// Vídeo de YouTube o Wistia que no se carga (ni pide nada a sus servidores)
// hasta que el visitante acepta las cookies o pulsa «reproducir».
// Mientras tanto se ve un recuadro propio, sin miniatura de terceros.
// YouTube va siempre por youtube-nocookie.com.

const SCRIPTS_WISTIA = (id) => [
  { src: "https://fast.wistia.com/player.js" },
  { src: `https://fast.wistia.com/embed/${id}.js`, type: "module" },
];

function cargarScript({ src, type }) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  if (type) s.type = type;
  document.body.appendChild(s);
}

function Fachada({ titulo, servicio, onPlay, oscuro }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Reproducir vídeo: ${titulo}`}
      className={`group relative w-full h-full flex flex-col items-center justify-center gap-3 rounded px-4 text-center ${
        oscuro ? "bg-[#1a1a1a] border border-white/10" : "bg-[#121212]"
      }`}
      style={{ aspectRatio: "16/9" }}
    >
      <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0067FD] group-hover:bg-[#7000FF] transition-colors flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-9 md:h-9 ml-1" fill="#FFFFFF" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="text-white/60 text-xs md:text-sm max-w-md leading-snug">
        Al pulsar se carga el reproductor de {servicio}, que puede usar sus propias cookies.
      </span>
    </button>
  );
}

export default function VideoConsentido({ tipo, id, titulo, oscuro = false, wistiaAtributos = {} }) {
  const [activo, setActivo] = useState(() => leerConsentimiento() === "accepted");
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    if (activo) return;
    const alAceptar = () => setActivo(true);
    window.addEventListener(EVENTO_ACEPTADAS, alAceptar);
    return () => window.removeEventListener(EVENTO_ACEPTADAS, alAceptar);
  }, [activo]);

  useEffect(() => {
    if (activo && tipo === "wistia") SCRIPTS_WISTIA(id).forEach(cargarScript);
  }, [activo, tipo, id]);

  const reproducir = () => {
    setAutoplay(true);
    setActivo(true);
  };

  if (!activo) {
    return (
      <Fachada
        titulo={titulo}
        servicio={tipo === "wistia" ? "Wistia" : "YouTube"}
        onPlay={reproducir}
        oscuro={oscuro}
      />
    );
  }

  if (tipo === "youtube") {
    return (
      <div className="w-full overflow-hidden rounded" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}${autoplay ? "?autoplay=1" : ""}`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Wistia
  return (
    <wistia-player
      media-id={id}
      {...wistiaAtributos}
      {...(autoplay ? { autoplay: "true" } : {})}
    />
  );
}
