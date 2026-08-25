import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PodcastLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <header className="px-4 md:px-36 py-5 flex items-center justify-between w-full gap-4">
        <Link to="/" style={{ color: "#0067FD" }} className="text-lg font-bold leading-snug line-clamp-2 flex-1 min-w-0">
          Raúl Ruiz — Antiagencia
        </Link>
        <Link
          to="/podcasts"
          className="text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0"
          style={{ color: "#7000FF" }}
        >
          Podcasts de Raúl Ruiz
        </Link>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>

      {/* Logo centrado */}
      <div className="flex justify-center py-8">
        <img
          src="/images/82b3b8d5c_freepik__background__33914.png"
          alt="Antiagencia"
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Footer mínimo */}
      <footer className="bg-[#0a0a0a] text-white py-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/40 mb-4">
          <Link to={createPageUrl("PoliticaPrivacidad")} className="hover:text-white transition-colors">Privacidad</Link>
          <Link to={createPageUrl("AvisoLegal")} className="hover:text-white transition-colors">Aviso Legal</Link>
          <Link to={createPageUrl("PoliticaCookies")} className="hover:text-white transition-colors">Política de Cookies</Link>
          <a href="mailto:raul@antiagencia.es" className="hover:text-white transition-colors">raul@antiagencia.es</a>
        </div>
        <p className="text-white/25 text-xs tracking-widest text-center">
          ANTIAGENCIA | Copyright 2026 ©
        </p>
      </footer>
    </div>
  );
}
