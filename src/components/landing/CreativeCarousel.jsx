import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  { type: "image", src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/1c5a59a79_freepik__qutame-la-barra-lateral-izquierda-negra__8754.jpg", aspect: "9:16" },
  { type: "video", mediaId: "vznbn3i524", aspect: "9:16" },
  { type: "image", src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/d2cb955d2_elarmariodetuhermana-5.png", aspect: "9:16" },
  { type: "video", mediaId: "all2lrk3fr", aspect: "9:16" },
  { type: "image", src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/0b01b9426_freepik__contexto-roleres-un-editor-creativo-especializado-__20058.png", aspect: "1:1" },
  { type: "video", mediaId: "xszqjjlzzz", aspect: "9:16" },
  { type: "image", src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/5d471c27c_freepik__qutale-las-uas-pintadas-a-la-imagen-y-djalas-natur__20048.png", aspect: "1:1" },
  { type: "video", mediaId: "ekhwn3lku2", aspect: "1:1" },
  { type: "image", src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/3271260bf_freepik__recrame-la-misma-imagen-con-formato-916__28813.png", aspect: "9:16" },
  { type: "video", mediaId: "7vbne10byj", aspect: "9:16" },
  { type: "image", src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/b6cc57beb_freepik__recrame-la-misma-imagen-con-formato-916__28815.png", aspect: "9:16" },
];

function WistiaEmbed({ mediaId }) {
  useEffect(() => {
    if (!document.querySelector('script[src="https://fast.wistia.com/player.js"]')) {
      const s = document.createElement("script");
      s.src = "https://fast.wistia.com/player.js";
      s.async = true;
      document.head.appendChild(s);
    }
    const embedScript = document.createElement("script");
    embedScript.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    embedScript.async = true;
    embedScript.type = "module";
    document.head.appendChild(embedScript);
    return () => { embedScript.remove(); };
  }, [mediaId]);

  return (
    <div className="w-full h-full">
      <wistia-player
        media-id={mediaId}
        playbar="false"
        controls-visible-on-load="false"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

function CarouselItemDesktop({ item }) {
  const [hovered, setHovered] = useState(false);
  const is916 = item.aspect === "9:16";
  const collapsedW = 160;
  const expandedW = is916 ? 290 : 380;
  const paddingExpanded = is916 ? "177.78%" : "100%";

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer"
      style={{
        width: hovered ? expandedW : collapsedW,
        transition: "width 0.4s ease",
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-full overflow-hidden rounded-xl shadow-lg"
        style={{
          paddingTop: hovered ? paddingExpanded : "177.78%",
          position: "relative",
          transition: "padding-top 0.4s ease",
        }}
      >
        <div className="absolute inset-0">
          {item.type === "image" ? (
            <img src={item.src} alt="Creative" className="w-full h-full object-cover" />
          ) : (
            <WistiaEmbed mediaId={item.mediaId} />
          )}
        </div>
      </div>
    </div>
  );
}

function CarouselItemMobile({ item, isCenter }) {
  const is916 = item.aspect === "9:16";
  const centerPadding = is916 ? "177.78%" : "100%";

  return (
    <div
      className="flex-shrink-0"
      style={{ width: isCenter ? "60vw" : "28vw", transition: "width 0.3s ease" }}
    >
      <div
        className="w-full overflow-hidden rounded-xl shadow-lg"
        style={{
          paddingTop: isCenter ? centerPadding : "177.78%",
          position: "relative",
          transition: "padding-top 0.3s ease",
        }}
      >
        <div className="absolute inset-0">
          {item.type === "image" ? (
            <img src={item.src} alt="Creative" className="w-full h-full object-cover" />
          ) : (
            <WistiaEmbed mediaId={item.mediaId} />
          )}
        </div>
      </div>
    </div>
  );
}

function CarouselTrack({ scrollRef, isMobile, centerIndex, handleScroll }) {
  return (
    <div
      ref={scrollRef}
      className={`flex gap-3 overflow-x-auto items-center ${isMobile ? "snap-x snap-mandatory px-[20vw]" : "px-16"}`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onScroll={isMobile ? handleScroll : undefined}
    >
      {items.map((item, i) =>
        isMobile ? (
          <div key={i} className="snap-center flex-shrink-0">
            <CarouselItemMobile item={item} isCenter={i === centerIndex} />
          </div>
        ) : (
          <CarouselItemDesktop key={i} item={item} />
        )
      )}
    </div>
  );
}

function CarouselSection({ isMobile }) {
  const scrollRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    let closest = 0, minDist = Infinity;
    children.forEach((child, i) => {
      const rect = child.getBoundingClientRect();
      const parentRect = el.getBoundingClientRect();
      const dist = Math.abs((rect.left + rect.right) / 2 - (parentRect.left + parentRect.right) / 2);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setCenterIndex(closest);
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#0067FD] text-white rounded-full transition-colors ${isMobile ? "p-1.5" : "p-2"}`}
      >
        <ChevronLeft size={isMobile ? 20 : 28} />
      </button>
      <CarouselTrack scrollRef={scrollRef} isMobile={isMobile} centerIndex={centerIndex} handleScroll={handleScroll} />
      <button
        onClick={() => scroll(1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#0067FD] text-white rounded-full transition-colors ${isMobile ? "p-1.5" : "p-2"}`}
      >
        <ChevronRight size={isMobile ? 20 : 28} />
      </button>
    </div>
  );
}

export default function CreativeCarousel() {
  return (
    <div className="bg-[#121212] pb-12 pt-0 md:py-12 select-none" style={{ marginTop: 0 }}>
      <div className="hidden md:block">
        <CarouselSection isMobile={false} />
      </div>
      <div className="md:hidden">
        <CarouselSection isMobile={true} />
      </div>
      <style>{`
        wistia-player { --wistia-playbar-display: none; --wistia-controls-display: none; }
      `}</style>
    </div>
  );
}
