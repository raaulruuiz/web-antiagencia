import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/1a14eae26_1.jpg",
    sector: "SECTOR HOGAR",
    texto: "Impacto en la facturación mensual de meta ads",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/59c747f1c_2.jpg",
    sector: "SECTOR MODA",
    texto: "Crecimiento anual de tienda en woocommerce",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/046b6a166_3.jpg",
    sector: "SECTOR BISUTERÍA",
    texto: "Impacto del email marketing en la facturación mensual",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/5d15cfff8_4.jpg",
    sector: "SECTOR MODA",
    texto: "Crecimiento mensual del impacto de meta ads",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/cfa7966f1_5.jpg",
    sector: "SECTOR JOYERÍA",
    texto: "Crecimiento anual de tienda en shopify",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/e72630296_6.jpg",
    sector: "SECTOR HOGAR",
    texto: "Impacto del email marketing en la facturación mensual",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/71fc73e3a_7.jpg",
    sector: "SECTOR BELLEZA",
    texto: "Impacto en la facturación mensual de meta ads",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/5eecc381a_8.jpg",
    sector: "SECTOR RESTAURACIÓN",
    texto: "Crecimiento mensual de tienda en woocommerce",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/e91f544be_9.jpg",
    sector: "SECTOR CALZADO",
    texto: "Impacto del email marketing en la facturación mensual",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/0355afb57_10.jpg",
    sector: "SECTOR COMPLEMENTOS",
    texto: "Impacto en la facturación mensual de meta ads",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/ac2a85402_11.jpg",
    sector: "SECTOR DEPORTE",
    texto: "Crecimiento mensual de tienda en shopify",
  },
  {
    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/35fd9bd9e_12.jpg",
    sector: "SECTOR TECNOLOGÍA",
    texto: "Crecimiento anual de tienda en shopify",
  },
];

function Lightbox({ index, onClose, onPrev, onNext }) {
  const img = images[index];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-[#0067FD] transition-colors"
        >
          <X size={28} />
        </button>

        <img
          src={img.src}
          alt={img.sector}
          className="w-full h-auto block"
        />

        <div className="bg-[#121212] px-6 py-4 text-center">
          <p className="font-headline font-bold text-lg tracking-widest text-[#0067FD] mb-1">
            {img.sector}
          </p>
          <p className="font-body text-white text-sm">{img.texto}</p>
        </div>

        <p className="text-white/50 text-xs text-center mt-2">
          {index + 1} / {images.length}
        </p>

        <button
          onClick={onPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white hover:text-[#0067FD] transition-colors hidden md:block"
        >
          <ChevronLeft size={40} />
        </button>
        <button
          onClick={onNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white hover:text-[#0067FD] transition-colors hidden md:block"
        >
          <ChevronRight size={40} />
        </button>

        <div className="flex justify-between mt-3 md:hidden">
          <button onClick={onPrev} className="text-white p-2"><ChevronLeft size={32} /></button>
          <button onClick={onNext} className="text-white p-2"><ChevronRight size={32} /></button>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ src, sector, texto, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        border: hovered ? "4px solid transparent" : "4px solid #7000FF",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <img
        src={src}
        alt={sector}
        className="w-full h-auto block transition-all duration-500"
        style={{ filter: hovered ? "grayscale(100%)" : "none" }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 px-6 md:px-10 text-center"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity: hovered ? 1 : 0,
        }}
      >
        <span
          className="font-headline font-bold text-2xl tracking-widest mb-2"
          style={{ color: "#0067FD" }}
        >
          {sector}
        </span>
        <span className="font-body text-white text-base leading-snug">{texto}</span>
      </div>
    </div>
  );
}

export default function ImageGridSection() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(() => setLightboxIndex((i) => (i - 1 + images.length) % images.length), []);
  const next = useCallback(() => setLightboxIndex((i) => (i + 1) % images.length), []);

  return (
    <>
      <section id="resultados" className="bg-white py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/82b3b8d5c_freepik__background__33914.png"
              alt="Logo"
              className="w-20 mb-6"
            />
            <h2 className="font-headline font-bold text-3xl md:text-5xl text-[#121212]">
              HACEMOS QUE<br />LAS MARCAS CREZCAN
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <ImageCard key={i} {...img} onClick={() => openLightbox(i)} />
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
