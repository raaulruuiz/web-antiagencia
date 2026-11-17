import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import ReservaEmbebida from "@/components/booking/ReservaEmbebida";
import { Hoja, ListaCerrada, Parrafo, PLAZAS_CERRADAS, rubik, SLUG_RESERVA, Titulo, leerUtm, utmATexto } from "./antiAgenteComun";

// /anti-agente/gracias — a donde redirige el formulario de la lista prioritaria (noindex).
// Acepta UTM en la URL (?utm_source=newsletter…) y los pasa a las notas de la reserva.

export default function AntiAgenteGracias() {
  const { search } = useLocation();
  const utm = useMemo(() => leerUtm(search), [search]);

  // Se llega desde el formulario de la landing sin recargar: sin esto se abre con su scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              {!PLAZAS_CERRADAS && <Parrafo>Si no quieres esperar, elige ya el día de tu videollamada aquí abajo. En esa llamada te enseño la herramienta, dejamos tu equipo a punto y hacemos la auditoría de costes.</Parrafo>}
            </Hoja>

            <Hoja>
              {PLAZAS_CERRADAS ? <ListaCerrada /> : (
                <>
                  <Titulo>Elige tu hueco</Titulo>
                  <Parrafo>Elige el hueco que mejor te venga. Son 30 minutos y los hago yo.</Parrafo>
                  {/* Solo esta semana (decisión de Raúl, 17-11-2026): reservas desde el lunes 23-11. Pasada esa fecha no hace nada. */}
                  <ReservaEmbebida slug={SLUG_RESERVA} origen={utmATexto(utm)} mostrarDuracion={false} desde="2026-11-23" sinFinesDeSemana />
                  <p className="text-sm text-gray-600 mt-8" style={rubik}>¿Ningún hueco te encaja? Responde a mi correo y lo buscamos.</p>
                </>
              )}
            </Hoja>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
