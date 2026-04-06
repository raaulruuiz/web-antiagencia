import { useEffect, useRef } from 'react';
import { BACKEND_URL } from './config';

function getSessionId() {
  let id = localStorage.getItem('_session_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('_session_id', id); }
  return id;
}

/**
 * Asigna variante A/B (50/50) y registra la visita.
 * @param {string} testId  - identificador del test (ej. 'home-hero')
 * @param {string} url     - URL de la página (ej. '/')
 * @returns {'A'|'B'}
 */
export function useABTest(testId, url) {
  const key = `_ab_${testId}`;
  let variant = localStorage.getItem(key);
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(key, variant);
  }

  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch(`${BACKEND_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, session_id: getSessionId(), variant }),
    }).catch(() => {});
  }, []);

  return variant;
}

/**
 * Registra una conversión (envío de formulario) para el test activo.
 */
export function trackConversion(testId, url) {
  const variant = localStorage.getItem(`_ab_${testId}`);
  if (!variant) return;
  fetch(`${BACKEND_URL}/track-conversion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_id: testId, variant, session_id: getSessionId(), url }),
  }).catch(() => {});
}
