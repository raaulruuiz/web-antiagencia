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
              <p className="text-[#0067FD] font-bold mb-6" style={rubik}>Lista prioritaria de Anti-Agente</p>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 uppercase mb-6 leading-tight" style={rubik}>Ya estás dentro. Gracias.</h1>
              <Parrafo>Te escribiré yo personalmente, no un correo automático, para contarte los siguientes pasos.</Parrafo>
              <Parrafo>Si no quieres esperar, elige ya el día de tu videollamada aquí abajo. En esa llamada dejamos tu equipo a punto y hacemos la auditoría de costes.</Parrafo>
            </Hoja>

            <Hoja>
              <Titulo>Elige tu hueco</Titulo>
              <Parrafo>Elige el hueco que mejor te venga. Son 30 minutos y los hago yo.</Parrafo>
              <Pendiente>Sin decidir: duración de la llamada (30 minutos, provisional), herramienta de agenda (de momento la de Raúl, /admin/calendly) y qué pasa cuando se llenen las 5 plazas.</Pendiente>
              {slug
                ? <ReservaEmbebida slug={slug} origen={utmATexto(utm)} mostrarDuracion={false} />
                : <Pendiente>Falta el tipo de reunión en /admin/calendly (30 min). Para probar con uno existente: añade ?tipo=&lt;slug&gt; a la URL.</Pendiente>}
              <p className="text-sm text-gray-600 mt-8" style={rubik}>¿Ningún hueco te encaja? Responde a mi correo y lo buscamos.</p>
            </Hoja>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
