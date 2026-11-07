import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { Boton, Hoja, Novedad, rubik, Titulo, useNovedades } from "./antiStudioComun";

function Columna({ titulo, lista }) {
  return (
    <div>
      <h3 className="font-bold text-[#0067FD] uppercase mb-3 pb-2 border-b-2 border-gray-900" style={rubik}>{titulo}</h3>
      {lista.map((t) => (
        <div key={t.titulo} className="mb-4">
          <p className="font-bold text-gray-900" style={rubik}>{t.titulo}</p>
          {t.texto && <p className="text-gray-700 text-sm leading-relaxed">{t.texto}</p>}
        </div>
      ))}
    </div>
  );
}

export default function NovedadesAntiStudio() {
  const { novedades, enCurso, pendiente } = useNovedades();
  return (
    <>
      <Helmet>
        <title>Novedades de Anti-Studio — Antiagencia</title>
        <meta name="description" content="Lo que ya tiene Anti-Studio, en qué estamos y lo que viene." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">
            <Hoja>
              <Link to="/anti-studio" className="text-[#0067FD] font-bold hover:underline">← Anti-Studio</Link>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 uppercase mt-6 mb-3" style={rubik}>Novedades</h1>
              <p className="text-gray-800 text-lg leading-loose">Lo que ya está, en qué andamos y lo que viene.</p>
            </Hoja>

            <Hoja>
              <Titulo>Qué viene</Titulo>
              <div className="grid md:grid-cols-3 gap-8 mt-6">
                <Columna titulo="En curso" lista={enCurso} />
                <Columna titulo="Pendiente" lista={pendiente} />
                <Columna titulo="Hecho" lista={novedades} />
              </div>
            </Hoja>

            <Hoja>
              <Titulo>Lo último</Titulo>
              {novedades.map((n) => <Novedad key={n.id} n={n} />)}
            </Hoja>

            <Hoja>
              <Titulo>¿Una idea o un fallo?</Titulo>
              <p className="text-gray-800 text-lg leading-loose mb-6">Las ideas y los fallos se envían desde la app, con el botón Feedback del menú. Si aún no la tienes, empieza por descargarla.</p>
              <Boton href="/anti-studio#descarga">Descargar Anti-Studio</Boton>
            </Hoja>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
