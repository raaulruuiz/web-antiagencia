import React from "react";
import { Helmet } from "react-helmet-async";

export default function AntiStudio() {
  return (
    <>
      <Helmet><title>Anti-Studio</title><meta name="robots" content="noindex" /></Helmet>
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 text-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Te han regalado una licencia de Anti-Studio</h1>
          <p className="text-white/70 text-lg">Lanza lo que tengas a una pizarra y conviértelo en un email con tu propia IA. Muy pronto podrás descargarla desde aquí.</p>
        </div>
      </div>
    </>
  );
}
