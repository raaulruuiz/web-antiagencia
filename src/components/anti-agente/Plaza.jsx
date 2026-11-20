import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Plazas de Anti-Agente: registro con código de 6 cifras al correo y reserva de plaza.
// Mismo proyecto de cuentas que la app (y que Anti-Studio); la clave es pública.
// Las plazas se cuentan en Supabase (sql/plazas.sql del proyecto anti-agente):
// plazas_anti_agente() sin sesión, reservar_plaza_anti_agente() y mi_plaza_anti_agente() con sesión.
const URL_CUENTAS = "https://gayctlvlmfvbkvvasrcz.supabase.co";
const CLAVE_PUBLICA = "sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1";
// La plantilla del correo de Supabase saca el código (y no el enlace) cuando RedirectTo es
// esta dirección exacta (está en la lista de redirecciones). La app hará lo mismo.
const VUELTA = "https://antiagencia.es/anti-agente/descargar";
export const RUTA_DESCARGA = "/anti-agente/descargar";
const EVENTO_PLAZA = "anti-agente-plaza";
// Para formularios propios de registro (p. ej. /inicio-nuevo): mismo cliente, mismos mensajes.
export const clientePlazas = () => supabase();
export const VUELTA_CODIGO = VUELTA;
export const avisarPlazaReservada = () => window.dispatchEvent(new Event(EVENTO_PLAZA));
export const mensajeFallo = (error) => fallo(error);

const rubik = { fontFamily: "'Rubik', sans-serif" };
const claseBoton = "inline-block px-6 py-3 rounded-sm font-bold transition-colors bg-[#7000FF] text-white hover:bg-[#0067FD] disabled:opacity-50 disabled:hover:bg-[#7000FF]";
const claseCampo = "w-full border border-gray-900 rounded-sm px-4 py-3 text-lg text-gray-900 bg-white focus:outline-none focus:border-[#7000FF]";

// La sesión de la web es solo para saber si ya tienes plaza (estrictamente necesaria).
let cliente;
const supabase = () => {
  cliente ??= createClient(URL_CUENTAS, CLAVE_PUBLICA, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "anti-agente-web" },
  });
  return cliente;
};

// Contador público: { total, ocupadas, libres } o null mientras carga o si falla.
export function usePlazas() {
  const [plazas, setPlazas] = useState(null);
  useEffect(() => {
    let vivo = true;
    // Petición directa (sin cliente ni sesión): no depende del almacenamiento del navegador,
    // así también sale en vistas previas incrustadas.
    fetch(`${URL_CUENTAS}/rest/v1/rpc/plazas_anti_agente`, {
      method: "POST",
      headers: { apikey: CLAVE_PUBLICA, "Content-Type": "application/json" },
      body: "{}",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (vivo && data && typeof data.total === "number") setPlazas(data); })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);
  return plazas;
}

// ¿Hay sesión y plaza en este navegador? { cargando, email, plaza }
export function useMiPlaza() {
  const [estado, setEstado] = useState({ cargando: true, email: null, plaza: null });
  const leer = useCallback(async () => {
    const { data: { session } } = await supabase().auth.getSession();
    if (!session) return setEstado({ cargando: false, email: null, plaza: null });
    const { data } = await supabase().rpc("mi_plaza_anti_agente");
    setEstado({ cargando: false, email: session.user.email, plaza: data?.plaza ?? null });
  }, []);
  useEffect(() => {
    leer();
    const { data } = supabase().auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") leer();
    });
    // Al reservar una plaza en otro bloque de la misma página, todos se enteran.
    window.addEventListener(EVENTO_PLAZA, leer);
    return () => { data.subscription.unsubscribe(); window.removeEventListener(EVENTO_PLAZA, leer); };
  }, [leer]);
  return estado;
}

export const textoPlazas = (p) => {
  if (!p) return "";
  if (p.libres <= 0) return `Las ${p.total} plazas están cogidas`;
  return p.libres === 1 ? `Queda 1 de ${p.total} plazas` : `Quedan ${p.libres} de ${p.total} plazas`;
};

export function ContadorPlazas({ className = "" }) {
  const plazas = usePlazas();
  if (!plazas) return null;
  return <p className={`text-sm font-bold text-[#7000FF] mt-3 ${className}`} style={rubik}>{textoPlazas(plazas)}</p>;
}

// Botón para la cabecera de la página de inicio: solo sale si este navegador ya tiene plaza.
export function YaTienesPlaza({ className = "" }) {
  const { plaza } = useMiPlaza();
  if (!plaza) return null;
  return (
    <Link to={RUTA_DESCARGA} className={`${claseBoton} ${className}`} style={rubik}>
      Ya tienes tu plaza · Ir a tu Anti-Agente
    </Link>
  );
}

const fallo = (error) => {
  const m = `${error?.message || ""} ${error?.code || ""}`.toLowerCase();
  if (m.includes("rate") || m.includes("429") || m.includes("seconds")) return "Has pedido muchos códigos seguidos. Espera un minuto y vuelve a probar.";
  if (m.includes("expired") || m.includes("invalid") || m.includes("otp")) return "Ese código no vale o ha caducado. Revísalo o pide otro.";
  return "No ha salido bien. Vuelve a probar en un momento.";
};

// Bloque «Desbloquear mi plaza»: correo → código de 6 cifras → plaza.
// Con sesión y plaza, enseña directamente «Ya tienes tu plaza».
export function DesbloquearPlaza({ titulo = "Desbloquea tu plaza", texto }) {
  const plazas = usePlazas();
  const mia = useMiPlaza();
  const [fase, setFase] = useState("correo"); // correo | codigo | hecha | agotadas
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [plaza, setPlaza] = useState(null);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const pedirCodigo = async (e) => {
    e?.preventDefault();
    setError("");
    setOcupado(true);
    const { error: err } = await supabase().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: VUELTA },
    });
    setOcupado(false);
    if (err) return setError(fallo(err));
    setCodigo("");
    setFase("codigo");
  };

  const comprobar = async (e) => {
    e.preventDefault();
    setError("");
    setOcupado(true);
    const { error: err } = await supabase().auth.verifyOtp({ email: email.trim(), token: codigo, type: "email" });
    if (err) { setOcupado(false); return setError(fallo(err)); }
    const { data, error: errReserva } = await supabase().rpc("reservar_plaza_anti_agente");
    setOcupado(false);
    if (errReserva) return setError(fallo(errReserva));
    if (!data?.ok) return setFase("agotadas");
    avisarPlazaReservada();
    setPlaza(data);
    setFase("hecha");
  };

  const salir = async () => {
    await supabase().auth.signOut();
    setFase("correo");
    setPlaza(null);
  };

  const numero = plaza?.plaza ?? mia.plaza;
  const yaLaTiene = fase === "hecha" || (fase === "correo" && mia.plaza);
  const cerrado = plazas && plazas.libres <= 0;

  let contenido;
  if (mia.cargando) {
    contenido = null;
  } else if (yaLaTiene) {
    contenido = (
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-2" style={rubik}>
          {plaza?.nueva ? `¡Dentro! Tienes la plaza ${numero}` : `Ya tienes tu plaza${numero ? ` (la ${numero})` : ""}`}
        </p>
        <p className="text-gray-700 text-lg mb-6">Descarga Anti-Agente y entra con este mismo correo{mia.email && !plaza ? ` (${mia.email})` : ""}.</p>
        <Link to={RUTA_DESCARGA} className={claseBoton} style={rubik}>Ir a tu Anti-Agente</Link>
        <p className="mt-4"><button type="button" onClick={salir} className="text-sm text-gray-500 underline" style={rubik}>No soy yo</button></p>
      </div>
    );
  } else if (fase === "agotadas" || cerrado) {
    contenido = (
      <div className="border-l-4 border-[#7000FF] pl-5">
        <p className="text-xl font-bold text-gray-900" style={rubik}>Las {plazas?.total ?? 100} plazas están cogidas.</p>
        <p className="text-gray-700 text-lg mt-2">Te avisaremos cuando abramos más.</p>
      </div>
    );
  } else if (fase === "codigo") {
    contenido = (
      <form onSubmit={comprobar}>
        <p className="text-gray-700 text-lg mb-4">Te he mandado un código de 6 cifras a <strong>{email.trim()}</strong>. Si no lo ves, mira en spam.</p>
        <label htmlFor="codigo-plaza" className="block text-sm font-bold text-gray-900 mb-2" style={rubik}>Código</label>
        <input
          id="codigo-plaza" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus
          value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${claseCampo} tracking-[0.5em] text-center text-2xl font-bold max-w-xs`} style={rubik}
        />
        {error && <p className="text-red-600 text-sm mt-3" style={rubik}>{error}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button disabled={ocupado || codigo.length !== 6} className={claseBoton} style={rubik}>Desbloquear mi plaza</button>
          <button type="button" disabled={ocupado} onClick={pedirCodigo} className="text-sm text-gray-600 underline" style={rubik}>Mandar otro código</button>
          <button type="button" disabled={ocupado} onClick={() => { setFase("correo"); setError(""); }} className="text-sm text-gray-600 underline" style={rubik}>Cambiar el correo</button>
        </div>
      </form>
    );
  } else {
    contenido = (
      <form onSubmit={pedirCodigo}>
        <label htmlFor="email-plaza" className="block text-sm font-bold text-gray-900 mb-2" style={rubik}>Tu correo</label>
        <input
          id="email-plaza" type="email" autoComplete="email" required placeholder="tu@correo.com"
          value={email} onChange={(e) => setEmail(e.target.value)} className={claseCampo} style={rubik}
        />
        {error && <p className="text-red-600 text-sm mt-3" style={rubik}>{error}</p>}
        <button disabled={ocupado} className={`${claseBoton} mt-5`} style={rubik}>Desbloquear mi plaza</button>
        {plazas && <p className="text-sm font-bold text-[#7000FF] mt-3" style={rubik}>{textoPlazas(plazas)}</p>}
        <p className="text-sm text-gray-600 mt-3" style={rubik}>
          Te mando un código para comprobar que el correo es tuyo. Con él entrarás en la app.{" "}
          <Link to="/anti-agente/privacidad" className="underline">Privacidad</Link>
        </p>
      </form>
    );
  }

  return (
    <div>
      {titulo && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase mb-4" style={rubik}>{titulo}</h2>}
      {texto && !yaLaTiene && <p className="text-gray-800 text-lg leading-loose mb-6">{texto}</p>}
      {contenido}
    </div>
  );
}
