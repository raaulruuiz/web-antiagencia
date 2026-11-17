import { BACKEND_URL as BACKEND } from './config';

import { leerConsentimiento } from './consentimiento';

// Sin consentimiento de cookies no se guarda nada en el navegador: el id vive solo
// en memoria mientras dura la visita. Con consentimiento se guarda como antes.
let idEnMemoria = null;

function getSessionId() {
  if (leerConsentimiento() !== 'accepted') {
    if (!idEnMemoria) idEnMemoria = crypto.randomUUID();
    return idEnMemoria;
  }
  let id = localStorage.getItem('_session_id');
  if (!id) {
    id = idEnMemoria || crypto.randomUUID();
    localStorage.setItem('_session_id', id);
  }
  return id;
}

export async function trackPageView(pathname) {
  const url = pathname.toLowerCase();
  if (url.startsWith('/admin') || url.startsWith('/loom')) return;
  try {
    await fetch(`${BACKEND}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, session_id: getSessionId() }),
    });
  } catch (_) {}
}
