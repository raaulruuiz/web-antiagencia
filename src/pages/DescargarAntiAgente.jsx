import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { Apple, Check, Download, Monitor } from "lucide-react";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { rubik } from "./antiAgenteComun";
import { useMiPlaza } from "@/components/anti-agente/Plaza";

// /anti-agente/descargar — «Tu Anti-Agente»: solo para quien ya tiene plaza (si no, a desbloquearla).
// Mismo estilo que /inicio-nuevo: portada oscura, tarjetas con sombra negra y el ordenador de quien entra resaltado.
// Los instaladores son públicos (los protege que la app no deje entrar sin plaza).
// Enlaces fijos a la última versión (cada release lleva una copia con nombre fijo); si GitHub responde,
// se usan el .dmg y el .exe de su última versión.
const REPO = "raaulruuiz/anti-agente-descargas";
const MAC_FIJO = `https://github.com/${REPO}/releases/latest/download/Anti-Agente-mac-arm64.dmg`;
const WINDOWS_FIJO = `https://github.com/${REPO}/releases/latest/download/Anti-Agente-win-x64.exe`;
const WINDOWS_LISTO = true;
// Sin plaza: a desbloquearla en la portada nueva
const RUTA_REGISTRO = "/inicio-nuevo#plaza";

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

const sombraBoton = { ...rubik, boxShadow: "4px 4px 0 #111827" };
const claseBoton = "inline-flex items-center justify-center gap-2 w-full rounded-sm font-bold bg-[#7000FF] text-white hover:bg-[#0067FD] transition-colors px-6 py-4 text-lg";

function Ordenador({ nombre, requisito, icono, tuyo, children }) {
  return (
    <div
      className={`bg-white text-gray-900 rounded-sm p-6 md:p-8 border-2 flex flex-col ${tuyo ? "border-[#7000FF]" : "border-gray-900"}`}
      style={{ ...rubik, boxShadow: tuyo ? "6px 6px 0 #7000FF" : "4px 4px 0 #111827" }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span aria-hidden="true" className="inline-flex w-12 h-12 rounded-sm bg-[#7000FF] text-white items-center justify-center" style={{ boxShadow: "3px 3px 0 #111827" }}>{icono}</span>
        {tuyo && <span className="text-xs font-bold uppercase tracking-widest bg-[#7000FF] text-white px-2 py-1 rounded-sm">Tu ordenador</span>}
      </div>
      <h2 className="text-2xl font-bold mb-1">{nombre}</h2>
      <p className="text-sm text-gray-600 mb-6">{requisito}</p>
      <div className="mt-auto">{children}</div>
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
  const mia = useMiPlaza();
  // En la vista previa local (borrador) se enseña con una plaza de ejemplo para poder editarla; en la web publicada, no.
  const enLocal = typeof window !== "undefined" && ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const ejemplo = enLocal && !mia.cargando && !mia.plaza;
  const { cargando, email, plaza } = ejemplo ? { cargando: false, email: "tu@correo.com", plaza: 7 } : mia;
  const pasos = PASOS[suyo === "windows" && WINDOWS_LISTO ? "windows" : "mac"];

  if (!cargando && !plaza) return <Navigate to={RUTA_REGISTRO} replace />;

  const version = ultima.version && <p className="text-sm text-gray-500 mt-3 text-center">Versión {ultima.version}</p>;
  const mac = (
    <Ordenador key="mac" nombre="Mac" requisito="Con chip Apple (M1 o posterior)" icono={<Apple className="w-6 h-6" strokeWidth={2} />} tuyo={suyo === "mac"}>
      <a href={ultima.mac} className={claseBoton} style={sombraBoton}><Download className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" /> Descargar para Mac</a>
      {version}
    </Ordenador>
  );
  const windows = (
    <Ordenador key="windows" nombre="Windows" requisito="Windows 10 u 11, de 64 bits" icono={<Monitor className="w-6 h-6" strokeWidth={2} />} tuyo={suyo === "windows"}>
      {WINDOWS_LISTO ? (
        <>
          <a href={ultima.windows} className={claseBoton} style={sombraBoton}><Download className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" /> Descargar para Windows</a>
          {version}
        </>
      ) : (
        <span className="inline-block w-full text-center px-6 py-4 rounded-sm font-bold bg-gray-200 text-gray-500 cursor-default">Muy pronto</span>
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
      <div className="min-h-screen flex flex-col bg-white selection:bg-[#7000FF] selection:text-white" style={rubik}>
        <main className="flex-1">

          {/* Portada oscura: ya tienes tu plaza + descargas */}
          <section className="relative overflow-hidden bg-[#0a0a0a] text-white px-5 pt-16 md:pt-24 pb-16 md:pb-24">
            <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, #7000FF, transparent)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side, #0067FD, transparent)" }} />
            <div className="relative max-w-4xl mx-auto">
              {cargando ? (
                <div className="min-h-[24rem]" />
              ) : (
                <>
                  <div className="text-center">
                    <p className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold mb-6 bg-white/10 text-white border border-white/20">
                      <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" /> Ya tienes tu plaza · la {plaza}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.08] mb-5">Tu Anti-Agente</h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                      Descárgalo para tu ordenador y entra con {email ? <strong className="text-white">{email}</strong> : "el correo de tu plaza"}.
                    </p>
                    <p className="mt-6 max-w-xl mx-auto rounded-xl border border-[#7000FF]/60 bg-[#7000FF]/15 px-5 py-3 text-base font-bold text-white">
                      Tienes 7 días desde que reservaste para descargar la app y entrar con este mismo correo. Si no, la plaza pasa a la siguiente persona de la lista.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-12">
                    {suyo === "windows" ? [windows, mac] : [mac, windows]}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Cómo se empieza */}
          <section className="px-5 py-16 md:py-24 bg-gray-100">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7000FF] mb-3">{suyo === "windows" ? "En Windows" : "En Mac"}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Cómo se empieza</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pasos.map(([titulo, texto], i) => (
                  <div key={titulo} className="bg-white border border-gray-900 rounded-sm p-6" style={{ boxShadow: "4px 4px 0 #111827" }}>
                    <span className="w-10 h-10 rounded-full bg-[#7000FF] text-white font-bold flex items-center justify-center mb-4">{i + 1}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{titulo}</h3>
                    <p className="text-gray-700 leading-relaxed">{texto}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-12 text-center max-w-2xl mx-auto">
                Todo lo que hace la app sale de tu cuenta de Claude o ChatGPT y, por defecto, nada se publica ni se envía sin tu aprobación.{" "}
                <Link to="/anti-agente/novedades" className="underline">Novedades</Link> ·{" "}
                <Link to="/anti-agente/privacidad" className="underline">Privacidad</Link>
              </p>
            </div>
          </section>

        </main>
        <FooterMinimal />
      </div>
    </>
  );
}
