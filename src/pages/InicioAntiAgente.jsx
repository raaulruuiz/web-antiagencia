import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Laptop, Sparkles } from "lucide-react";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { ContadorPlazas as Contador } from "@/components/anti-agente/Plaza";
import {
  ListaCerrada, PLAZAS_CERRADAS, RUTA_GRACIAS, leerUtm, rubik, utmAQuery,
} from "./antiAgenteComun";

// Formulario de MailerLite de esta página (solo email): «Copy of Form Podcast», grupo «Lista prioritaria
// Anti-Agente». Marcado propio con el estilo de la web; envía por fetch como su código de inserción.
const ML_FORM = "https://assets.mailerlite.com/jsonp/686354/forms/204671545709168354";
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FormularioEmail({ onEnviado, idCampo = "ml-email" }) {
  const [email, setEmail] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { fetch(`${ML_FORM}/takel`, { mode: "cors", credentials: "omit" }).catch(() => {}); }, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (!EMAIL_OK.test(email.trim())) return setError("Escribe un email correcto.");
    if (!acepto) return setError("Para apuntarte tienes que aceptar la política de privacidad.");
    setError("");
    setEnviando(true);
    const cuerpo = new FormData();
    cuerpo.append("fields[email]", email.trim());
    cuerpo.append("ml-submit", "1");
    cuerpo.append("anticsrf", "true");
    try {
      const r = await fetch(`${ML_FORM}/subscribe`, { method: "POST", body: cuerpo, mode: "cors", credentials: "omit" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success) {
        window.umami?.track?.("anti-agente-apuntado");
        onEnviado?.();
        return;
      }
      setError("No se ha podido enviar. Revisa el email e inténtalo otra vez.");
    } catch {
      setError("No hay conexión o MailerLite no responde. Inténtalo de nuevo en un momento.");
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={enviar} noValidate style={rubik}>
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor={idCampo} className="sr-only">Tu email</label>
        <input
          id={idCampo} type="email" autoComplete="email" inputMode="email" placeholder="Tu email"
          value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
          className="flex-1 bg-white border border-gray-300 rounded-sm px-4 py-4 text-lg text-gray-900 focus:outline-none focus:border-[#7000FF] focus:ring-2 focus:ring-[#7000FF]/20"
        />
        <button type="submit" disabled={enviando} className="rounded-sm font-bold bg-[#7000FF] text-white hover:bg-[#0067FD] transition-colors px-6 py-4 text-lg disabled:opacity-60 disabled:cursor-wait" style={sombraBoton}>
          {enviando ? "Enviando…" : "Desbloquear mi plaza"}
        </button>
      </div>
      <label className="flex items-center gap-2 mt-4 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-[#7000FF]" checked={acepto} onChange={(e) => { setAcepto(e.target.checked); setError(""); }} />
        <span>Acepto la <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer" className="underline">política de privacidad</a></span>
      </label>
      {error && <p className="text-sm text-red-700 mt-2" role="alert">{error}</p>}
      <div className="text-center"><Contador /></div>
    </form>
  );
}

// /inicio-nuevo — borrador de la nueva portada (Anti-Agente). noindex hasta que pase a «/».
// Estructura inspirada en una landing de producto de referencia (portada oscura con vídeo, puerta de
// plaza, pasos con capturas, ventajas y cierre con formulario); textos de Raúl (pestaña 5 del doc).
// Sin menú arriba. Mismo formulario de MailerLite, misma página de gracias y mismo contador que /anti-agente.

const TEXTO_BOTON = "Desbloquear mi plaza gratuita";
const VENTAJAS = "Gratis · En tu ordenador · Con tu Claude o tu ChatGPT";

const claseBotonGrande = (grande) =>
  `inline-block rounded-sm font-bold bg-[#7000FF] text-white hover:bg-[#0067FD] transition-colors ${grande ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"}`;
const sombraBoton = { ...rubik, boxShadow: "4px 4px 0 #111827" };

// Botón centrado con el contador de plazas debajo (sincronizado con las plazas reservadas)
function BotonPlaza({ oscuro = false, grande = false }) {
  return (
    <div className="flex flex-col items-center text-center">
      <a href="#plaza" className={claseBotonGrande(grande)} style={sombraBoton}>{TEXTO_BOTON}</a>
      <Contador className={oscuro ? "!text-[#c4a3ff]" : ""} />
    </div>
  );
}

// Hueco marcado para lo que falta (vídeo y capturas). Es un borrador: se cambia antes de llevarla a «/».
function Hueco({ titulo, texto, aspecto = "aspect-video", oscuro = false }) {
  return (
    <div className={`${aspecto} w-full rounded-sm border-2 border-dashed flex flex-col items-center justify-center text-center px-6 ${oscuro ? "border-white/30 bg-white/5 text-gray-300" : "border-orange-400 bg-orange-50 text-orange-900"}`} style={rubik}>
      <p className="font-bold">{titulo}</p>
      {texto && <p className="text-sm mt-1 opacity-80">{texto}</p>}
    </div>
  );
}

const Etiqueta = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-widest text-[#7000FF] mb-3" style={rubik}>{children}</p>
);
const H2 = ({ children, className = "" }) => (
  <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5 ${className}`} style={rubik}>{children}</h2>
);
const P = ({ children, className = "" }) => (
  <p className={`text-lg text-gray-700 leading-relaxed mb-4 ${className}`} style={rubik}>{children}</p>
);
const Bloque = ({ children, id, gris = false, className = "" }) => (
  <section id={id} className={`scroll-mt-6 px-5 py-16 md:py-24 ${gris ? "bg-gray-100" : "bg-white"} ${className}`}>
    <div className="max-w-5xl mx-auto">{children}</div>
  </section>
);
const Tarjeta = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-900 rounded-sm p-6 ${className}`} style={{ boxShadow: "4px 4px 0 #111827" }}>{children}</div>
);

const EJEMPLOS = [
  ["Correo", "Lee tu bandeja, te dice qué es importante y te deja las respuestas escritas."],
  ["Email marketing", "Prepara tus newsletters y campañas con tu tono. No parece que lo haya escrito una IA (aquí he puesto especial énfasis)."],
  ["Contenido y redes", "Analiza tu contenido y el de tu competencia, te propone ideas e incluso te edita los vídeos e imágenes."],
  ["Publicidad", "Revisa tus anuncios, te monta las campañas, optimiza presupuestos..."],
  ["Números", "Te resume cada mañana cómo va la tienda."],
  ["Tu web", "También pueden editar la web e implementar funciones que serían de pago con otras herramientas."],
];

const PASOS = [
  ["Pides la tarea", "Pídela como se la pedirías a un empleado normal.", "Captura: el equipo de agentes"],
  ["Tu equipo se coordina", "Tus agentes hablan entre sí para coordinar la tarea.", "Captura: una tarjeta para aprobar"],
  ["Te la dejan hecha", "Te entregan la tarea lista para revisar y cuando confirmes, la publican.", "Captura: una conversación con un agente"],
];

const VENTAJAS_APP = [
  ["Tu propia cuenta de IA", "Funciona con Claude Code y Codex (ChatGPT), los programas oficiales, con tu propia cuenta. Inicias sesión tú y gasta de tu plan, la aplicación no tiene ningún coste extra a lo que ya pagas. Solo está sujeto a los términos de cada proveedor."],
  ["Herramientas a medida", "En la auditoría de costes, veremos qué herramientas a medida se pueden crear para tus agentes, que sustituyan herramientas actuales y te ahorren dinero. El desarrollo tiene un precio especial de lanzamiento, aunque puedes rechazarlo si solo quieres los bots."],
  ["Para pequeñas empresas, no para multinacionales", "Está pensado para tiendas donde el dueño hace mucho o tiene un equipo pequeño."],
];

const NOVEDADES = [
  "Puedes enviar tu feedback, comentarios y funcionalidades que quieras que tenga la app para que las desarrolle.",
  "Añadiré más herramientas propias dentro de la propia app.",
  "Añadiré más skills especializadas para tus agentes.",
  "Añadiré más conexiones con las herramientas que ya existen.",
  "Podrás ver todo lo que hay pendiente en la hoja de ruta de la aplicación.",
];

const MAS_PREGUNTAS = [
  ["¿Dónde quedan los datos de mi tienda?", "En tu ordenador. Tus conversaciones, memorias y archivos se guardan en tu propio ordenador, y las claves y accesos de tus conexiones también, cifrados para que no haya fallos de seguridad. El uso de tu tienda y tus herramientas va directo de tu ordenador a cada servicio: no pasan por ningún servidor mío. Mis servidores solo reciben tu inicio de sesión (tu email), nada de tu tienda. Lo que lee o escribe tu equipo pasa por la IA que uses (Claude Code, de Anthropic, o Codex, de OpenAI), según los términos de cada proveedor, no los míos. Solo si tú lo autorizas, se compartirá algo para mejorar la app."],
  ["¿Y si ya tengo equipo?", "En la llamada podrán venir e instalamos la aplicación para ellos también, cada uno puede tener su equipo de agentes para su propio trabajo. Esto no consume plazas extra, está dentro de tu propia plaza."],
];

// Icono de línea en un cuadrado morado (sustituye a los emojis de las tarjetas)
const Icono = ({ children }) => (
  <span aria-hidden="true" className="inline-flex w-12 h-12 rounded-sm bg-[#7000FF] text-white items-center justify-center mb-4" style={{ boxShadow: "3px 3px 0 #111827" }}>{children}</span>
);

const Check = () => (
  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7000FF] text-white text-xs font-bold flex items-center justify-center mt-0.5">✓</span>
);

export default function InicioAntiAgente() {
  const { search } = useLocation();
  const utm = useMemo(() => leerUtm(search), [search]);
  const navigate = useNavigate();
  const gracias = `${RUTA_GRACIAS}${utmAQuery(utm)}`;
  const alEnviar = useCallback(() => navigate(gracias), [navigate, gracias]);

  return (
    <>
      <Helmet>
        <title>Anti-Agente — Un equipo de agentes de IA que hace tus tareas digitales. Gratis.</title>
        <meta name="description" content="Un equipo de agentes de IA para tu tienda online: correo, emails, contenido, anuncios y web. Gratis, en tu ordenador y con tu Claude o tu ChatGPT." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-white selection:bg-[#7000FF] selection:text-white" style={rubik}>
        <main className="flex-1">

          {/* 1 · Portada oscura: título, botón centrado con contador y vídeo */}
          <section className="relative overflow-hidden bg-[#0a0a0a] text-white px-5 pt-16 md:pt-24 pb-16 md:pb-24">
            <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, #7000FF, transparent)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side, #0067FD, transparent)" }} />
            <div className="relative max-w-4xl mx-auto text-center">
              <p className="inline-block text-xs font-bold uppercase tracking-widest border border-white/30 rounded-sm px-3 py-1 mb-6">Anti-Agente · Gratis</p>
              <h1 className="text-4xl md:text-6xl font-bold leading-[1.08] mb-6">
                Un equipo de agentes de IA que realiza <span className="text-[#c4a3ff]">TODAS</span> las tareas de tu negocio por ti. Y gratis.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
                Modificar la web, montar campañas de publicidad, editar tus vídeos y anuncios, leer tu correo, tu contabilidad… Cada agente se especializa en una cosa, hablan entre sí, planifican y te lo dejan todo hecho. Te lo enseño en el vídeo.
              </p>
              <BotonPlaza oscuro grande />

              <div className="mt-14 text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">En este vídeo te enseño cómo funciona</p>
                <div className="rounded-sm border border-white/20 p-2 bg-white/5" style={{ boxShadow: "6px 6px 0 #7000FF" }}>
                  <Hueco oscuro titulo="▶  Vídeo" texto="Aquí va el vídeo que grabes enseñando Anti-Agente." />
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center">Llevo años haciendo marketing para tiendas online. Ahora mi equipo hace todo mi trabajo de un día en menos de 2 horas.</p>
              </div>
            </div>
          </section>

          {/* 2 · Desbloquea tu plaza (formulario), justo después de la portada */}
          <section id="plaza" className="scroll-mt-6 px-5 py-16 md:py-24 bg-white">
            <div className="max-w-2xl mx-auto">
              <Tarjeta className="p-8 md:p-12">
                <div className="text-center mb-6">
                  <H2 className="mb-0">Desbloquea tu plaza</H2>
                </div>
                {PLAZAS_CERRADAS ? <ListaCerrada /> : <FormularioEmail onEnviado={alEnviar} />}
                <p className="text-sm font-bold text-gray-900 mt-6 text-center">{VENTAJAS}</p>
              </Tarjeta>
            </div>
          </section>

          {/* 4 · Así funciona, con capturas reales */}
          <Bloque gris>
            <div className="text-center mb-12">
              <Etiqueta>Así funciona</Etiqueta>
              <H2>Un equipo de verdad</H2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {PASOS.map(([t, d, captura], i) => (
                <Tarjeta key={t} className="flex flex-col">
                  <span className="w-10 h-10 rounded-full bg-[#7000FF] text-white font-bold flex items-center justify-center mb-4">{i + 1}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t}</h3>
                  <div className="mb-5">
                    <Hueco aspecto="aspect-[4/3]" titulo={captura} texto="Captura real de la app" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{d}</p>
                </Tarjeta>
              ))}
            </div>
          </Bloque>

          {/* 5 · Con tu ChatGPT o tu Claude, en tu ordenador */}
          <Bloque>
            <div className="max-w-3xl mx-auto text-center mb-10">
              <Etiqueta>Con lo que ya tienes</Etiqueta>
              <H2>Funciona con tu ChatGPT o tu Claude, en tu ordenador</H2>
              <P className="mb-0">No tienes que pagar otra suscripción ni subir tus datos a ningún sitio raro.</P>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Tarjeta>
                <Icono><Sparkles className="w-6 h-6" strokeWidth={2} /></Icono>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Usa tu cuenta de ChatGPT o de Claude</h3>
                <p className="text-gray-700 leading-relaxed">Inicias sesión con la cuenta que ya pagas y tus agentes gastan de ese plan. Anti-Agente no te cobra nada aparte.</p>
              </Tarjeta>
              <Tarjeta>
                <Icono><Laptop className="w-6 h-6" strokeWidth={2} /></Icono>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Se instala en tu ordenador</h3>
                <p className="text-gray-700 leading-relaxed">Es una app que funciona en tu PC. Tus conversaciones, archivos y accesos se quedan ahí, no en un servidor mío.</p>
              </Tarjeta>
            </div>
          </Bloque>

          {/* 6 · Desbloquear plaza (más grande), con el formulario */}
          <section className="px-5 py-16 md:py-20 bg-[#7000FF] text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">Quedan pocas plazas. Pilla la tuya.</h2>
              <div className="bg-white text-left rounded-sm p-6 md:p-8" style={{ boxShadow: "4px 4px 0 #111827" }}>
                {PLAZAS_CERRADAS ? <ListaCerrada /> : <FormularioEmail idCampo="ml-email-final" onEnviado={alEnviar} />}
              </div>
            </div>
          </section>

        </main>
        <FooterMinimal />
      </div>
    </>
  );
}
