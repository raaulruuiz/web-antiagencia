import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import ReservaEmbebida from "@/components/booking/ReservaEmbebida";
import { Hoja, Parrafo, Pendiente, rubik, SLUG_RESERVA, Titulo, leerUtm, utmATexto } from "./antiAgenteComun";

// /anti-agente/gracias — a donde redirige el formulario de la lista prioritaria (BORRADOR, noindex).
// Acepta UTM en la URL (?utm_source=newsletter…) y los pasa a las notas de la reserva.

export default function AntiAgenteGracias() {
  const { search } = useLocation();
  const utm = useMemo(() => leerUtm(search), [search]);
  const slug = new URLSearchParams(search).get("tipo") || SLUG_RESERVA;

  useEffect(() => {
    window.umami?.track("anti-agente-lista", utm);
  }, [utm]);

  return (
    <>
      <Helmet>
        <title>Estás en la lista — Anti-Agente</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">
            <Hoja>
              <Pendiente>Textos de esta página provisionales (no venían en el PDF).</Pendiente>
              <p className="text-[#0067FD] font-bold mb-6" style={rubik}>Lista prioritaria de Anti-Agente</p>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 uppercase mb-6 leading-tight" style={rubik}>Ya estás dentro.</h1>
              <Parrafo>Te voy a escribir yo, personalmente, para preparar tu videollamada: dejamos tu equipo de agentes a punto para tu tienda y miramos tus costes.</Parrafo>
              <Parrafo>Si no quieres esperar a mi correo, elige ya el día y la hora que mejor te vengan:</Parrafo>
            </Hoja>

            <Hoja>
              <Titulo>Elige tu hueco</Titulo>
              {slug
                ? <ReservaEmbebida slug={slug} origen={utmATexto(utm)} />
                : <Pendiente>Falta el tipo de reunión del calendario de Raúl (/admin/calendly). Para probar: añade ?tipo=&lt;slug&gt; a la URL.</Pendiente>}
              <p className="text-gray-600 text-base mt-8">Raúl.</p>
            </Hoja>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
