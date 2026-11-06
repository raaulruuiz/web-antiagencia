// Supabase pausa los proyectos gratuitos tras una semana sin actividad.
// Un intento de entrada con una cuenta inexistente consulta la base de datos sin cambiar nada.
const URL_CUENTAS = 'https://gayctlvlmfvbkvvasrcz.supabase.co';
const CLAVE_PUBLICA = 'sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1';

export default async function handler(req, res) {
  const r = await fetch(`${URL_CUENTAS}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: CLAVE_PUBLICA, 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'latido@auth.antiagencia.es', password: 'no-es-una-cuenta' }),
  });
  // 400 es lo esperado: la cuenta no existe, pero la base de datos ha respondido.
  res.status(r.status === 400 ? 200 : 502).json({ supabase: r.status });
}
