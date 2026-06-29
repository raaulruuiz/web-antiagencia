import { useEffect, useState, useCallback } from 'react';
import { BACKEND_URL, LOOM_API_KEY } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from '@/pages/admin/AdminLayout';

const WEEKDAYS = [
  { key: 'monday',    label: 'Lun' },
  { key: 'tuesday',   label: 'Mar' },
  { key: 'wednesday', label: 'Mié' },
  { key: 'thursday',  label: 'Jue' },
  { key: 'friday',    label: 'Vie' },
  { key: 'saturday',  label: 'Sáb' },
  { key: 'sunday',    label: 'Dom' },
];

const DAY_NAMES_ES = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};

const JS_DAY_TO_KEY = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

function todayISO() { return new Date().toISOString().slice(0, 10); }

function isActiveNow(pomodoro) {
  if (pomodoro.enabled === false) return false;
  if (pomodoro.is_paused) return false;
  const now = new Date();
  const dayName = JS_DAY_TO_KEY[now.getDay()];
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);
  const { days = [], time_ranges = [] } = pomodoro.schedule || {};
  if (!days.length || !time_ranges.length) return false;
  if (!days.includes(dayName) && !days.includes(dateStr)) return false;
  return time_ranges.some(r => timeStr >= r.start && timeStr <= r.end);
}

function formatSchedule(schedule) {
  const { days = [], time_ranges = [] } = schedule || {};
  if (!days.length && !time_ranges.length) return 'Sin horario';
  const dayPart = days.map(d =>
    /^\d{4}-\d{2}-\d{2}$/.test(d) ? (d === todayISO() ? 'Solo hoy' : d) : (DAY_NAMES_ES[d] || d)
  ).join(', ');
  const rangePart = time_ranges.map(r => `${r.start}–${r.end}`).join(' · ');
  if (dayPart && rangePart) return `${dayPart} · ${rangePart}`;
  return dayPart || rangePart || 'Sin horario';
}

function emptyForm(isAdmin) {
  return { name: '', days: [], time_ranges: [{ start: '09:00', end: '17:00' }], blocked_urls: [], is_universal: isAdmin, pause_method: { type: 'none' } };
}

// ─── Math operations ──────────────────────────────────────────────────────────

function generateOp(difficulty) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  if (difficulty <= 2) {
    const a = rng(1, difficulty * 10), b = rng(1, difficulty * 10);
    return { q: `${a} + ${b}`, a: a + b };
  }
  if (difficulty <= 4) {
    const a = rng(2, 9), b = rng(2, 9);
    if (Math.random() > 0.5) return { q: `${a} × ${b}`, a: a * b };
    const s = rng(15, 50), sub = rng(1, s - 1);
    return { q: `${s} − ${sub}`, a: s - sub };
  }
  if (difficulty <= 6) {
    const a = rng(3, 9), b = rng(3, 9), c = rng(1, 15);
    return Math.random() > 0.5
      ? { q: `${a} × ${b} + ${c}`, a: a * b + c }
      : { q: `${a} × ${b} − ${c}`, a: a * b - c };
  }
  if (difficulty <= 8) {
    const a = rng(3, 9), b = rng(3, 9), c = rng(2, 9), d = rng(1, 10);
    return { q: `(${a} + ${b}) × ${c} − ${d}`, a: (a + b) * c - d };
  }
  const a = rng(4, 12), b = rng(4, 12), c = rng(2, 9), d = rng(2, 9);
  return { q: `${a} × ${b} − ${c} × ${d}`, a: a * b - c * d };
}

function generateOperations(count, ascending) {
  return Array.from({ length: count }, (_, i) => {
    const difficulty = ascending ? Math.round(1 + (9 * i) / Math.max(count - 1, 1)) : 5;
    return generateOp(difficulty);
  });
}

// ─── Strict mode helpers ──────────────────────────────────────────────────────

const METHOD_LEVEL = { none: 0, email: 1, operations: 2 };

function totalMinutes(ranges) {
  return (ranges || []).reduce((sum, r) => {
    const [sh, sm] = (r.start || '00:00').split(':').map(Number);
    const [eh, em] = (r.end || '00:00').split(':').map(Number);
    return sum + Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  }, 0);
}

function isMoreLenient(orig, edited) {
  if (totalMinutes(edited.time_ranges) < totalMinutes(orig.time_ranges)) return true;
  if ((edited.days || []).length < (orig.days || []).length) return true;
  const origUrls = new Set((orig.blocked_urls || []).map(u => u.url));
  const editUrls = new Set((edited.blocked_urls || []).map(u => u.url));
  for (const url of origUrls) { if (!editUrls.has(url)) return true; }
  for (const eu of (edited.blocked_urls || [])) {
    const ou = (orig.blocked_urls || []).find(u => u.url === eu.url);
    if (ou && (ou.wildcard ?? true) && !(eu.wildcard ?? true)) return true;
  }
  const oLevel = METHOD_LEVEL[orig.pause_method?.type ?? 'none'];
  const eLevel = METHOD_LEVEL[edited.pause_method?.type ?? 'none'];
  if (eLevel < oLevel) return true;
  return false;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${value ? 'bg-white' : 'bg-zinc-700'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${value ? 'left-4 bg-black' : 'left-0.5 bg-zinc-400'}`} />
    </button>
  );
}

// ─── Install modal ────────────────────────────────────────────────────────────

function InstallModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-md mx-4 border border-zinc-800 rounded-xl p-6" style={{ backgroundColor: '#111' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg leading-none">✕</button>
        <h2 className="text-base font-semibold mb-1">Instalar Pomodoro Blocker</h2>
        <p className="text-sm text-zinc-400 mb-5">La extensión bloquea las URLs durante las sesiones activas.</p>
        <ol className="space-y-4 text-sm text-zinc-300 mb-6">
          {[
            <><a href="/pomodoro-extension.zip" download className="underline text-white hover:text-zinc-300">Descarga la extensión</a> y descomprime el ZIP.</>,
            <>Abre Chrome y ve a <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">chrome://extensions</code></>,
            <>Activa el <strong>Modo desarrollador</strong> (arriba a la derecha).</>,
            <>Haz clic en <strong>Cargar descomprimida</strong> y selecciona la carpeta <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">pomodoro-extension</code>.</>,
            <>Listo. La extensión se activa automáticamente según los horarios.</>,
          ].map((content, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-600 flex items-center justify-center text-xs text-zinc-400">{i + 1}</span>
              <span>{content}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose} className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors">
          Entendido
        </button>
      </div>
    </div>
  );
}

// ─── URL list ─────────────────────────────────────────────────────────────────

function UrlList({ urls, onChange }) {
  const [input, setInput] = useState('');

  function add() {
    const domain = input.trim();
    if (!domain || urls.some(u => u.url === domain)) return;
    onChange([...urls, { url: domain, wildcard: true }]);
    setInput('');
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="ejemplo.com"
          className="flex-1 px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        <button onClick={add} disabled={!input.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-40">
          Añadir
        </button>
      </div>
      {urls.length === 0 ? (
        <p className="text-sm text-zinc-600">Añade las URLs que quieras bloquear.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-2 text-zinc-500 font-normal">Dominio</th>
              <th className="text-left py-2 text-zinc-500 font-normal">Modo</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {urls.map(({ url, wildcard }) => (
              <tr key={url} className="border-b border-zinc-900">
                <td className="py-2.5 text-zinc-200">{url}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <Toggle value={wildcard ?? true} onChange={v => onChange(urls.map(u => u.url === url ? { ...u, wildcard: v } : u))} />
                    <span className="text-xs text-zinc-500">{wildcard ? 'Todo el dominio' : 'URL exacta'}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <button onClick={() => onChange(urls.filter(u => u.url !== url))}
                    className="px-3 py-1 rounded text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Pause Method Section ─────────────────────────────────────────────────────

const PAUSE_METHODS = [
  { key: 'none',       label: 'Ninguna',      desc: 'Pausar sin restricciones.' },
  { key: 'email',      label: 'Email',         desc: 'Se enviará un código de 6 caracteres al correo configurado.' },
  { key: 'operations', label: 'Operaciones',   desc: 'Resuelve operaciones matemáticas antes de pausar.' },
];

function PauseMethodSection({ value, onChange }) {
  const type = value?.type || 'none';
  return (
    <div className="border border-zinc-800 rounded-xl p-5">
      <p className="text-sm font-medium text-zinc-300 mb-4">Método de Pausa</p>
      <div className="space-y-2 mb-4">
        {PAUSE_METHODS.map(m => (
          <button key={m.key} onClick={() => onChange({ ...value, type: m.key })}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              type === m.key
                ? 'border-white bg-zinc-800 text-white'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}>
            <span className="font-medium text-sm">{m.label}</span>
            <p className="text-xs text-zinc-500 mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>
      {type === 'email' && (
        <div className="pt-3 border-t border-zinc-800">
          <label className="block text-xs text-zinc-500 mb-1.5">Correo que recibirá el código</label>
          <input
            type="email"
            value={value?.email ?? ''}
            onChange={e => onChange({ ...value, email: e.target.value })}
            placeholder="otra.persona@ejemplo.com"
            className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <p className="mt-1.5 text-xs text-zinc-600">Esta persona tendrá que darte el código para que puedas pausar.</p>
        </div>
      )}
      {type === 'operations' && (
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Número de operaciones</label>
            <input type="number" min="1" max="50"
              value={value?.count ?? 5}
              onChange={e => onChange({ ...value, count: Math.max(1, Math.min(50, parseInt(e.target.value) || 5)) })}
              className="w-24 px-3 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={value?.ascending ?? true}
              onChange={e => onChange({ ...value, ascending: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 accent-white"
            />
            <span className="text-sm text-zinc-300">Dificultad ascendente</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={value?.restart_on_fail ?? false}
              onChange={e => onChange({ ...value, restart_on_fail: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 accent-white"
            />
            <span className="text-sm text-zinc-300">Reiniciar al fallo</span>
          </label>
        </div>
      )}
    </div>
  );
}

// ─── Pause Modal ──────────────────────────────────────────────────────────────

function PauseModal({ pomodoro, onClose, onSuccess, buildHeaders }) {
  const method = pomodoro.pause_method?.type || 'none';
  const [step, setStep] = useState('initial');
  const [ops] = useState(() =>
    method === 'operations'
      ? generateOperations(pomodoro.pause_method?.count ?? 5, pomodoro.pause_method?.ascending ?? true)
      : []
  );
  const [opIdx, setOpIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function doPause(body = {}) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${pomodoro.id}/pause`, {
        method: 'POST', headers: buildHeaders(), body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      onSuccess();
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  async function requestCode() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${pomodoro.id}/pause-request`, {
        method: 'POST', headers: buildHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setSentEmail(data.email || '');
      setStep('code');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer() {
    const op = ops[opIdx];
    const userAns = parseInt(answer.trim(), 10);
    if (isNaN(userAns) || userAns !== op.a) {
      if (pomodoro.pause_method?.restart_on_fail) {
        setOpIdx(0); setAnswer('');
        setErr('Incorrecto. Empezando desde el principio.');
      } else {
        setAnswer('');
        setErr('Respuesta incorrecta, inténtalo de nuevo.');
      }
      return;
    }
    setErr(null);
    setAnswer('');
    if (opIdx + 1 >= ops.length) {
      doPause();
    } else {
      setOpIdx(i => i + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-sm mx-4 border border-zinc-800 rounded-xl p-6" style={{ backgroundColor: '#111' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white leading-none">✕</button>
        <h2 className="text-base font-semibold mb-1">Pausar Pomodoro</h2>
        <p className="text-sm text-zinc-500 mb-5">{pomodoro.name}</p>

        {err && <p className="mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">{err}</p>}

        {/* None */}
        {method === 'none' && (
          <div>
            <p className="text-sm text-zinc-300 mb-5">¿Confirmas que quieres pausar este Pomodoro?</p>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={() => doPause()} disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
                {loading ? 'Pausando…' : 'Pausar'}
              </button>
            </div>
          </div>
        )}

        {/* Email — step initial */}
        {method === 'email' && step === 'initial' && (
          <div>
            <p className="text-sm text-zinc-300 mb-5">Se enviará un código de verificación a tu correo de Antiagencia.</p>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={requestCode} disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
                {loading ? 'Enviando…' : 'Enviar código'}
              </button>
            </div>
          </div>
        )}

        {/* Email — step code */}
        {method === 'email' && step === 'code' && (
          <div>
            <p className="text-sm text-zinc-400 mb-4">
              Código enviado a <span className="text-white">{sentEmail}</span>.
            </p>
            <input type="text" value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && doPause({ code })}
              maxLength={6} placeholder="XXXXXX"
              className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-center tracking-widest font-mono mb-4"
              autoFocus
            />
            <button onClick={() => doPause({ code })} disabled={loading || code.length < 6}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
              {loading ? 'Verificando…' : 'Verificar y pausar'}
            </button>
          </div>
        )}

        {/* Operations */}
        {method === 'operations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-500">Operación {opIdx + 1} de {ops.length}</span>
              <div className="flex gap-1">
                {ops.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < opIdx ? 'bg-green-400' : i === opIdx ? 'bg-white' : 'bg-zinc-700'}`} />
                ))}
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-center mb-6">{ops[opIdx]?.q} = ?</p>
            <input type="number" value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkAnswer()}
              placeholder="Tu respuesta"
              className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-center mb-4"
              autoFocus
            />
            <button onClick={checkAnswer} disabled={loading || !answer.trim()}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
              {loading ? 'Pausando…' : opIdx + 1 < ops.length ? 'Siguiente →' : 'Pausar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Strict Mode Config Modal ─────────────────────────────────────────────────

function StrictModeConfigModal({ existingMethod, onConfirm, onClose }) {
  const [method, setMethod] = useState(existingMethod || { type: 'none' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-md mx-4 border border-zinc-800 rounded-xl p-6" style={{ backgroundColor: '#111' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white leading-none">✕</button>
        <h2 className="text-base font-semibold mb-1">Activar Modo Estricto</h2>
        <p className="text-sm text-zinc-500 mb-5">Configura la restricción necesaria para realizar acciones permisivas.</p>
        <PauseMethodSection value={method} onChange={setMethod} />
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={() => onConfirm(method)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors">
            Activar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Strict Verify Modal ──────────────────────────────────────────────────────

function StrictVerifyModal({ strictMode, title, onPass, onClose, buildHeaders }) {
  const method = strictMode.method?.type || 'none';
  const [step, setStep] = useState('initial');
  const [ops] = useState(() =>
    method === 'operations'
      ? generateOperations(strictMode.method?.count ?? 5, strictMode.method?.ascending ?? true)
      : []
  );
  const [opIdx, setOpIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/strict-mode/request-code`, {
        method: 'POST', headers: buildHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setSentEmail(data.email || '');
      setStep('code');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  async function verifyCode() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/strict-mode/verify-code`, {
        method: 'POST', headers: buildHeaders(), body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      onPass();
    } catch (e) { setErr(e.message); setLoading(false); }
  }

  function checkAnswer() {
    const op = ops[opIdx];
    const val = parseInt(answer.trim(), 10);
    if (isNaN(val) || val !== op.a) {
      if (strictMode.method?.restart_on_fail) { setOpIdx(0); setAnswer(''); setErr('Incorrecto. Empezando desde el principio.'); }
      else { setAnswer(''); setErr('Respuesta incorrecta.'); }
      return;
    }
    setErr(null); setAnswer('');
    if (opIdx + 1 >= ops.length) { onPass(); }
    else { setOpIdx(i => i + 1); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-sm mx-4 border border-zinc-800 rounded-xl p-6" style={{ backgroundColor: '#111' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white leading-none">✕</button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full border border-red-700 bg-red-950 text-red-300">Modo estricto</span>
        </div>
        <h2 className="text-base font-semibold mb-1">{title}</h2>
        <p className="text-sm text-zinc-500 mb-5">Necesitas pasar la verificación configurada.</p>

        {err && <p className="mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">{err}</p>}

        {method === 'none' && (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
            <button onClick={onPass} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors">Confirmar</button>
          </div>
        )}

        {method === 'email' && step === 'initial' && (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
            <button onClick={requestCode} disabled={loading} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
              {loading ? 'Enviando…' : 'Enviar código'}
            </button>
          </div>
        )}

        {method === 'email' && step === 'code' && (
          <div>
            <p className="text-sm text-zinc-400 mb-4">Código enviado a <span className="text-white">{sentEmail}</span>.</p>
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && verifyCode()} maxLength={6} placeholder="XXXXXX"
              className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-center tracking-widest font-mono mb-4" autoFocus />
            <button onClick={verifyCode} disabled={loading || code.length < 6}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
              {loading ? 'Verificando…' : 'Verificar'}
            </button>
          </div>
        )}

        {method === 'operations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-500">Operación {opIdx + 1} de {ops.length}</span>
              <div className="flex gap-1">
                {ops.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < opIdx ? 'bg-green-400' : i === opIdx ? 'bg-white' : 'bg-zinc-700'}`} />)}
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-center mb-6">{ops[opIdx]?.q} = ?</p>
            <input type="number" value={answer} onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="Tu respuesta"
              className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-center mb-4" autoFocus />
            <button onClick={checkAnswer} disabled={!answer.trim()}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
              {opIdx + 1 < ops.length ? 'Siguiente →' : 'Confirmar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function PomodoroForm({ initial, isAdmin, onSave, onBack, saving }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const isSoloHoy = form.days.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(form.days[0]);
  const weekdayDays = form.days.filter(d => !/^\d{4}-\d{2}-\d{2}$/.test(d));

  function toggleWeekday(key) {
    setForm(f => {
      const base = f.days.filter(d => !/^\d{4}-\d{2}-\d{2}$/.test(d));
      const exists = base.includes(key);
      return { ...f, days: exists ? base.filter(d => d !== key) : [...base, key] };
    });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (form.days.length === 0) e.days = 'Selecciona al menos un día';
    if (form.time_ranges.length === 0) e.ranges = 'Añade al menos una franja horaria';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(form);
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
        ← Volver
      </button>

      <div className="space-y-5">
        {/* Nombre + tipo (solo admin) */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre</label>
          <input type="text" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Sesión de trabajo, Sin redes sociales…"
            className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}

          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  {form.is_universal ? 'Pomodoro Universal' : 'Pomodoro Privado'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {form.is_universal
                    ? 'Se activa para todos los usuarios con la extensión'
                    : 'Solo visible para ti, no afecta a otros usuarios'}
                </p>
              </div>
              <Toggle value={form.is_universal} onChange={v => setForm(f => ({ ...f, is_universal: v }))} />
            </div>
          )}
        </div>

        {/* Horario */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-300 mb-4">Horario</p>

          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Días</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(({ key, label }) => {
                const active = weekdayDays.includes(key) && !isSoloHoy;
                return (
                  <button key={key} onClick={() => toggleWeekday(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active ? 'border-white bg-white text-black' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}>
                    {label}
                  </button>
                );
              })}
              <button
                onClick={() => setForm(f => ({ ...f, days: [todayISO()] }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSoloHoy ? 'border-white bg-white text-black' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}>
                Solo hoy
              </button>
            </div>
            {errors.days && <p className="mt-1.5 text-xs text-red-400">{errors.days}</p>}
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Franjas horarias</p>
            <div className="space-y-2">
              {form.time_ranges.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="time" value={r.start}
                    onChange={e => setForm(f => ({ ...f, time_ranges: f.time_ranges.map((x, idx) => idx === i ? { ...x, start: e.target.value } : x) }))}
                    className="px-2 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                  />
                  <span className="text-zinc-600 text-sm">→</span>
                  <input type="time" value={r.end}
                    onChange={e => setForm(f => ({ ...f, time_ranges: f.time_ranges.map((x, idx) => idx === i ? { ...x, end: e.target.value } : x) }))}
                    className="px-2 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                  />
                  {form.time_ranges.length > 1 && (
                    <button onClick={() => setForm(f => ({ ...f, time_ranges: f.time_ranges.filter((_, idx) => idx !== i) }))}
                      className="text-zinc-600 hover:text-zinc-400 text-lg leading-none px-1">×</button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, time_ranges: [...f.time_ranges, { start: '09:00', end: '17:00' }] }))}
              className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              + Añadir franja
            </button>
            {errors.ranges && <p className="mt-1.5 text-xs text-red-400">{errors.ranges}</p>}
          </div>
        </div>

        {/* URLs */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-300 mb-4">URLs bloqueadas</p>
          <UrlList urls={form.blocked_urls} onChange={urls => setForm(f => ({ ...f, blocked_urls: urls }))} />
        </div>

        {/* Pause method */}
        <PauseMethodSection
          value={form.pause_method}
          onChange={pm => setForm(f => ({ ...f, pause_method: pm }))}
        />

        <button onClick={handleSave} disabled={saving}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50">
          {saving ? 'Guardando…' : 'Guardar Pomodoro'}
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Pomodoro() {
  const { role } = useAdmin();
  const isAdmin = role === 'admin';

  const [userId, setUserId] = useState(null);
  const [pomodoros, setPomodoros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [pauseModal, setPauseModal] = useState(null);
  const [strictMode, setStrictMode] = useState({ enabled: false, method: { type: 'none' } });
  const [strictConfigModal, setStrictConfigModal] = useState(false);
  const [strictVerifyModal, setStrictVerifyModal] = useState(null); // { title, onPass }
  const [editingOriginal, setEditingOriginal] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  function buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': LOOM_API_KEY,
      ...(userId ? { 'x-user-id': userId } : {}),
      'x-user-role': role,
    };
  }

  const fetchPomodoros = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros`, { headers: buildHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setPomodoros(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  useEffect(() => { fetchPomodoros(); }, [fetchPomodoros]);

  const loadStrictMode = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/strict-mode`, { headers: buildHeaders() });
      if (!res.ok) return;
      setStrictMode(await res.json());
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  useEffect(() => { loadStrictMode(); }, [loadStrictMode]);

  useEffect(() => {
    const t = setInterval(() => setPomodoros(p => p.map(x => ({ ...x, is_active: isActiveNow(x) }))), 60000);
    return () => clearInterval(t);
  }, []);

  function notifyExtension() {
    window.dispatchEvent(new CustomEvent('pomodoroRefresh'));
  }

  async function saveStrictMode(settings) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/strict-mode`, {
        method: 'POST', headers: buildHeaders(), body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      setStrictMode(settings);
    } catch { setError('Error al guardar modo estricto'); }
  }

  function handleStrictModeToggle() {
    if (strictMode.enabled) {
      setStrictVerifyModal({
        title: 'Desactivar modo estricto',
        onPass: async () => {
          await saveStrictMode({ ...strictMode, enabled: false });
          setStrictVerifyModal(null);
        },
      });
    } else {
      setStrictConfigModal(true);
    }
  }

  async function handleSave(form) {
    if (strictMode.enabled && editing && editingOriginal && isMoreLenient(editingOriginal, form)) {
      setStrictVerifyModal({
        title: 'Guardar cambios (más permisivos)',
        onPass: () => { setStrictVerifyModal(null); doSave(form); },
      });
      return;
    }
    await doSave(form);
  }

  async function doSave(form) {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        schedule: { days: form.days, time_ranges: form.time_ranges },
        blocked_urls: form.blocked_urls,
        is_universal: isAdmin ? form.is_universal : false,
        pause_method: form.pause_method || { type: 'none' },
      };
      const url = editing ? `${BACKEND_URL}/admin/pomodoros/${editing.id}` : `${BACKEND_URL}/admin/pomodoros`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: buildHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      await fetchPomodoros();
      notifyExtension();
      setView('list');
      setEditing(null);
      setEditingOriginal(null);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleToggle(id, currentlyEnabled) {
    if (strictMode.enabled && currentlyEnabled) {
      setStrictVerifyModal({
        title: 'Desactivar Pomodoro',
        onPass: () => { setStrictVerifyModal(null); doToggle(id); },
      });
      return;
    }
    await doToggle(id);
  }

  async function doToggle(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${id}/toggle`, {
        method: 'POST', headers: buildHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setPomodoros(p => p.map(x => x.id === id ? { ...x, enabled: data.enabled } : x));
      notifyExtension();
    } catch (err) { setError(err.message); }
  }

  async function handleResumePom(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${id}/resume`, {
        method: 'POST', headers: buildHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reanudar');
      setPomodoros(p => p.map(x => x.id === id ? { ...x, is_paused: false } : x));
      notifyExtension();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (strictMode.enabled) {
      setStrictVerifyModal({
        title: 'Eliminar Pomodoro',
        onPass: () => { setStrictVerifyModal(null); doDelete(id); },
      });
      setConfirmDeleteId(null);
      return;
    }
    await doDelete(id);
  }

  async function doDelete(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${id}`, { method: 'DELETE', headers: buildHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setPomodoros(p => p.filter(x => x.id !== id));
      setConfirmDeleteId(null);
      notifyExtension();
    } catch (err) { setError(err.message); }
  }

  function openPauseModal(p) {
    if (strictMode.enabled) {
      setStrictVerifyModal({
        title: `Pausar "${p.name}"`,
        onPass: () => { setStrictVerifyModal(null); doPomPause(p.id); },
      });
      return;
    }
    setPauseModal(p);
  }

  async function doPomPause(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${id}/pause`, {
        method: 'POST', headers: buildHeaders(), body: JSON.stringify({ strict_mode_bypass: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setPomodoros(p => p.map(x => x.id === id ? { ...x, is_paused: true } : x));
      notifyExtension();
    } catch (err) { setError(err.message); }
  }

  function canEdit(p) {
    if (isAdmin) return true;
    return !p.is_universal && p.created_by === userId;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const initialForm = editing ? {
    name: editing.name,
    days: editing.schedule?.days || [],
    time_ranges: editing.schedule?.time_ranges || [{ start: '09:00', end: '17:00' }],
    blocked_urls: editing.blocked_urls || [],
    is_universal: editing.is_universal ?? true,
    pause_method: editing.pause_method || { type: 'none' },
  } : emptyForm(isAdmin);

  return (
    <div className="p-6 max-w-2xl mx-auto" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}
      {pauseModal && (
        <PauseModal
          pomodoro={pauseModal}
          onClose={() => setPauseModal(null)}
          onSuccess={() => {
            setPomodoros(p => p.map(x => x.id === pauseModal.id ? { ...x, is_paused: true } : x));
            setPauseModal(null);
            notifyExtension();
          }}
          buildHeaders={buildHeaders}
        />
      )}
      {strictConfigModal && (
        <StrictModeConfigModal
          existingMethod={strictMode.method}
          onConfirm={async (method) => {
            await saveStrictMode({ enabled: true, method });
            setStrictConfigModal(false);
          }}
          onClose={() => setStrictConfigModal(false)}
        />
      )}
      {strictVerifyModal && (
        <StrictVerifyModal
          strictMode={strictMode}
          title={strictVerifyModal.title}
          onPass={strictVerifyModal.onPass}
          onClose={() => setStrictVerifyModal(null)}
          buildHeaders={buildHeaders}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pomodoro</h1>
        <button onClick={() => setShowInstall(true)}
          className="text-sm text-white underline underline-offset-2 hover:text-zinc-300 transition-colors mt-1">
          📦 Instalar extension
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-800 bg-red-950 text-red-300 text-sm">{error}</div>
      )}

      {(view === 'create' || view === 'edit') && (
        <PomodoroForm
          key={editing?.id || 'new'}
          initial={initialForm}
          isAdmin={isAdmin}
          onSave={handleSave}
          onBack={() => { setEditing(null); setView('list'); }}
          saving={saving}
        />
      )}

      {view === 'list' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-400">
              {pomodoros.length === 0 ? 'No hay Pomodoros.' : `${pomodoros.length} Pomodoro${pomodoros.length !== 1 ? 's' : ''}`}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={handleStrictModeToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  strictMode.enabled
                    ? 'border-red-700 bg-red-950 text-red-300 hover:bg-red-900'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${strictMode.enabled ? 'bg-red-400' : 'bg-zinc-600'}`} />
                {strictMode.enabled ? 'Modo estricto activado' : 'Modo estricto desactivado'}
              </button>
              <button onClick={() => { setEditing(null); setView('create'); }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-colors">
                + Crear Pomodoro
              </button>
            </div>
          </div>

          {pomodoros.length === 0 ? (
            <div className="border border-zinc-800 border-dashed rounded-xl p-10 text-center">
              <p className="text-zinc-500 text-sm">Crea tu primer Pomodoro para empezar a bloquear URLs según horario.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pomodoros.map(p => (
                <div key={p.id} className={`border border-zinc-800 rounded-xl p-5 transition-opacity ${p.enabled === false ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {canEdit(p) && (
                          <Toggle value={p.enabled !== false} onChange={() => handleToggle(p.id, p.enabled !== false)} />
                        )}
                        <span className="font-medium text-base truncate">{p.name}</span>
                        {/* Active/Paused/Inactive badge */}
                        {p.is_paused ? (
                          <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900 text-amber-300 border border-amber-700">
                            Pausado
                          </span>
                        ) : (
                          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActiveNow(p)
                              ? 'bg-green-900 text-green-300 border border-green-700'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-700'
                          }`}>
                            {isActiveNow(p) ? 'Activo ahora' : 'Inactivo'}
                          </span>
                        )}
                        {/* Universal/Privado badge */}
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs ${
                          p.is_universal
                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                            : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                        }`}>
                          {p.is_universal ? 'Universal' : 'Privado'}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500">{formatSchedule(p.schedule)}</p>
                      {p.blocked_urls?.length > 0 && (
                        <p className="text-xs text-zinc-600 mt-1">
                          {p.blocked_urls.length} URL{p.blocked_urls.length !== 1 ? 's' : ''} bloqueada{p.blocked_urls.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {canEdit(p) && (
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        {/* Pause / Resume */}
                        {p.is_paused ? (
                          <button onClick={() => handleResumePom(p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-green-700 bg-green-950 text-green-300 hover:bg-green-900 transition-colors">
                            Reanudar
                          </button>
                        ) : isActiveNow(p) && (
                          <button onClick={() => openPauseModal(p)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-amber-700 bg-amber-950 text-amber-300 hover:bg-amber-900 transition-colors">
                            Pausar
                          </button>
                        )}
                        <button onClick={() => {
                          setEditing(p);
                          setEditingOriginal({
                            days: p.schedule?.days || [],
                            time_ranges: p.schedule?.time_ranges || [],
                            blocked_urls: p.blocked_urls || [],
                            pause_method: p.pause_method || { type: 'none' },
                          });
                          setView('edit');
                        }}
                          className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                          Editar
                        </button>
                        {confirmDeleteId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleDelete(p.id)}
                              className="px-3 py-1.5 rounded-lg text-xs border border-red-700 bg-red-950 text-red-300 hover:bg-red-900 transition-colors">
                              Sí, eliminar
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
