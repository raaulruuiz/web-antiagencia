import React, { useEffect, useState } from "react";

export const rubik = { fontFamily: "'Rubik', sans-serif" };

export function useNovedades() {
  const [datos, setDatos] = useState({ novedades: [], enCurso: [], pendiente: [] });
  useEffect(() => {
    fetch("/anti-studio/novedades.json").then((r) => r.json()).then(setDatos).catch(() => {});
  }, []);
  return datos;
}

export const fecha = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

export function Hoja({ children }) {
  return <div className="bg-white shadow-xl rounded-sm px-6 md:px-12 py-12 mb-10" style={{ fontFamily: "'Georgia', serif" }}>{children}</div>;
}

export function Titulo({ children }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase mb-4" style={rubik}>{children}</h2>;
}

export function Boton({ href, children, secundario }) {
  const color = secundario ? "bg-white text-gray-900 border border-gray-900 hover:bg-gray-100" : "bg-[#7000FF] text-white hover:bg-[#0067FD]";
  return <a href={href} className={`inline-block px-6 py-3 rounded-sm font-bold transition-colors ${color}`} style={rubik}>{children}</a>;
}

export function Novedad({ n }) {
  return (
    <article className="py-5 border-b border-gray-200 last:border-0">
      <p className="text-sm text-gray-500 mb-1">{fecha(n.fecha)}</p>
      <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>{n.titulo}</h3>
      <p className="text-gray-800 leading-relaxed">{n.texto}</p>
    </article>
  );
}
