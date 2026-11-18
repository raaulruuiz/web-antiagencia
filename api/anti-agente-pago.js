// Pagos de herramientas de Anti-Agente.
// GET ?herramientas=webs,otra → precios desde Stripe (públicos).
// POST { accion: 'pagar', herramientas, periodo } → página de pago de Stripe.
// POST { accion: 'gestionar' } → portal de Stripe para cambiar la tarjeta, ver facturas o darse de baja.
// El acceso no se da aquí: lo apunta el aviso de Stripe (anti-agente-stripe.js) cuando el pago se confirma.
import { WEB, PERIODOS, ID_HERRAMIENTA, claveDePrecio, periodoDeClave, stripe, supabase, usuarioDe, fiscalDe, ivaIncluido, clienteDe } from './_stripe-anti-agente.js';

const MAX_HERRAMIENTAS = 20;
const MARGEN_RENOVACION = 2 * 24 * 3600 * 1000;

// Igual que en la app: un regalo vencido se puede pagar; una suscripción en plena renovación, no (se cobraría dos veces).
export function vigente(a, ahora = Date.now()) {
  if (a.estado !== 'activo') return false;
  if (!a.hasta) return true;
  const margen = a.periodo === 'mes' || a.periodo === 'año' ? MARGEN_RENOVACION : 0;
  return new Date(a.hasta).getTime() + margen > ahora;
}

async function preciosDe(herramientas, periodos = PERIODOS) {
  const claves = herramientas.flatMap((h) => periodos.map((p) => claveDePrecio(h, p)));
  const { data } = await stripe('/prices', { datos: { lookup_keys: claves, active: true, limit: 100 } });
  return data;
}

async function precios(req, res) {
  const herramientas = String(req.query.herramientas || '').split(',').filter((h) => ID_HERRAMIENTA.test(h)).slice(0, MAX_HERRAMIENTAS);
  if (!herramientas.length) return res.status(400).json({ error: 'Faltan herramientas' });
  const salida = {};
  for (const p of await preciosDe(herramientas)) {
    const de = periodoDeClave(p.lookup_key);
    if (!de) continue;
    (salida[de.herramienta] ||= {})[de.periodo] = { importe: p.unit_amount / 100, moneda: p.currency };
  }
  res.setHeader('cache-control', 's-maxage=300');
  return res.status(200).json({ precios: salida });
}

async function pagar(req, res, usuario) {
  const { herramientas, periodo } = req.body || {};
  const lista = Array.isArray(herramientas) ? [...new Set(herramientas)] : [];
  if (!lista.length || lista.length > MAX_HERRAMIENTAS || !lista.every((h) => ID_HERRAMIENTA.test(h)) || !PERIODOS.includes(periodo)) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  // Solo empresas y autónomos: sin empresa y NIF no hay factura, así que tampoco pago.
  const fiscal = fiscalDe(usuario);
  if (!fiscal) return res.status(428).json({ error: 'Faltan los datos de facturación' });
  const filtro = `usuario=eq.${usuario.id}`;
  const suyos = await supabase(`accesos_herramientas?${filtro}&select=herramienta,estado,periodo,hasta,cliente_stripe`);
  const yaTiene = lista.filter((h) => suyos.some((a) => a.herramienta === h && vigente(a)));
  if (yaTiene.length) return res.status(409).json({ error: 'Ya tienes acceso', herramientas: yaTiene });

  const encontrados = await preciosDe(lista, [periodo]);
  const faltan = lista.filter((h) => !encontrados.some((p) => p.lookup_key === claveDePrecio(h, periodo)));
  if (faltan.length) return res.status(404).json({ error: 'Sin precio para ese periodo', herramientas: faltan });

  let cliente;
  try {
    cliente = await clienteDe(usuario, fiscal, suyos.find((a) => a.cliente_stripe)?.cliente_stripe);
  } catch (e) {
    if (/tax.?id|invalid value/i.test(e.message)) return res.status(422).json({ error: 'NIF no válido' });
    throw e;
  }
  const impuesto = await ivaIncluido();
  const metadata = { usuario: usuario.id, herramientas: lista.join(','), periodo };
  const suscripcion = periodo !== 'siempre';
  const sesion = await stripe('/checkout/sessions', {
    metodo: 'POST',
    datos: {
      mode: suscripcion ? 'subscription' : 'payment',
      line_items: encontrados.map((p) => ({ price: p.id, quantity: 1, tax_rates: [impuesto] })),
      client_reference_id: usuario.id,
      metadata,
      // Las suscripciones ya hacen factura sola; el pago único la pide aparte.
      ...(suscripcion ? { subscription_data: { metadata } } : { payment_intent_data: { metadata }, invoice_creation: { enabled: true, invoice_data: { metadata } } }),
      customer: cliente,
      customer_update: { address: 'auto', name: 'never' },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      locale: 'auto',
      success_url: `${WEB}/anti-agente/pago?estado=hecho`,
      cancel_url: `${WEB}/anti-agente/pago?estado=cancelado`,
    },
  });
  return res.status(200).json({ url: sesion.url, id: sesion.id });
}

async function gestionar(req, res, usuario) {
  const suyos = await supabase(`accesos_herramientas?usuario=eq.${usuario.id}&cliente_stripe=not.is.null&select=cliente_stripe&limit=1`);
  if (!suyos.length) return res.status(404).json({ error: 'No tienes pagos' });
  const portal = await stripe('/billing_portal/sessions', {
    metodo: 'POST',
    datos: { customer: suyos[0].cliente_stripe, return_url: `${WEB}/anti-agente/pago?estado=gestion` },
  });
  return res.status(200).json({ url: portal.url });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await precios(req, res);
    if (req.method !== 'POST') return res.status(405).end();
    const usuario = await usuarioDe(req);
    if (!usuario) return res.status(401).json({ error: 'Sin sesión' });
    const accion = req.body?.accion;
    if (accion === 'pagar') return await pagar(req, res, usuario);
    if (accion === 'gestionar') return await gestionar(req, res, usuario);
    return res.status(400).json({ error: 'Acción desconocida' });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'No se ha podido hablar con Stripe' });
  }
}
