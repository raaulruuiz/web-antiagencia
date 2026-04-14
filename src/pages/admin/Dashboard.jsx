import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BACKEND_URL as BACKEND, LOOM_API_KEY as API_KEY } from '@/lib/config';

// Tests A/B activos — añade aquí cada test cuando lo actives
const AB_TESTS = [
  { id: 'home-cta', label: 'Home · CTA', url: '/' },
];

// Detectado leyendo el código de cada página: qué grupo de MailerLite tiene
const URL_FORM_MAP = {
  '/':                   'newsletter',
  '/newsletter':         'newsletter',
  '/trabajaconnosotros': 'presupuesto',
};

function gruposParaUrl(url) {
  if (url === 'all') return ['newsletter', 'presupuesto'];
  const grupo = URL_FORM_MAP[url];
  return grupo ? [grupo] : [];
}

const PRESETS = [
  { label: 'Hoy',      days: 0 },
  { label: '7 días',   days: 7 },
  { label: '30 días',  days: 30 },
  { label: '90 días',  days: 90 },
];

function startOf(days) {
  const d = new Date();
  if (days === 0) { d.setHours(0, 0, 0, 0); return d; }
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Dashboard() {
  const [preset, setPreset]           = useState(7);
  const [selectedUrl, setSelectedUrl] = useState('all');
  const [pageMetrics, setPageMetrics] = useState(null);
  const [mailerlite, setMailerlite]   = useState(null);
  const [abStats, setAbStats]         = useState({});

  useEffect(() => {
    fetchMetrics();
  }, [selectedUrl, preset]);

  async function fetchMetrics() {
    const from = startOf(preset);
    const to   = new Date();

    // Page views únicos desde Supabase (solo para CVR de MailerLite)
    const { data: allViews } = await supabase
      .from('page_views')
      .select('session_id, url')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString());

    if (allViews) {
      const filtered = selectedUrl === 'all' ? allViews : allViews.filter(v => v.url === selectedUrl);
      const unique = new Set(filtered.map(v => v.session_id)).size;
      setPageMetrics({ unique });
    }

    // MailerLite desde Railway
    try {
      const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
      const res = await fetch(`${BACKEND}/admin/mailerlite?${params}`, {
        headers: { 'x-api-key': API_KEY },
      });
      if (res.ok) setMailerlite(await res.json());
    } catch (_) {}

    // A/B stats
    if (AB_TESTS.length > 0) {
      const results = {};
      await Promise.all(AB_TESTS.map(async test => {
        try {
          const params = new URLSearchParams({ test_id: test.id, url: test.url, from: from.toISOString(), to: to.toISOString() });
          const r = await fetch(`${BACKEND}/admin/ab-tests?${params}`, {
            headers: { 'x-api-key': API_KEY },
          });
          if (r.ok) results[test.id] = await r.json();
        } catch (_) {}
      }));
      setAbStats(results);
    }
  }

  const activePreset = PRESETS.find(p => p.days === preset);

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <h1 className="text-white text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Umami Analytics */}
      <section className="mb-8">
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Analytics
        </h2>
        <iframe
          src="https://umami-production-e9a9.up.railway.app/share/88a492b8d9a2c72c/AntiAgencia"
          className="w-full rounded-xl border border-zinc-800"
          style={{ height: '800px' }}
          title="Umami Analytics"
        />
      </section>

      {/* Filtros para MailerLite + A/B */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={selectedUrl}
          onChange={e => setSelectedUrl(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-zinc-500"
        >
          <option value="all">Todas las páginas</option>
          {Object.keys(URL_FORM_MAP).map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <div className="flex gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-1">
          {PRESETS.map(p => (
            <button
              key={p.days}
              onClick={() => setPreset(p.days)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                preset === p.days ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* MailerLite */}
      {mailerlite && gruposParaUrl(selectedUrl).length > 0 && (
        <section className="mb-8">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Registros MailerLite · {activePreset?.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gruposParaUrl(selectedUrl).map(key => {
              const g = mailerlite[key];
              if (!g) return null;
              const cvr = pageMetrics?.unique > 0
                ? ((g.total / pageMetrics.unique) * 100).toFixed(1)
                : null;
              return (
                <div key={g.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5">
                  <p className="text-zinc-400 text-sm mb-3">{g.name}</p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-white text-3xl font-semibold">{g.total}</p>
                      <p className="text-zinc-500 text-xs mt-1">Registros</p>
                    </div>
                    <div>
                      <p className="text-white text-3xl font-semibold">{g.unique}</p>
                      <p className="text-zinc-500 text-xs mt-1">Únicos</p>
                    </div>
                    {cvr !== null && (
                      <div>
                        <p className="text-white text-3xl font-semibold">{cvr}%</p>
                        <p className="text-zinc-500 text-xs mt-1">Conversión</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tests A/B */}
      {(() => {
        const visibleTests = selectedUrl === 'all'
          ? AB_TESTS
          : AB_TESTS.filter(t => t.url === selectedUrl);
        if (visibleTests.length === 0) return null;
        return (
          <section>
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Tests A/B
            </h2>
            <div className="flex flex-col gap-4">
              {visibleTests.map(test => {
                const stats = abStats[test.id] ?? {};
                return (
                  <div key={test.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5">
                    <p className="text-zinc-400 text-sm mb-4">{test.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['A', 'B'].map(v => {
                        const s = stats[v] ?? { visits: 0, conversions: 0, conversion_rate: '0.0' };
                        return (
                          <div key={v} className="bg-zinc-800 rounded-lg px-4 py-3">
                            <p className="text-zinc-400 text-xs font-semibold mb-3">Variante {v}</p>
                            <div className="flex gap-6">
                              <div>
                                <p className="text-white text-2xl font-semibold">{s.visits}</p>
                                <p className="text-zinc-500 text-xs mt-1">Visitas</p>
                              </div>
                              <div>
                                <p className="text-white text-2xl font-semibold">{s.conversions}</p>
                                <p className="text-zinc-500 text-xs mt-1">Registros</p>
                              </div>
                              <div>
                                <p className="text-white text-2xl font-semibold">{s.conversion_rate}%</p>
                                <p className="text-zinc-500 text-xs mt-1">Conversión</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
