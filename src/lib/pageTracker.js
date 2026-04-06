import { BACKEND_URL as BACKEND } from './config';

function getSessionId() {
  let id = localStorage.getItem('_session_id');
  if (!id) {
    id = crypto.randomUUID();
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
