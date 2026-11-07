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

function Descarga({ href, titulo, nota }) {
  return (
    <a href={href} className="block p-4 border-2 border-gray-900 rounded-sm hover:bg-gray-100 transition-colors">
      <span className="block font-bold text-gray-900" style={rubik}>{titulo}</span>
      <span className="block text-sm text-gray-600">{nota}</span>
    </a>
  );
}

export default function AntiStudio() {
  const { novedades, descargas: enlaces = {} } = useNovedades();
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
                {!enlaces.windows && <p className="text-gray-800 text-lg leading-loose mb-4">Todavía no se puede descargar: estamos terminando el instalador. En cuanto esté, lo tendrás aquí.</p>}
                {enlaces.windows && (
                  <>
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <Descarga href={enlaces.macApple} titulo="Mac con Apple" nota="Chips M1, M2, M3 o posteriores" />
                      <Descarga href={enlaces.macIntel} titulo="Mac con Intel" nota="Mira cuál tienes en  → Acerca de este Mac" />
                      <Descarga href={enlaces.windows} titulo="Windows" nota="Windows 10 o 11" />
                    </div>
                    <p className="text-gray-800 text-lg leading-loose mb-6">Anti-Studio es gratis, y para que siga siéndolo no pagamos los certificados de Apple y Microsoft. Por eso, la primera vez tu ordenador te avisará de que no reconoce la app. Se abre así:</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2" style={rubik}>En Mac</h3>
                    <ol className="list-decimal pl-6 text-gray-800 text-lg leading-loose mb-6">
                      <li>Abre el archivo y arrastra Anti-Studio a Aplicaciones.</li>
                      <li>Ábrela. El Mac te dirá que no puede comprobarla: acepta el aviso.</li>
                      <li>Ve a Ajustes del Sistema → Privacidad y seguridad, baja hasta el final y pulsa «Abrir igualmente».</li>
                    </ol>
                    <h3 className="text-lg font-bold text-gray-900 mb-2" style={rubik}>En Windows</h3>
                    <ol className="list-decimal pl-6 text-gray-800 text-lg leading-loose mb-6">
                      <li>Abre el archivo.</li>
                      <li>Si Windows avisa de que no lo reconoce, pulsa «Más información» y luego «Ejecutar de todas formas».</li>
                    </ol>
                    <p className="text-gray-800 text-lg leading-loose mb-4">Solo la primera vez. Después crea tu cuenta y la app te guía para conectar tu IA.</p>
                  </>
                )}
                <p className="text-gray-800 text-lg leading-loose">Para usarla necesitas tu cuenta de Claude (Pro o Max) o de ChatGPT (Plus o superior).</p>
              </Hoja>
            </div>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
