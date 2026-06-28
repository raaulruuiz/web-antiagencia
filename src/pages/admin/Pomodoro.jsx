import { useEffect, useState, useCallback } from 'react';
import { BACKEND_URL, LOOM_API_KEY } from '@/lib/config';

const API_HEADERS = { 'Content-Type': 'application/json', 'x-api-key': LOOM_API_KEY };

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isActiveNow(pomodoro) {
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

  const dayPart = days.map(d => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return d === todayISO() ? 'Solo hoy' : d;
    }
    return DAY_NAMES_ES[d] || d;
  }).join(', ');

  const rangePart = time_ranges.map(r => `${r.start}–${r.end}`).join(' · ');

  if (dayPart && rangePart) return `${dayPart} · ${rangePart}`;
  return dayPart || rangePart || 'Sin horario';
}

function emptyForm() {
  return { name: '', days: [], time_ranges: [{ start: '09:00', end: '17:00' }], blocked_urls: [] };
}

// ─── Toggle component ────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${value ? 'bg-white' : 'bg-zinc-700'}`}
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
            <>Listo. La extensión se activa automáticamente según tus horarios.</>,
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

// ─── URL list (used inside the form) ─────────────────────────────────────────

function UrlList({ urls, onChange }) {
  const [input, setInput] = useState('');

  function add() {
    const domain = input.trim();
    if (!domain || urls.some(u => u.url === domain)) return;
    onChange([...urls, { url: domain, wildcard: true }]);
    setInput('');
  }

  function remove(url) {
    onChange(urls.filter(u => u.url !== url));
  }

  function toggleWildcard(url, val) {
    onChange(urls.map(u => u.url === url ? { ...u, wildcard: val } : u));
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="ejemplo.com"
          className="flex-1 px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          Añadir
        </button>
      </div>

      {urls.length === 0 ? (
        <p className="text-sm text-zinc-600">No hay URLs. Añade las que quieras bloquear.</p>
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
                    <Toggle value={wildcard ?? true} onChange={v => toggleWildcard(url, v)} />
                    <span className="text-xs text-zinc-500">{wildcard ? 'Todo el dominio' : 'URL exacta'}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => remove(url)}
                    className="px-3 py-1 rounded text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
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
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function PomodoroForm({ initial, onSave, onBack, saving }) {
  const [form, setForm] = useState(initial || emptyForm());
  const [errors, setErrors] = useState({});

  const isSoloHoy = form.days.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(form.days[0]);

  function toggleWeekday(key) {
    setForm(f => {
      const base = f.days.filter(d => !/^\d{4}-\d{2}-\d{2}$/.test(d)); // strip ISO dates
      const exists = base.includes(key);
      return { ...f, days: exists ? base.filter(d => d !== key) : [...base, key] };
    });
  }

  function setSoloHoy() {
    setForm(f => ({ ...f, days: [todayISO()] }));
  }

  function addRange() {
    setForm(f => ({ ...f, time_ranges: [...f.time_ranges, { start: '09:00', end: '17:00' }] }));
  }

  function updateRange(i, field, val) {
    setForm(f => {
      const time_ranges = f.time_ranges.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
      return { ...f, time_ranges };
    });
  }

  function removeRange(i) {
    setForm(f => ({ ...f, time_ranges: f.time_ranges.filter((_, idx) => idx !== i) }));
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

  const weekdayDays = form.days.filter(d => !/^\d{4}-\d{2}-\d{2}$/.test(d));

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
        ← Volver
      </button>

      <div className="space-y-6">
        {/* Nombre */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Sesión de trabajo, Sin redes sociales…"
            className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Horario */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-300 mb-4">Horario</p>

          {/* Días */}
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Días</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(({ key, label }) => {
                const active = weekdayDays.includes(key) && !isSoloHoy;
                return (
                  <button
                    key={key}
                    onClick={() => toggleWeekday(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                onClick={setSoloHoy}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSoloHoy
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Solo hoy
              </button>
            </div>
            {errors.days && <p className="mt-1.5 text-xs text-red-400">{errors.days}</p>}
          </div>

          {/* Franjas horarias */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Franjas horarias</p>
            <div className="space-y-2">
              {form.time_ranges.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={r.start}
                    onChange={e => updateRange(i, 'start', e.target.value)}
                    className="px-2 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                  />
                  <span className="text-zinc-600 text-sm">→</span>
                  <input
                    type="time"
                    value={r.end}
                    onChange={e => updateRange(i, 'end', e.target.value)}
                    className="px-2 py-1.5 rounded-lg text-sm border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                  />
                  {form.time_ranges.length > 1 && (
                    <button onClick={() => removeRange(i)} className="text-zinc-600 hover:text-zinc-400 text-lg leading-none px-1">×</button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addRange}
              className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              + Añadir franja
            </button>
            {errors.ranges && <p className="mt-1.5 text-xs text-red-400">{errors.ranges}</p>}
          </div>
        </div>

        {/* URLs */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-zinc-300 mb-4">URLs bloqueadas</p>
          <UrlList
            urls={form.blocked_urls}
            onChange={urls => setForm(f => ({ ...f, blocked_urls: urls }))}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-zinc-600 bg-white text-black hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar Pomodoro'}
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Pomodoro() {
  const [pomodoros, setPomodoros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null); // pomodoro object
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchPomodoros = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros`, { headers: API_HEADERS });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setPomodoros(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPomodoros(); }, [fetchPomodoros]);

  // Refresh active badges every minute
  useEffect(() => {
    const t = setInterval(() => setPomodoros(p => p.map(x => ({ ...x, is_active: isActiveNow(x) }))), 60000);
    return () => clearInterval(t);
  }, []);

  function notifyExtension() {
    window.dispatchEvent(new CustomEvent('pomodoroRefresh'));
  }

  async function handleSave(form) {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        schedule: { days: form.days, time_ranges: form.time_ranges },
        blocked_urls: form.blocked_urls,
      };
      const url = editing
        ? `${BACKEND_URL}/admin/pomodoros/${editing.id}`
        : `${BACKEND_URL}/admin/pomodoros`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: API_HEADERS, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      await fetchPomodoros();
      notifyExtension();
      setView('list');
      setEditing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/pomodoros/${id}`, { method: 'DELETE', headers: API_HEADERS });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setPomodoros(p => p.filter(x => x.id !== id));
      setConfirmDeleteId(null);
      notifyExtension();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(p) {
    setEditing(p);
    setView('edit');
  }

  function startCreate() {
    setEditing(null);
    setView('create');
  }

  function goBack() {
    setEditing(null);
    setView('list');
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
  } : null;

  return (
    <div className="p-6 max-w-2xl mx-auto" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pomodoro</h1>
        <button
          onClick={() => setShowInstall(true)}
          className="text-sm text-white underline underline-offset-2 hover:text-zinc-300 transition-colors mt-1"
        >
          📦 Instalar extension
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-800 bg-red-950 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Form view */}
      {(view === 'create' || view === 'edit') && (
        <PomodoroForm
          key={editing?.id || 'new'}
          initial={initialForm}
          onSave={handleSave}
          onBack={goBack}
          saving={saving}
        />
      )}

      {/* List view */}
      {view === 'list' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-400">
              {pomodoros.length === 0 ? 'No hay Pomodoros aún.' : `${pomodoros.length} Pomodoro${pomodoros.length !== 1 ? 's' : ''}`}
            </p>
            <button
              onClick={startCreate}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-600 bg-white text-black hover:bg-zinc-100 transition-colors"
            >
              + Crear Pomodoro
            </button>
          </div>

          {pomodoros.length === 0 ? (
            <div className="border border-zinc-800 border-dashed rounded-xl p-10 text-center">
              <p className="text-zinc-500 text-sm">Crea tu primer Pomodoro para empezar a bloquear URLs según horario.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pomodoros.map(p => (
                <div key={p.id} className="border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-base truncate">{p.name}</span>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isActiveNow(p)
                            ? 'bg-green-900 text-green-300 border border-green-700'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-700'
                        }`}>
                          {isActiveNow(p) ? 'Activo ahora' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500">{formatSchedule(p.schedule)}</p>
                      {p.blocked_urls?.length > 0 && (
                        <p className="text-xs text-zinc-600 mt-1">
                          {p.blocked_urls.length} URL{p.blocked_urls.length !== 1 ? 's' : ''} bloqueada{p.blocked_urls.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(p)}
                        className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      >
                        Editar
                      </button>
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-red-700 bg-red-950 text-red-300 hover:bg-red-900 transition-colors"
                          >
                            Sí, eliminar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
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
