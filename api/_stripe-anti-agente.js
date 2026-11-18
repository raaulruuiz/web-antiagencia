// Común a las rutas de pago de Anti-Agente. Las claves de Stripe y el service role de Supabase solo viven en Vercel.
export const URL_CUENTAS = 'https://gayctlvlmfvbkvvasrcz.supabase.co';
export const CLAVE_PUBLICA = 'sb_publishable_xK4rKEfqlHloexUQd8BNpQ_a7pdiDp1';
export const WEB = 'https://antiagencia.es';
export const PERIODOS = ['mes', 'año', 'siempre'];
export const ID_HERRAMIENTA = /^[a-z0-9][a-z0-9-]{1,39}$/;

// El precio de cada herramienta vive en Stripe: un precio por periodo con lookup_key «<herramienta>_<periodo>».
export const claveDePrecio = (herramienta, periodo) => `${herramienta}_${periodo === 'año' ? 'ano' : periodo}`;
export const periodoDeClave = (clave) => {
  const m = /^(.+)_(mes|ano|siempre)$/.exec(clave || '');
  return m ? { herramienta: m[1], periodo: m[2] === 'ano' ? 'año' : m[2] } : null;
};

// Stripe pide los parámetros como formulario con corchetes: { a: { b: [1] } } → a[b][0]=1.
function aplanar(valor, prefijo, salida) {
  if (valor == null) return salida;
  if (Array.isArray(valor)) valor.forEach((v, i) => aplanar(v, `${prefijo}[${i}]`, salida));
  else if (typeof valor === 'object') Object.entries(valor).forEach(([k, v]) => aplanar(v, prefijo ? `${prefijo}[${k}]` : k, salida));
  else salida.append(prefijo, String(valor));
  return salida;
}

export async function stripe(ruta, { metodo = 'GET', datos } = {}) {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) throw new Error('Falta STRIPE_SECRET_KEY');
  const consulta = metodo === 'GET' && datos ? `?${aplanar(datos, '', new URLSearchParams())}` : '';
  const r = await fetch(`https://api.stripe.com/v1${ruta}${consulta}`, {
    method: metodo,
    headers: { authorization: `Bearer ${clave}`, 'content-type': 'application/x-www-form-urlencoded' },
    ...(metodo !== 'GET' && datos && { body: aplanar(datos, '', new URLSearchParams()).toString() }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(`Stripe ${r.status}: ${json?.error?.message || 'error'}`);
  return json;
}

// Tabla accesos_herramientas con el service role (la app solo lee las suyas, por RLS).
export async function supabase(ruta, { metodo = 'GET', datos, prefer } = {}) {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
  const r = await fetch(`${URL_CUENTAS}/rest/v1/${ruta}`, {
    method: metodo,
    headers: { apikey: clave, authorization: `Bearer ${clave}`, 'content-type': 'application/json', ...(prefer && { prefer }) },
    ...(datos && { body: JSON.stringify(datos) }),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

export async function usuarioDe(req) {
  const authorization = req.headers.authorization || '';
  if (!authorization) return null;
  const yo = await fetch(`${URL_CUENTAS}/auth/v1/user`, { headers: { apikey: CLAVE_PUBLICA, authorization } });
  return yo.ok ? yo.json() : null;
}

// NIF/CIF: copia de anti-agente/electron/nif.cjs (si cambias una, cambia la otra). Los españoles por su control;
// los de otros países de la UE solo por forma, porque Stripe los comprueba en VIES al guardarlos.
const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';
const PAISES_UE = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
function cifValido(c) {
  const d = c.slice(1, 8).split('').map(Number);
  const suma = d.reduce((s, n, i) => s + (i % 2 ? n : Math.floor((n * 2) / 10) + ((n * 2) % 10)), 0);
  const digito = (10 - (suma % 10)) % 10;
  const control = c[8];
  if ('PQRSNW'.includes(c[0])) return control === 'JABCDEFGHI'[digito];
  if ('ABEH'.includes(c[0])) return control === String(digito);
  return control === String(digito) || control === 'JABCDEFGHI'[digito];
}
export function validarNif(texto) {
  let v = String(texto || '').toUpperCase().replace(/[\s.\-/]/g, '');
  if (v.startsWith('ES') && v.length === 11) v = v.slice(2);
  if (/^\d{8}[A-Z]$/.test(v)) return v[8] === LETRAS_DNI[Number(v.slice(0, 8)) % 23] ? { valor: v, tipo: 'es_cif' } : null;
  if (/^[XYZKLM]\d{7}[A-Z]$/.test(v)) {
    const n = Number(('XYZ'.includes(v[0]) ? 'XYZ'.indexOf(v[0]) : '') + v.slice(1, 8));
    return v[8] === LETRAS_DNI[n % 23] ? { valor: v, tipo: 'es_cif' } : null;
  }
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(v)) return cifValido(v) ? { valor: v, tipo: 'es_cif' } : null;
  if (PAISES_UE.includes(v.slice(0, 2)) && /^[A-Z0-9]{2,12}$/.test(v.slice(2))) return { valor: v, tipo: 'eu_vat' };
  return null;
}

// Empresa y NIF de la cuenta (los pide la app al registrarse). null si faltan o no valen.
export function fiscalDe(usuario) {
  const a = usuario?.user_metadata?.anti_agente || {};
  const empresa = String(a.empresa || '').trim();
  const nif = validarNif(a.nif);
  return empresa && nif ? { empresa, nif } : null;
}

// Raúl eligió precios con el IVA incluido: un 21 % fijo («inclusive»), sin Stripe Tax. Se crea una vez y se reutiliza.
let iva = null;
export async function ivaIncluido() {
  if (iva) return iva;
  const { data } = await stripe('/tax_rates', { datos: { active: true, inclusive: true, limit: 100 } });
  iva = data.find((t) => t.metadata?.anti_agente === 'iva21')?.id;
  iva ||= (await stripe('/tax_rates', {
    metodo: 'POST',
    datos: { display_name: 'IVA', percentage: 21, inclusive: true, country: 'ES', jurisdiction: 'ES', tax_type: 'vat', description: 'IVA 21 % incluido (Anti-Agente)', metadata: { anti_agente: 'iva21' } },
  })).id;
  return iva;
}

// El cliente de Stripe de la cuenta, con su empresa y su NIF al día (salen en la factura).
export async function clienteDe(usuario, fiscal, existente) {
  let id = existente;
  if (!id) {
    const { data } = await stripe('/customers', { datos: { email: usuario.email, limit: 100 } });
    id = data.find((c) => c.metadata?.usuario === usuario.id)?.id;
  }
  const datos = { name: fiscal.empresa, metadata: { usuario: usuario.id }, preferred_locales: ['es'] };
  id = (await stripe(id ? `/customers/${id}` : '/customers', { metodo: 'POST', datos: id ? datos : { ...datos, email: usuario.email } })).id;
  const { data: nifs } = await stripe(`/customers/${id}/tax_ids`, { datos: { limit: 10 } });
  if (!nifs.some((t) => t.value === fiscal.nif.valor)) {
    for (const t of nifs) await stripe(`/customers/${id}/tax_ids/${t.id}`, { metodo: 'DELETE' });
    await stripe(`/customers/${id}/tax_ids`, { metodo: 'POST', datos: { type: fiscal.nif.tipo, value: fiscal.nif.valor } });
  }
  return id;
}
