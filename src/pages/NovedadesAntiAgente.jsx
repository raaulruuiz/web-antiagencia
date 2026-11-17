import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { fecha, Hoja, rubik, Titulo } from "./antiStudioComun";
import { Boton, Contador, TEXTO_BOTON } from "./antiAgenteComun";

// /anti-agente/novedades — registro público de Anti-Agente (noindex), con el mismo diseño
// que /anti-studio/novedades. El contenido está en public/anti-agente/novedades.json:
// una entrada por versión de la app, más «enCurso» y «pendiente».
// Una entrada con «porConfirmar» solo se ve en local (vista previa), con su nota en naranja;
// en producción no sale hasta que se quite ese campo.

const visible = (e) => !e.porConfirmar || import.meta.env.DEV;

function useNovedadesAgente() {
  const [datos, setDatos] = useState({ versiones: [], enCurso: [], pendiente: [] });
  useEffect(() => {
    fetch("/anti-agente/novedades.json").then((r) => r.json()).then(setDatos).catch(() => {});
  }, []);
  return {
    versiones: datos.versiones
      .map((v) => ({ ...v, entradas: v.entradas.filter(visible) }))
      .filter((v) => v.entradas.length),
    enCurso: datos.enCurso.filter(visible),
    pendiente: datos.pendiente.filter(visible),
  };
}

function PorConfirmar({ e }) {
  if (!e.porConfirmar) return null;
  return <span className="block text-xs font-bold text-orange-600 mt-1" style={rubik}>POR CONFIRMAR · {e.porConfirmar}</span>;
}

function Columna({ titulo, lista }) {
  return (
    <div>
      <h3 className="font-bold text-[#0067FD] uppercase mb-3 pb-2 border-b-2 border-gray-900" style={rubik}>{titulo}</h3>
      {lista.map((t) => (
        <div key={t.titulo} className="mb-4">
          <p className="font-bold text-gray-900" style={rubik}>{t.titulo}</p>
          {t.texto && <p className="text-gray-700 text-sm leading-relaxed">{t.texto}</p>}
          <PorConfirmar e={t} />
        </div>
      ))}
    </div>
  );
}

function Version({ v }) {
  return (
    <div className="mb-8 last:mb-0">
      <p className="text-sm text-gray-500 pb-2 border-b-2 border-gray-900" style={rubik}>
        <span className="font-bold text-[#0067FD] uppercase">Versión {v.version}</span> · {fecha(v.fecha)}
      </p>
      {v.entradas.map((e) => (
        <article key={e.id} className="py-5 border-b border-gray-200 last:border-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>{e.titulo}</h3>
          <p className="text-gray-800 leading-relaxed">{e.texto}</p>
          <PorConfirmar e={e} />
        </article>
      ))}
    </div>
  );
}

export default function NovedadesAntiAgente() {
  const { versiones, enCurso, pendiente } = useNovedadesAgente();
  return (
    <>
      <Helmet>
        <title>Novedades de Anti-Agente — Antiagencia</title>
        <meta name="description" content="Lo que ya hace Anti-Agente, en qué estamos y lo que viene." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">
            <Hoja>
              <Link to="/anti-agente" className="text-[#0067FD] font-bold hover:underline">← Anti-Agente</Link>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 uppercase mt-6 mb-3" style={rubik}>Novedades</h1>
              <p className="text-gray-800 text-lg leading-loose">Lo que ya está, en qué andamos y lo que viene.</p>
            </Hoja>

            <Hoja>
              <Titulo>Qué viene</Titulo>
              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <Columna titulo="En curso" lista={enCurso} />
                <Columna titulo="Pendiente" lista={pendiente} />
              </div>
            </Hoja>

            <Hoja>
              <Titulo>Lo que ya hace</Titulo>
              {versiones.map((v) => <Version key={v.version} v={v} />)}
            </Hoja>

            <Hoja>
              <div className="text-center">
                <Titulo>¿Lo quieres para tu tienda?</Titulo>
                <p className="text-gray-800 text-lg leading-loose mb-6">Empiezo con 5 tiendas. Y con esas 5 lo monto yo.</p>
                <Boton href="/anti-agente#apuntarme">{TEXTO_BOTON}</Boton>
                <Contador />
              </div>
            </Hoja>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
