// Aviso de Stripe (webhook): apunta en accesos_herramientas lo que ha pagado cada cuenta de Anti-Agente.
// Solo acepta avisos firmados con STRIPE_WEBHOOK_SECRET. Si Supabase falla, responde 500 para que Stripe lo reintente.
import crypto from 'node:crypto';
import { ID_HERRAMIENTA, PERIODOS, stripe, supabase } from './_stripe-anti-agente.js';

export const config = { api: { bodyParser: false } };
const MARGEN = 300;

async function cuerpoCrudo(req) {
  const trozos = [];
  for await (const t of req) trozos.push(typeof t === 'string' ? Buffer.from(t) : t);
  return Buffer.concat(trozos);
}

export function firmaValida(cuerpo, cabecera, secreto, ahora = Math.floor(Date.now() / 1000)) {
  const partes = String(cabecera || '').split(',').map((p) => p.split('='));
  const t = Number(partes.find(([k]) => k === 't')?.[1]);
  const firmas = partes.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !firmas.length || Math.abs(ahora - t) > MARGEN) return false;
  const esperada = Buffer.from(crypto.createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest('hex'));
  return firmas.some((f) => f.length === esperada.length && crypto.timingSafeEqual(Buffer.from(f), esperada));
}

const ESTADOS = { active: 'activo', trialing: 'activo', past_due: 'impagado', unpaid: 'impagado', incomplete: 'impagado', paused: 'impagado', canceled: 'cancelado', incomplete_expired: 'cancelado' };
// Desde 2025 Stripe pone el fin del periodo en cada línea de la suscripción, no en la suscripción.
const finDe = (s) => s.current_period_end || s.items?.data?.[0]?.current_period_end || null;
const fecha = (seg) => (seg ? new Date(seg * 1000).toISOString() : null);

async function pagoHecho(sesion, prueba) {
  if (sesion.payment_status === 'unpaid') return;
  const { usuario, herramientas, periodo } = sesion.metadata || {};
  const lista = String(herramientas || '').split(',').filter((h) => ID_HERRAMIENTA.test(h));
  if (!usuario || !lista.length || !PERIODOS.includes(periodo)) return;
  let estado = 'activo';
  let hasta = null;
  if (sesion.subscription) {
    const s = await stripe(`/subscriptions/${sesion.subscription}`);
    estado = ESTADOS[s.status] || 'impagado';
    hasta = fecha(finDe(s));
  }
  const ahora = new Date().toISOString();
  await supabase('accesos_herramientas?on_conflict=usuario,herramienta', {
    metodo: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    datos: lista.map((herramienta) => ({
      usuario, herramienta, estado, periodo, hasta, prueba,
      cliente_stripe: sesion.customer || null,
      suscripcion_stripe: sesion.subscription || null,
      sesion_stripe: sesion.id,
      actualizado: ahora,
    })),
  });
}

async function suscripcionCambiada(s) {
  await supabase(`accesos_herramientas?suscripcion_stripe=eq.${encodeURIComponent(s.id)}`, {
    metodo: 'PATCH',
    prefer: 'return=minimal',
    datos: { estado: ESTADOS[s.status] || 'impagado', hasta: fecha(s.ended_at || finDe(s)), actualizado: new Date().toISOString() },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) return res.status(500).json({ error: 'Falta STRIPE_WEBHOOK_SECRET' });
  const cuerpo = (await cuerpoCrudo(req)).toString('utf8');
  if (!firmaValida(cuerpo, req.headers['stripe-signature'], secreto)) return res.status(400).json({ error: 'Firma no válida' });
  const evento = JSON.parse(cuerpo);
  const objeto = evento.data?.object || {};
  try {
    switch (evento.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await pagoHecho(objeto, !evento.livemode);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await suscripcionCambiada(objeto);
        break;
      default:
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'No se ha podido apuntar' });
  }
  return res.status(200).json({ recibido: true });
}
