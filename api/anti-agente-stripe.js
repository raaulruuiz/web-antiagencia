// Aviso de Stripe (webhook): apunta en accesos_herramientas lo que ha pagado cada cuenta de Anti-Agente y, en
// anti_gestor_ventas, los servicios contratados con su enlace de pago (metadata servicio, client_reference_id = cuenta).
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
// Dada de baja: sigue activa hasta el final del periodo, pero ya no se renovará.
const seCancela = (s) => !!(s.cancel_at_period_end || s.cancel_at) && s.status !== 'canceled';

async function pagoHecho(sesion, prueba) {
  if (sesion.payment_status === 'unpaid') return;
  const { usuario, herramientas, periodo } = sesion.metadata || {};
  const lista = String(herramientas || '').split(',').filter((h) => ID_HERRAMIENTA.test(h));
  if (!usuario || !lista.length || !PERIODOS.includes(periodo)) return;
  let estado = 'activo';
  let hasta = null;
  let cancelada = false;
  if (sesion.subscription) {
    const s = await stripe(`/subscriptions/${sesion.subscription}`);
    estado = ESTADOS[s.status] || 'impagado';
    hasta = fecha(finDe(s));
    cancelada = seCancela(s);
  }
  const ahora = new Date().toISOString();
  await supabase('accesos_herramientas?on_conflict=usuario,herramienta', {
    metodo: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    datos: lista.map((herramienta) => ({
      usuario, herramienta, estado, periodo, hasta, prueba, cancelada,
      cliente_stripe: sesion.customer || null,
      suscripcion_stripe: sesion.subscription || null,
      sesion_stripe: sesion.id,
      actualizado: ahora,
    })),
  });
}

// ---- Servicios (Anti-Gestor): una venta por pago; la referencia (factura o sesión) es única y no se apunta dos veces ----
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const diaMadrid = (seg) => new Date((seg || Date.now() / 1000) * 1000).toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });

export async function apuntarVenta(v) {
  try {
    await supabase('anti_gestor_ventas?on_conflict=referencia', { metodo: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', datos: v });
  } catch (e) {
    if (!/23503/.test(e.message)) throw e;
    // Un servicio que ya no existe no se arregla reintentando: queda en el log y Raúl la apunta a mano si hace falta.
    const existe = await supabase(`anti_gestor_servicios?id=eq.${encodeURIComponent(v.servicio)}&select=id`);
    if (!existe?.length) return console.error(`Venta de Stripe ${v.referencia}: el servicio «${v.servicio}» no existe en Anti-Gestor`);
    // La cuenta del enlace no existe (o se borró): la venta se apunta igual, con su email.
    if (!v.usuario) throw e;
    await apuntarVenta({ ...v, usuario: null });
  }
}

async function servicioPagado(sesion, prueba) {
  const servicio = sesion.metadata?.servicio;
  if (!ID_HERRAMIENTA.test(servicio || '') || sesion.payment_status === 'unpaid') return;
  const usuario = UUID.test(sesion.client_reference_id || '') ? sesion.client_reference_id : null;
  // Las renovaciones solo traen lo que lleve la suscripción: se le apunta la cuenta para sus facturas siguientes.
  if (usuario && sesion.subscription) await stripe(`/subscriptions/${sesion.subscription}`, { metodo: 'POST', datos: { metadata: { usuario } } });
  await apuntarVenta({
    usuario, email: sesion.customer_details?.email || sesion.customer_email || '', servicio,
    importe_centimos: sesion.amount_total || 0, fecha: diaMadrid(sesion.created), origen: 'stripe',
    referencia: sesion.invoice || sesion.id, nota: prueba ? 'modo prueba' : '',
  });
}

// La primera factura de una suscripción ya la apunta la sesión de pago (misma referencia): aquí solo las renovaciones.
async function renovacionPagada(f, prueba) {
  if (f.billing_reason !== 'subscription_cycle') return;
  const meta = f.parent?.subscription_details?.metadata || f.subscription_details?.metadata || {};
  if (!ID_HERRAMIENTA.test(meta.servicio || '')) return;
  await apuntarVenta({
    usuario: UUID.test(meta.usuario || '') ? meta.usuario : null, email: f.customer_email || '', servicio: meta.servicio,
    importe_centimos: f.amount_paid || 0, fecha: diaMadrid(f.status_transitions?.paid_at || f.created), origen: 'stripe',
    referencia: f.id, nota: prueba ? 'modo prueba' : '',
  });
}

async function suscripcionCambiada(s) {
  await supabase(`accesos_herramientas?suscripcion_stripe=eq.${encodeURIComponent(s.id)}`, {
    metodo: 'PATCH',
    prefer: 'return=minimal',
    datos: { estado: ESTADOS[s.status] || 'impagado', hasta: fecha(s.ended_at || s.cancel_at || finDe(s)), cancelada: seCancela(s), actualizado: new Date().toISOString() },
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
        await servicioPagado(objeto, !evento.livemode);
        break;
      case 'invoice.paid':
        await renovacionPagada(objeto, !evento.livemode);
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
