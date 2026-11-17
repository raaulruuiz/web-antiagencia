// Comentarios de Anti-Agente (fallos e ideas): comprueba al usuario, lo guarda y avisa por email.
// Mismo proyecto de cuentas y misma tabla «feedback» que Anti-Studio.
const URL_CUENTAS = 'https://gayctlvlmfvbkvvasrcz.supabase.co';
const CLAVE_PUBLICA = 'sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1';
const escapar = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const TIPOS = { fallo: 'error', idea: 'idea' };
const MAXIMO = 5000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const authorization = req.headers.authorization || '';
  const yo = await fetch(`${URL_CUENTAS}/auth/v1/user`, { headers: { apikey: CLAVE_PUBLICA, authorization } });
  if (!yo.ok) return res.status(401).json({ error: 'Sin sesión' });
  const usuario = await yo.json();
  const { tipo, mensaje, version = '', origen = 'usuario' } = req.body || {};
  const texto = typeof mensaje === 'string' ? mensaje.trim().slice(0, MAXIMO) : '';
  if (!texto || !TIPOS[tipo]) return res.status(400).json({ error: 'Faltan datos' });
  const ver = String(version).slice(0, 40);
  const quien = String(origen || 'usuario').slice(0, 80);

  const guardado = await fetch(`${URL_CUENTAS}/rest/v1/feedback`, {
    method: 'POST',
    headers: { apikey: CLAVE_PUBLICA, authorization, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ email: usuario.email, tipo: TIPOS[tipo], mensaje: `[Anti-Agente ${ver} · ${quien}] ${texto}`, capturas: 0 }),
  });

  let enviado = false;
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: 'Anti-Agente <no-reply@auth.antiagencia.es>',
        to: 'raul@antiagencia.es',
        reply_to: usuario.email,
        subject: `COMENTARIO ANTI-AGENTE · ${tipo === 'fallo' ? 'FALLO' : 'IDEA'}`,
        html: `<p><strong>${tipo === 'fallo' ? 'Fallo' : 'Idea'}</strong> de ${escapar(usuario.email)}</p>`
          + `<p>Versión: ${escapar(ver || '—')}<br>Origen: ${escapar(quien)}</p>`
          + `<p style="white-space:pre-wrap">${escapar(texto)}</p>`,
      }),
    });
    enviado = r.ok;
  }
  if (!guardado.ok && !enviado) return res.status(502).json({ error: 'No se ha podido guardar' });
  return res.status(200).json({ guardado: guardado.ok, enviado });
}
