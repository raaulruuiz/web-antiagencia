// Feedback de Anti-Studio: comprueba al usuario, lo guarda y avisa por email.
const URL_CUENTAS = 'https://gayctlvlmfvbkvvasrcz.supabase.co';
const CLAVE_PUBLICA = 'sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1';
const escapar = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const authorization = req.headers.authorization || '';
  const yo = await fetch(`${URL_CUENTAS}/auth/v1/user`, { headers: { apikey: CLAVE_PUBLICA, authorization } });
  if (!yo.ok) return res.status(401).json({ error: 'Sin sesión' });
  const usuario = await yo.json();
  const { tipo, mensaje, capturas = [] } = req.body || {};
  if (!mensaje || !['error', 'idea'].includes(tipo)) return res.status(400).json({ error: 'Faltan datos' });

  const guardado = await fetch(`${URL_CUENTAS}/rest/v1/feedback`, {
    method: 'POST',
    headers: { apikey: CLAVE_PUBLICA, authorization, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ email: usuario.email, tipo, mensaje, capturas: capturas.length }),
  });

  let enviado = false;
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: 'Anti-Studio <no-reply@auth.antiagencia.es>',
        to: 'raul@antiagencia.es',
        reply_to: usuario.email,
        subject: 'FEEDBACK ANTI-STUDIO',
        html: `<p><strong>${tipo === 'error' ? 'Algo falla' : 'Idea'}</strong> de ${escapar(usuario.email)}</p><p style="white-space:pre-wrap">${escapar(mensaje)}</p>`,
        attachments: capturas.slice(0, 3).map((c, i) => ({ filename: `captura-${i + 1}.jpg`, content: c.split(',')[1] })),
      }),
    });
    enviado = r.ok;
  }
  if (!guardado.ok && !enviado) return res.status(502).json({ error: 'No se ha podido guardar' });
  return res.status(200).json({ guardado: guardado.ok, enviado });
}
