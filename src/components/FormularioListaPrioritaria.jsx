import React, { useEffect, useState } from "react";

// Formulario de la lista prioritaria de Anti-Agente con marcado propio (estilo de la web).
// Envía por fetch a la URL de alta del formulario de MailerLite (la misma que usa su código
// de inserción). No carga el script de MailerLite ni usa cookies: la respuesta es JSON con CORS.
// - Al montar avisa a MailerLite de la visita (/takel), como su script, para sus estadísticas.
// - La casilla de privacidad + newsletter no es un campo de MailerLite: se valida aquí antes de enviar.
// - Los UTM no se envían a MailerLite (el formulario no tiene campos para ellos); los lleva
//   la página de gracias (onEnviado).

const base = (cuenta, formulario) => `https://assets.mailerlite.com/jsonp/${cuenta}/forms/${formulario}`;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const claseCampo =
  "w-full bg-white border border-gray-300 rounded-sm px-4 py-3 text-base text-gray-900 focus:outline-none focus:border-[#0067FD] focus:ring-2 focus:ring-[#0067FD]/20";

function traducirError(errores) {
  const email = errores?.fields?.email?.[0] || "";
  if (/required/i.test(email)) return { email: "Escribe tu email." };
  if (/valid/i.test(email)) return { email: "Ese email no parece correcto. Revísalo." };
  if (/already|exists|subscribed/i.test(email)) return { general: "Ese email ya está apuntado. Te escribiré igualmente." };
  return { general: "No se ha podido enviar. Revisa los datos e inténtalo otra vez." };
}

const Aviso = ({ texto }) => (texto ? <p className="text-sm text-red-700 mt-1" role="alert">{texto}</p> : null);
const Etiqueta = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-900 mb-1">{children}</label>
);

export default function FormularioListaPrioritaria({
  cuenta, formulario, textoBoton, claseBoton, estiloBoton, bajoBoton, onEnviado,
}) {
  const [datos, setDatos] = useState({ name: "", email: "", web: "", notas: "" });
  const [acepto, setAcepto] = useState(false);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch(`${base(cuenta, formulario)}/takel`, { mode: "cors", credentials: "omit" }).catch(() => {});
  }, [cuenta, formulario]);

  const cambiar = (k) => (e) => {
    setDatos((d) => ({ ...d, [k]: e.target.value }));
    if (errores[k]) setErrores((er) => ({ ...er, [k]: undefined }));
  };

  const validar = () => {
    const er = {};
    if (!datos.name.trim()) er.name = "Escribe tu nombre.";
    if (!datos.email.trim()) er.email = "Escribe tu email.";
    else if (!EMAIL_OK.test(datos.email.trim())) er.email = "Ese email no parece correcto. Revísalo.";
    if (!datos.web.trim()) er.web = "Escribe la web de tu tienda.";
    if (!acepto) er.acepto = "Para apuntarte tienes que marcar la casilla.";
    return er;
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    const er = validar();
    setErrores(er);
    if (Object.keys(er).length) return;

    setEnviando(true);
    const cuerpo = new FormData();
    cuerpo.append("fields[name]", datos.name.trim());
    cuerpo.append("fields[email]", datos.email.trim());
    cuerpo.append("fields[web]", datos.web.trim());
    if (datos.notas.trim()) cuerpo.append("fields[notas]", datos.notas.trim());
    cuerpo.append("ml-submit", "1");
    cuerpo.append("anticsrf", "true");
    try {
      const r = await fetch(`${base(cuenta, formulario)}/subscribe`, {
        method: "POST", body: cuerpo, mode: "cors", credentials: "omit",
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success) {
        window.umami?.track?.("anti-agente-apuntado");
        onEnviado?.();
        return;
      }
      setErrores(traducirError(j.errors));
    } catch {
      setErrores({ general: "No hay conexión o MailerLite no responde. Inténtalo de nuevo en un momento." });
    }
    setEnviando(false);
  };



  return (
    <form onSubmit={enviar} noValidate className="space-y-5" style={{ fontFamily: "'Rubik', sans-serif" }}>
      <div>
        <Etiqueta htmlFor="ll-nombre">Nombre</Etiqueta>
        <input id="ll-nombre" type="text" autoComplete="given-name" className={claseCampo} value={datos.name} onChange={cambiar("name")} aria-invalid={!!errores.name} />
        <Aviso texto={errores.name} />
      </div>
      <div>
        <Etiqueta htmlFor="ll-email">Email</Etiqueta>
        <input id="ll-email" type="email" autoComplete="email" inputMode="email" className={claseCampo} value={datos.email} onChange={cambiar("email")} aria-invalid={!!errores.email} />
        <Aviso texto={errores.email} />
      </div>
      <div>
        <Etiqueta htmlFor="ll-web">Web de tu tienda</Etiqueta>
        <input id="ll-web" type="text" inputMode="url" autoComplete="url" placeholder="tutienda.com" className={claseCampo} value={datos.web} onChange={cambiar("web")} aria-invalid={!!errores.web} />
        <Aviso texto={errores.web} />
      </div>
      <div>
        <Etiqueta htmlFor="ll-notas">¿Qué tarea te quita más tiempo? <span className="font-normal text-gray-500">(opcional)</span></Etiqueta>
        <textarea id="ll-notas" rows={3} className={claseCampo} value={datos.notas} onChange={cambiar("notas")} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-[#7000FF] flex-shrink-0"
            checked={acepto}
            onChange={(e) => { setAcepto(e.target.checked); if (errores.acepto) setErrores((er) => ({ ...er, acepto: undefined })); }}
            aria-invalid={!!errores.acepto}
          />
          <span>
            He leído la{" "}
            <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer" className="text-[#0067FD] underline">política de privacidad</a>{" "}
            y acepto que me escribas sobre Anti-Agente y me envíes tu newsletter diaria. Puedo darme de baja cuando quiera.
          </span>
        </label>
        <Aviso texto={errores.acepto} />
      </div>
      {errores.general && <p className="text-sm text-red-700" role="alert">{errores.general}</p>}
      <div>
        <button type="submit" disabled={enviando} className={`${claseBoton} disabled:opacity-60 disabled:cursor-wait`} style={estiloBoton}>
          {enviando ? "Enviando…" : textoBoton}
        </button>
        {bajoBoton}
      </div>
    </form>
  );
}
