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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
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
        <div className="flex gap-3 p-5 border-t border-zinc-800">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {sending ? 'Enviando…' : 'Aceptar y enviar'}
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Marcar leído
          </button>
          <button
            onClick={onClose}
            className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm py-2.5 rounded-lg transition-colors"
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
  if (!eventos?.length) {
    return (
      <div className="text-zinc-500 text-sm py-6 text-center">Sin eventos hoy</div>
    );
  }
  return (
    <div className="space-y-3">
      {eventos.map((e, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="w-16 shrink-0 text-right">
            <span className="text-xs text-zinc-400">{e.todoElDia ? 'Todo el día' : fmtHora(e.inicio)}</span>
          </div>
          <div className="flex-1 bg-zinc-800/60 rounded-lg px-3 py-2.5">
            <p className="text-sm text-white font-medium leading-snug">{e.titulo}</p>
            {e.asistentes?.length > 0 && (
              <p className="text-xs text-zinc-500 mt-1 truncate">
                {e.asistentes.slice(0, 3).join(' · ')}{e.asistentes.length > 3 ? ` +${e.asistentes.length - 3}` : ''}
              </p>
            )}
          </div>
        </div>
      ))}
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
                {!email.leido && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMarkRead(email.id); }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
                  >
                    Leído
                  </button>
                )}
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
  if (!noticias?.length) {
    return <div className="text-zinc-500 text-sm py-6 text-center">Sin noticias</div>;
  }
  return (
    <div className="space-y-4">
      {noticias.slice(0, 10).map((n, i) => (
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

  async function markRead(id) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, leido: true } : e));
    await fetch(`${BACKEND}/admin/briefing/email/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ id }),
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
        <div className="flex items-start justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{fecha}</h1>
            <p className="text-zinc-500 text-sm mt-1">Briefing diario</p>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-end">
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Reuniones</p>
              <p className="text-2xl font-bold text-white">{eventos.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Emails</p>
              <p className="text-2xl font-bold text-white">{unreadCount}</p>
            </div>
            {markets.btc && (
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">BTC</p>
                <p className="text-lg font-bold text-white">
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
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">S&P 500</p>
                <p className="text-lg font-bold text-white">
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
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Oro</p>
                <p className="text-lg font-bold text-white">
                  ${Number(markets.gold.precio).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
            <button
              onClick={fetchBriefing}
              className="text-zinc-500 hover:text-white text-xs transition-colors"
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
