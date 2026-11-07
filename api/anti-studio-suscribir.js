// Mete en MailerLite a quien lo ha aceptado en Anti-Studio, o lo da de baja si cambia de idea.
const URL_CUENTAS = 'https://gayctlvlmfvbkvvasrcz.supabase.co';
const CLAVE_PUBLICA = 'sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1';
const API = 'https://connect.mailerlite.com/api';
const GRUPO = 'Anti-Studio';

const mailerlite = (ruta, opciones = {}) => fetch(`${API}${ruta}`, {
  ...opciones,
  headers: { authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`, 'content-type': 'application/json', accept: 'application/json' },
});

// La búsqueda devuelve coincidencias parciales: solo vale el nombre exacto.
async function idGrupo() {
  const r = await mailerlite(`/groups?limit=100&filter[name]=${encodeURIComponent(GRUPO)}`);
  if (!r.ok) throw new Error('No se pueden leer los grupos');
  const existente = (await r.json()).data.find((g) => g.name === GRUPO);
  if (existente) return existente.id;
  const nuevo = await mailerlite('/groups', { method: 'POST', body: JSON.stringify({ name: GRUPO }) });
  if (!nuevo.ok) throw new Error('No se puede crear el grupo');
  return (await nuevo.json()).data.id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const authorization = req.headers.authorization || '';
  const yo = await fetch(`${URL_CUENTAS}/auth/v1/user`, { headers: { apikey: CLAVE_PUBLICA, authorization } });
  if (!yo.ok) return res.status(401).json({ error: 'Sin sesión' });
  const { email } = await yo.json();
  if (!process.env.MAILERLITE_API_KEY) return res.status(503).json({ error: 'Sin configurar' });

  const { suscrito, nombre = '' } = req.body || {};
  try {
    const datos = suscrito
      ? { email, fields: { name: String(nombre).slice(0, 100) }, groups: [await idGrupo()], status: 'active', resubscribe: true }
      : { email, status: 'unsubscribed' };
    const r = await mailerlite('/subscribers', { method: 'POST', body: JSON.stringify(datos) });
    if (!r.ok) return res.status(502).json({ error: 'MailerLite no lo ha aceptado' });
    return res.status(200).json({ suscrito: !!suscrito });
  } catch {
    return res.status(502).json({ error: 'MailerLite no responde' });
  }
}
