import { useState, useEffect, useCallback } from 'react';
import { BACKEND_URL as BACKEND, LOOM_API_KEY as API_KEY } from '@/lib/config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtHora(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
    });
  } catch { return ''; }
}

function fmtFechaCorta(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', timeZone: 'Europe/Madrid',
    });
  } catch { return ''; }
}

function cambioColor(val) {
  if (val === null || val === undefined) return 'text-zinc-400';
  return parseFloat(val) >= 0 ? 'text-green-400' : 'text-red-400';
}

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

function EmailModal({ email, onClose, onSend, onMarkRead }) {
  const [mode, setMode] = useState('preview'); // preview | edit
  const [reply, setReply] = useState(`Hola,\n\nGracias por tu mensaje.\n\nSaludos,\nRaúl`);
  const [sending, setSending] = useState(false);

  const cuerpoLimpio = stripHtml(email.cuerpo) || email.snippet;

  async function handleSend() {
    setSending(true);
    await onSend(reply);
    setSending(false);
    onClose();
  }

  async function handleDelete() {
    await onMarkRead(email.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-xs text-zinc-400 mb-1 truncate">{email.de}</p>
            <h3 className="text-white font-semibold text-sm leading-snug">{email.asunto}</h3>
            <p className="text-xs text-zinc-500 mt-1">{fmtFechaCorta(email.fecha)}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none mt-1">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {cuerpoLimpio.slice(0, 2000)}{cuerpoLimpio.length > 2000 ? '…' : ''}
          </div>

          {/* Respuesta */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Respuesta</p>
              {mode === 'preview' && (
                <button onClick={() => setMode('edit')} className="text-xs text-blue-400 hover:text-blue-300">
                  Editar
                </button>
              )}
            </div>
            {mode === 'preview' ? (
              <div className="bg-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap">
                {reply}
              </div>
            ) : (
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-200 resize-none focus:outline-none focus:border-blue-500"
                rows={6}
                value={reply}
                onChange={e => setReply(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-5 border-t border-zinc-800">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-lg transition-colors"
          >
            {sending ? 'Enviando…' : 'Aceptar y enviar'}
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-3 rounded-lg transition-colors"
          >
            Marcar leído
          </button>
          <button
            onClick={onClose}
            className="sm:px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm py-3 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sección Agenda ───────────────────────────────────────────────────────────

function AgendaSection({ eventos }) {
  const ahora = new Date();
  const activos = eventos?.filter(e => !e.fin || new Date(e.fin) > ahora) || [];

  if (!activos.length) {
    return (
      <div className="text-zinc-500 text-sm py-6 text-center">Sin más eventos hoy</div>
    );
  }
  return (
    <div className="space-y-3">
      {activos.map((e, i) => {
        const empezado = e.inicio && new Date(e.inicio) <= ahora;
        return (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-16 shrink-0 text-right pt-1">
              <span className="text-xs text-zinc-400">{e.todoElDia ? 'Todo el día' : fmtHora(e.inicio)}</span>
              {empezado && !e.todoElDia && (
                <span className="block text-xs text-green-500 mt-0.5">En curso</span>
              )}
            </div>
            <div className={`flex-1 rounded-lg px-3 py-2.5 ${empezado && !e.todoElDia ? 'bg-blue-950/50 border border-blue-800/40' : 'bg-zinc-800/60'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white font-medium leading-snug">{e.titulo}</p>
                {e.calendario && (
                  <span className="text-xs text-zinc-500 shrink-0 mt-0.5">{e.calendario}</span>
                )}
              </div>
              {e.asistentes?.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1 truncate">
                  {e.asistentes.slice(0, 3).join(' · ')}{e.asistentes.length > 3 ? ` +${e.asistentes.length - 3}` : ''}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sección Emails ───────────────────────────────────────────────────────────

function EmailsSection({ emails, onOpen, onMarkRead }) {
  if (!emails?.length) {
    return <div className="text-zinc-500 text-sm py-6 text-center">Sin emails</div>;
  }
  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`rounded-lg border transition-colors ${
            email.leido
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-zinc-800/80 border-zinc-700'
          }`}
        >
          <div
            className="px-4 py-3 cursor-pointer hover:bg-zinc-800/50 transition-colors rounded-lg"
            onClick={() => onOpen(email)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {!email.leido && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs text-zinc-400 truncate">{email.de?.split('<')[0].trim()}</p>
                </div>
                <p className={`text-sm leading-snug truncate ${email.leido ? 'text-zinc-400' : 'text-white font-medium'}`}>
                  {email.asunto}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{email.snippet}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-600">{fmtFechaCorta(email.fecha)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead(email.id, email.cuenta); }}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    email.leido
                      ? 'text-zinc-600 bg-zinc-800 cursor-default'
                      : 'text-zinc-400 hover:text-white bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  disabled={email.leido}
                >
                  {email.leido ? '✓' : 'Leído'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sección Noticias ─────────────────────────────────────────────────────────

function NoticiasSection({ noticias }) {
  const [visible, setVisible] = useState(10);

  if (!noticias?.length) {
    return <div className="text-zinc-500 text-sm py-6 text-center">Sin noticias</div>;
  }

  const mostradas = noticias.slice(0, visible);
  const hayMas = visible < noticias.length;

  return (
    <div>
      <div className="space-y-4">
        {mostradas.map((n, i) => (
          <div key={i} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-blue-500 mt-0.5 w-5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">{n.fuente}</p>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white hover:text-blue-400 font-medium leading-snug transition-colors"
                >
                  {n.titulo}
                </a>
                {n.resumen && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">{n.resumen}</p>
                )}
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-blue-500 hover:text-blue-400"
                >
                  Ver noticia →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hayMas && (
        <button
          onClick={() => setVisible(v => v + 10)}
          className="mt-4 w-full py-2.5 text-sm text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          Ver más ({noticias.length - visible} restantes)
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Briefing() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [emails, setEmails]       = useState([]);

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/admin/briefing`, {
        headers: { 'x-api-key': API_KEY },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json);
      setEmails(json.emails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBriefing(); }, [fetchBriefing]);

  // Auto-refresh cada hora (agenda + todo)
  useEffect(() => {
    const interval = setInterval(fetchBriefing, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchBriefing]);

  // Auto-refresh emails cada 5 minutos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/admin/briefing`, {
          headers: { 'x-api-key': API_KEY },
        });
        if (!res.ok) return;
        const json = await res.json();
        setEmails(json.emails || []);
      } catch {}
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function markRead(id, cuenta) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, leido: true } : e));
    await fetch(`${BACKEND}/admin/briefing/email/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ id, cuenta }),
    }).catch(() => {});
  }

  async function sendReply(replyBody) {
    if (!emailModal) return;
    await fetch(`${BACKEND}/admin/briefing/email/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({
        threadId: emailModal.threadId,
        to: emailModal.de,
        subject: emailModal.asunto,
        body: replyBody,
      }),
    });
    markRead(emailModal.id);
  }

  const unreadCount = emails.filter(e => !e.leido).length;
  const { eventos = [], markets = {}, noticias = [], fecha = '' } = data || {};
  const CALENDARIOS_REUNION = ['REUNIONES', 'REUNIONES VENTA', 'Reuniones', 'Reuniones Venta'];
  const reunionesHoy = eventos.filter(e => CALENDARIOS_REUNION.some(c => e.calendario?.toUpperCase().includes(c.toUpperCase())));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Error cargando el briefing: {error}</p>
          <button onClick={fetchBriefing} className="text-blue-500 hover:text-blue-400 text-sm">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0d0d0d' }}>
      {emailModal && (
        <EmailModal
          email={emailModal}
          onClose={() => setEmailModal(null)}
          onSend={sendReply}
          onMarkRead={markRead}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize leading-tight">{fecha}</h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">Briefing diario</p>
          </div>
          {/* Stats — scrollable en móvil, inline en desktop */}
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto shrink-0 max-w-[60%] sm:max-w-none pb-1">
            <div className="shrink-0 text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Reuniones</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{reunionesHoy.length}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Emails</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{unreadCount}</p>
            </div>
            {markets.btc && (
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">BTC</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  ${Number(markets.btc.precio).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                {markets.btc.cambio24h && (
                  <p className={`text-xs ${cambioColor(markets.btc.cambio24h)}`}>
                    {parseFloat(markets.btc.cambio24h) >= 0 ? '+' : ''}{markets.btc.cambio24h}%
                  </p>
                )}
              </div>
            )}
            {markets.sp500 && (
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">S&P 500</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {Number(markets.sp500.precio).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                {markets.sp500.cambio24h && (
                  <p className={`text-xs ${cambioColor(markets.sp500.cambio24h)}`}>
                    {parseFloat(markets.sp500.cambio24h) >= 0 ? '+' : ''}{markets.sp500.cambio24h}%
                  </p>
                )}
              </div>
            )}
            {markets.gold && (
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Oro</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  ${Number(markets.gold.precio).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                {markets.gold.cambio24h && (
                  <p className={`text-xs ${cambioColor(markets.gold.cambio24h)}`}>
                    {parseFloat(markets.gold.cambio24h) >= 0 ? '+' : ''}{markets.gold.cambio24h}%
                  </p>
                )}
              </div>
            )}
            <button
              onClick={fetchBriefing}
              className="shrink-0 text-zinc-500 hover:text-white text-lg transition-colors"
              title="Actualizar"
            >
              ↺
            </button>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Agenda */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">📅</span>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Agenda del día</h2>
            </div>
            <AgendaSection eventos={eventos} />
          </div>

          {/* Emails */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">✉️</span>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                Emails de hoy
              </h2>
              {unreadCount > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <EmailsSection
              emails={emails}
              onOpen={setEmailModal}
              onMarkRead={markRead}
            />
          </div>
        </div>

        {/* Grid noticias + contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Noticias */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🌐</span>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Noticias de hoy</h2>
            </div>
            <NoticiasSection noticias={noticias} />
          </div>

          {/* Ideas de contenido */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">✏️</span>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Ideas de contenido</h2>
            </div>
            <div className="text-zinc-600 text-sm py-8 text-center">
              Próximamente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
