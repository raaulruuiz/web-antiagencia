import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { Boton, Hoja, Novedad, rubik, Titulo, useNovedades } from "./antiStudioComun";

const PASOS = [
  ["Trae lo que tengas", "Una nota de voz, un vídeo, fotos, un email que te gustó o cuatro ideas sueltas. Todo a la misma pizarra."],
  ["Pídele el email", "Escribe con tu cuenta de Claude o de ChatGPT, con el contexto de tu marca y sonando a ti."],
  ["Súbelo a Klaviyo", "Como borrador, como plantilla o programado. Nada se envía sin que lo confirmes."],
];

export default function AntiStudio() {
  const { novedades } = useNovedades();
  const { hash, search } = useLocation();
  const invitado = new URLSearchParams(search).has("invita");
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Helmet>
        <title>Anti-Studio — Antiagencia</title>
        <meta name="description" content="Escribe tus emails en un minuto, con tu propia IA y sonando a ti." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">
            <Hoja>
              {invitado && <p className="text-[#0067FD] font-bold mb-6">Alguien te ha invitado a Anti-Studio.</p>}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 uppercase mb-3" style={rubik}>Anti-Studio</h1>
              <p className="text-xl font-bold text-gray-900 mb-8" style={rubik}>Escribe tus emails en un minuto.</p>
              <p className="text-gray-800 text-lg leading-loose mb-6">Tienes la idea en la cabeza, un audio en el móvil y un vídeo que viste ayer. Lo que no tienes es tiempo para sentarte a escribir.</p>
              <p className="text-gray-800 text-lg leading-loose mb-8">Anti-Studio es una app para tu ordenador donde juntas todo eso y sale un email de verdad, <strong>con tu propia IA y sin pagar otra suscripción de IA</strong>.</p>
              <Boton href="#descarga">Descargar Anti-Studio</Boton>
            </Hoja>

            <Hoja>
              <Titulo>Cómo funciona</Titulo>
              {PASOS.map(([titulo, texto], i) => (
                <p key={titulo} className="text-gray-800 text-lg leading-loose mb-4"><strong className="text-[#0067FD]">{i + 1}. {titulo}.</strong> {texto}</p>
              ))}
            </Hoja>

            {!!novedades.length && (
              <Hoja>
                <Titulo>Lo más nuevo</Titulo>
                {novedades.slice(0, 3).map((n) => <Novedad key={n.id} n={n} />)}
                <p className="mt-6"><Link to="/anti-studio/novedades" className="text-[#0067FD] font-bold hover:underline">Ver todas las novedades y lo que viene →</Link></p>
              </Hoja>
            )}

            <div id="descarga" className="scroll-mt-8">
              <Hoja>
                <Titulo>Descarga</Titulo>
                <p className="text-gray-800 text-lg leading-loose mb-4">Todavía no se puede descargar: estamos terminando el instalador. En cuanto esté, lo tendrás aquí.</p>
                <p className="text-gray-800 text-lg leading-loose">Para usarla necesitas tu cuenta de Claude o de ChatGPT.</p>
              </Hoja>
            </div>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
