// Comentarios de Anti-Agente (fallos e ideas): comprueba al usuario, lo guarda y avisa por email.
// Mismo proyecto de cuentas y misma tabla «feedback» que Anti-Studio.
const URL_CUENTAS = 'https://gayctlvlmfvbkvvasrcz.supabase.co';
const CLAVE_PUBLICA = 'sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1';
const escapar = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const TIPOS = { fallo: 'error', idea: 'idea' };
const MAXIMO = 5000;
// La app manda hasta 3 MB en archivos (unos 4 MB en base64): Vercel corta las peticiones de más de 4,5 MB.
const MAX_ADJUNTOS = 10;
const MAX_BYTES = 3.2 * 1024 * 1024;

// [{ nombre, tipo, datos base64 }] → adjuntos de Resend; null si algo no cuadra.
function leerAdjuntos(lista) {
  if (lista == null) return [];
  if (!Array.isArray(lista) || lista.length > MAX_ADJUNTOS) return null;
  let total = 0;
  const salida = [];
  for (const a of lista) {
    if (!a || typeof a.datos !== 'string' || !a.datos) return null;
    const datos = a.datos.replace(/\s/g, '');
    if (!/^[A-Za-z0-9+/]+=*$/.test(datos)) return null;
    total += Math.floor(datos.length * 3 / 4);
    if (total > MAX_BYTES) return null;
    const nombre = String(a.nombre || 'archivo').replace(/[\\/\r\n"]/g, '_').slice(0, 120) || 'archivo';
    salida.push({ filename: nombre, content: datos, ...(typeof a.tipo === 'string' && /^[\w.+-]+\/[\w.+-]+$/.test(a.tipo) && { content_type: a.tipo }) });
  }
  return salida;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const authorization = req.headers.authorization || '';
  const yo = await fetch(`${URL_CUENTAS}/auth/v1/user`, { headers: { apikey: CLAVE_PUBLICA, authorization } });
  if (!yo.ok) return res.status(401).json({ error: 'Sin sesión' });
  const usuario = await yo.json();
  const { tipo, mensaje, version = '', origen = 'usuario' } = req.body || {};
  const texto = typeof mensaje === 'string' ? mensaje.trim().slice(0, MAXIMO) : '';
  if (!texto || !TIPOS[tipo]) return res.status(400).json({ error: 'Faltan datos' });
  const adjuntos = leerAdjuntos(req.body.adjuntos);
  if (!adjuntos) return res.status(413).json({ error: `Adjuntos no válidos: hasta ${MAX_ADJUNTOS} archivos y 3 MB en total` });
  const ver = String(version).slice(0, 40);
  const quien = String(origen || 'usuario').slice(0, 80);

  const guardado = await fetch(`${URL_CUENTAS}/rest/v1/feedback`, {
    method: 'POST',
    headers: { apikey: CLAVE_PUBLICA, authorization, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ email: usuario.email, tipo: TIPOS[tipo], mensaje: `[Anti-Agente ${ver} · ${quien}] ${texto}`, capturas: adjuntos.length }),
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
          + `<p style="white-space:pre-wrap">${escapar(texto)}</p>`
          + (adjuntos.length ? `<p>Adjuntos: ${adjuntos.map((a) => escapar(a.filename)).join(', ')}</p>` : ''),
        ...(adjuntos.length && { attachments: adjuntos }),
      }),
    });
    enviado = r.ok;
  }
  if (!guardado.ok && !enviado) return res.status(502).json({ error: 'No se ha podido guardar' });
  return res.status(200).json({ guardado: guardado.ok, enviado });
}
