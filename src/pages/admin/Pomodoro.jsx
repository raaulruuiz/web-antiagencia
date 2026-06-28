import { useEffect, useState, useRef } from 'react';
import { BACKEND_URL, LOOM_API_KEY } from '@/lib/config';

const API_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': LOOM_API_KEY,
};

function formatCountdown(endsAt) {
  if (!endsAt) return '--:--';
  const diff = Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
  const m = Math.floor(diff / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Pomodoro() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [countdown, setCountdown] = useState('--:--');
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  async function fetchState() {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoro`, { headers: API_HEADERS });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar estado');
      setState(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (state?.active && state?.ends_at) {
      setCountdown(formatCountdown(state.ends_at));
      intervalRef.current = setInterval(() => {
        const val = formatCountdown(state.ends_at);
        setCountdown(val);
        if (val === '00:00') {
          clearInterval(intervalRef.current);
          fetchState();
        }
      }, 1000);
    } else {
      setCountdown('--:--');
    }
    return () => clearInterval(intervalRef.current);
  }, [state?.active, state?.ends_at]);

  function notifyExtension() {
    window.dispatchEvent(new CustomEvent('pomodoroRefresh'));
  }

  async function handleStart() {
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoro/start`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ work_minutes: 25, break_minutes: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar');
      await fetchState();
      notifyExtension();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStop() {
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoro/stop`, {
        method: 'POST',
        headers: API_HEADERS,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al parar');
      await fetchState();
      notifyExtension();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddUrl() {
    const domain = newDomain.trim();
    if (!domain) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoro/urls`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al añadir URL');
      setNewDomain('');
      await fetchState();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUrl(domain) {
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoro/urls/${encodeURIComponent(domain)}`, {
        method: 'DELETE',
        headers: API_HEADERS,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar URL');
      await fetchState();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold mb-6">Pomodoro</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-800 bg-red-950 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Panel de control */}
      <div className="border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Estado</p>
            <p className="text-base font-medium">
              {state?.active ? 'Sesion activa — trabajando' : 'Inactivo'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-400 mb-1">Tiempo restante</p>
            <p className="text-3xl font-mono font-bold">{countdown}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {state?.active ? (
            <button
              onClick={handleStop}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Parando...' : 'Parar sesion'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Iniciando...' : 'Iniciar Pomodoro (25 min)'}
            </button>
          )}
        </div>

        {state?.active && state?.ends_at && (
          <p className="mt-3 text-xs text-zinc-500">
            Termina a las {new Date(state.ends_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* URLs bloqueadas */}
      <div className="border border-zinc-800 rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">URLs bloqueadas</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
            placeholder="ejemplo.com"
            className="flex-1 px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleAddUrl}
            disabled={actionLoading || !newDomain.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Añadir
          </button>
        </div>

        {state?.blocked_urls?.length === 0 || !state?.blocked_urls ? (
          <p className="text-sm text-zinc-500">No hay URLs bloqueadas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-normal">Dominio</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {state.blocked_urls.map(domain => (
                <tr key={domain} className="border-b border-zinc-900">
                  <td className="py-2 text-zinc-200">{domain}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDeleteUrl(domain)}
                      disabled={actionLoading}
                      className="px-3 py-1 rounded text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
