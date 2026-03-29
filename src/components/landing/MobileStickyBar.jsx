import React from "react";
import { Link } from "react-router-dom";

export default function MobileStickyBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#121212] px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-2 border-t border-white/10">
      <p className="font-headline text-white text-sm font-bold tracking-wider">
        ¿Listo para escalar?
      </p>
      <Link
        to="/Contacto"
        className="w-full text-center font-headline font-bold text-sm tracking-widest py-3 rounded-lg bg-[#0067FD] text-white hover:bg-[#7000FF] transition-colors duration-300"
      >
        Agenda tu llamada
      </Link>
      <Link
        to="/Newsletter"
        className="font-body text-white/50 text-xs hover:text-white transition-colors duration-200"
      >
        O empieza gratis aquí
      </Link>
    </div>
  );
}
