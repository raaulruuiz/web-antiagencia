import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { createClient } from "@supabase/supabase-js";

// Proyecto de cuentas de Anti-Studio, distinto del de la web. La clave es pública.
const URL_CUENTAS = "https://gayctlvlmfvbkvvasrcz.supabase.co";
const CLAVE_PUBLICA = "sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1";

const pantalla = "min-h-screen bg-[#121212] text-white flex items-center justify-center px-6";
const tarjeta = "w-full max-w-md bg-white text-[#111827] rounded-lg p-8";

export default function CuentaAntiStudio() {
  // Los enlaces de los emails traen el resultado en la parte final de la URL.
  const datos = useMemo(() => new URLSearchParams(window.location.hash.slice(1)), []);
  const esRecuperar = datos.get("type") === "recovery";
  const fallo = datos.get("error_description");
  const [clave, setClave] = useState("");
  const [estado, setEstado] = useState("");
  const [lista, setLista] = useState(false);
  const [cliente] = useState(() => createClient(URL_CUENTAS, CLAVE_PUBLICA, {
    auth: { flowType: "implicit", persistSession: false, detectSessionInUrl: true, storageKey: "anti-studio" },
  }));

  useEffect(() => {
    if (!esRecuperar) return undefined;
    const { data } = cliente.auth.onAuthStateChange((_, sesion) => { if (sesion) setLista(true); });
    return () => data.subscription.unsubscribe();
  }, [cliente, esRecuperar]);

  const guardar = async (e) => {
    e.preventDefault();
    setEstado("guardando");
    const { error } = await cliente.auth.updateUser({ password: clave });
    setEstado(error ? "error" : "hecho");
  };

  let contenido;
  if (fallo) {
    contenido = <><h1 className="text-2xl font-bold mb-2">Este enlace ya no vale</h1><p className="text-gray-600">Ha caducado o ya se ha usado. Pide otro desde Anti-Studio.</p></>;
  } else if (!esRecuperar) {
    contenido = <><h1 className="text-2xl font-bold mb-2">Cuenta confirmada</h1><p className="text-gray-600">Ya puedes volver a Anti-Studio y entrar.</p></>;
  } else if (estado === "hecho") {
    contenido = <><h1 className="text-2xl font-bold mb-2">Contraseña cambiada</h1><p className="text-gray-600">Ya puedes volver a Anti-Studio y entrar con la nueva.</p></>;
  } else {
    contenido = (
      <form onSubmit={guardar}>
        <h1 className="text-2xl font-bold mb-4">Nueva contraseña</h1>
        <label className="block text-sm text-gray-600 mb-1" htmlFor="clave">Mínimo 8 caracteres</label>
        <input id="clave" type="password" minLength={8} required autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 mb-4" />
        {estado === "error" && <p className="text-red-600 text-sm mb-3">No se ha podido cambiar. Pide otro enlace desde Anti-Studio.</p>}
        <button disabled={!lista || estado === "guardando"} className="w-full bg-[#7000FF] text-white font-bold rounded py-2.5 disabled:opacity-50">Guardar contraseña</button>
      </form>
    );
  }

  return (
    <>
      <Helmet><title>Tu cuenta de Anti-Studio</title><meta name="robots" content="noindex" /></Helmet>
      <div className={pantalla}><div className={tarjeta}>{contenido}</div></div>
    </>
  );
}
