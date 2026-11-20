import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { Hoja, rubik, Titulo } from "./antiStudioComun";
import { useMiPlaza } from "@/components/anti-agente/Plaza";

// /anti-agente/descargar — «Tu Anti-Agente»: resalta el ordenador de quien entra y da la descarga.
// Los instaladores son públicos (los protege que la app no deje entrar sin plaza).
// Enlaces fijos a la última versión (cada release lleva una copia con nombre fijo); si GitHub responde,
// se usan el .dmg y el .exe de su última versión.
const REPO = "raaulruuiz/anti-agente-descargas";
const MAC_FIJO = `https://github.com/${REPO}/releases/latest/download/Anti-Agente-mac-arm64.dmg`;
const WINDOWS_FIJO = `https://github.com/${REPO}/releases/latest/download/Anti-Agente-win-x64.exe`;
const WINDOWS_LISTO = true;

function sistema() {
  const p = `${navigator.userAgentData?.platform || ""} ${navigator.platform || ""} ${navigator.userAgent || ""}`.toLowerCase();
  if (p.includes("win")) return "windows";
  if (p.includes("mac")) return "mac";
  return "otro";
}

function useUltimaVersion() {
  const [ultima, setUltima] = useState({ version: null, mac: MAC_FIJO, windows: WINDOWS_FIJO });
  useEffect(() => {
    let vivo = true;
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        if (!vivo || !r) return;
        const dmg = r.assets?.find((a) => a.name.endsWith(".dmg"));
        const exe = r.assets?.find((a) => a.name.endsWith(".exe"));
        setUltima({ version: r.tag_name?.replace(/^v/, "") || null, mac: dmg?.browser_download_url || MAC_FIJO, windows: exe?.browser_download_url || WINDOWS_FIJO });
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);
  return ultima;
}

const claseBoton = "inline-block px-6 py-3 rounded-sm font-bold transition-colors bg-[#7000FF] text-white hover:bg-[#0067FD]";

function Ordenador({ nombre, requisito, tuyo, children }) {
  return (
    <div className={`p-6 rounded-sm border-2 ${tuyo ? "border-[#7000FF] shadow-[6px_6px_0_#7000FF]" : "border-gray-900"}`} style={rubik}>
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-2xl font-bold text-gray-900 uppercase">{nombre}</h3>
        {tuyo && <span className="text-xs font-bold uppercase bg-[#7000FF] text-white px-2 py-1 rounded-sm">Tu ordenador</span>}
      </div>
      <p className="text-sm text-gray-600 mb-5">{requisito}</p>
      {children}
    </div>
  );
}

const PASOS = {
  mac: [
    ["Descarga Anti-Agente", "Es un archivo .dmg. Ábrelo cuando acabe de bajar."],
    ["Llévalo a Aplicaciones", "Arrastra el icono de Anti-Agente a la carpeta Aplicaciones y ábrelo desde ahí."],
    ["Entra con tu correo", "El mismo con el que has cogido tu plaza. Te llegará un código de 6 cifras."],
    ["Conecta tu IA", "Claude o ChatGPT, con tu propia cuenta. La app te guía y se actualiza sola."],
  ],
  windows: [
    ["Descarga Anti-Agente", "Un instalador .exe. Ábrelo cuando acabe de bajar."],
    ["Instálalo", "Se instala solo y se abre. Si Windows avisa de que protegió tu PC, pulsa «Más información» y «Ejecutar de todas formas»."],
    ["Entra con tu correo", "El mismo con el que has cogido tu plaza. Te llegará un código de 6 cifras."],
    ["Conecta tu IA", "Claude o ChatGPT, con tu propia cuenta. La app te guía y se actualiza sola."],
  ],
};

export default function DescargarAntiAgente() {
  const [suyo, setSuyo] = useState("otro");
  useEffect(() => setSuyo(sistema()), []);
  const ultima = useUltimaVersion();
  const { cargando, email, plaza } = useMiPlaza();
  const pasos = PASOS[suyo === "windows" && WINDOWS_LISTO ? "windows" : "mac"];

  const mac = (
    <Ordenador key="mac" nombre="Mac" requisito="Con chip Apple (M1 o posterior)" tuyo={suyo === "mac"}>
      <a href={ultima.mac} className={claseBoton}>Descargar para Mac</a>
      {ultima.version && <p className="text-sm text-gray-500 mt-3">Versión {ultima.version}</p>}
    </Ordenador>
  );
  const windows = (
    <Ordenador key="windows" nombre="Windows" requisito="Windows 10 u 11, de 64 bits" tuyo={suyo === "windows"}>
      {WINDOWS_LISTO ? (
        <>
          <a href={ultima.windows} className={claseBoton}>Descargar para Windows</a>
          {ultima.version && <p className="text-sm text-gray-500 mt-3">Versión {ultima.version}</p>}
        </>
      ) : (
        <span className="inline-block px-6 py-3 rounded-sm font-bold bg-gray-200 text-gray-500 cursor-default">Muy pronto</span>
      )}
      {!WINDOWS_LISTO && suyo === "windows" && (
        <p className="text-sm text-gray-600 mt-3">Tu plaza te espera: te escribiremos en cuanto esté lista.</p>
      )}
    </Ordenador>
  );

  return (
    <>
      <Helmet>
        <title>Tu Anti-Agente — Antiagencia</title>
        <meta name="description" content="Descarga Anti-Agente para tu ordenador." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">
            <Hoja>
              <Link to="/anti-agente" className="text-[#0067FD] font-bold hover:underline">← Anti-Agente</Link>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 uppercase mt-6 mb-3" style={rubik}>Tu Anti-Agente</h1>
              {!cargando && plaza && (
                <p className="text-gray-800 text-lg leading-loose">
                  Tienes la plaza <strong>{plaza}</strong>{email ? ` con ${email}` : ""}. Descárgalo y entra con ese correo.
                </p>
              )}
              {!cargando && !plaza && (
                <p className="text-gray-800 text-lg leading-loose">
                  Para entrar en la app hace falta una plaza.{" "}
                  <Link to="/anti-agente#apuntarme" className="text-[#0067FD] font-bold underline">Desbloquea la tuya</Link>{" "}
                  y entra después con ese correo.
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {suyo === "windows" ? [windows, mac] : [mac, windows]}
              </div>
            </Hoja>

            <Hoja>
              <Titulo>Para empezar</Titulo>
              <ol className="mt-6 space-y-5">
                {pasos.map(([titulo, texto], i) => (
                  <li key={titulo} className="flex gap-4">
                    <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-sm bg-[#7000FF] text-white font-bold" style={rubik}>{i + 1}</span>
                    <div>
                      <p className="font-bold text-gray-900" style={rubik}>{titulo}</p>
                      <p className="text-gray-700 leading-relaxed">{texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="text-sm text-gray-600 mt-8" style={rubik}>
                Todo lo que hace la app sale de tu cuenta de Claude o ChatGPT y, por defecto, nada se publica ni se envía sin tu aprobación.{" "}
                <Link to="/anti-agente/novedades" className="underline">Novedades</Link> ·{" "}
                <Link to="/anti-agente/privacidad" className="underline">Privacidad</Link>
              </p>
            </Hoja>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
