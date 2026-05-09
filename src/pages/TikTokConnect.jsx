import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const BACKEND = 'https://automatizaciones-production-a376.up.railway.app';

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
    </svg>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-[#0067FD]' : 'bg-zinc-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );
}

function ConnectState() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold mb-2">Conecta tu cuenta de TikTok</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Automatizaciones publica contenido en TikTok en tu nombre, directamente desde tu flujo de trabajo en Notion y Google Drive.
        </p>
      </div>
      <div className="space-y-3 mb-8 text-left">
        {[
          { step: '1', text: 'Autoriza el acceso a tu cuenta de TikTok' },
          { step: '2', text: 'Sube tus vídeos a Google Drive y anótalos en Notion' },
          { step: '3', text: 'Automatizaciones los publica según la fecha programada' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#0067FD]/20 text-[#0067FD] text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
            <span className="text-white/60 text-sm">{text}</span>
          </div>
        ))}
      </div>
      <a
        href={`${BACKEND}/tiktok/connect`}
        className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 border border-zinc-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
      >
        <TikTokIcon />
        Conectar con TikTok
      </a>
      <p className="text-white/30 text-xs mt-4">
        Solo accedemos a publicar contenido con tu permiso. Nunca leemos mensajes ni datos privados.
      </p>
    </div>
  );
}

function ConnectedState({ name, sessionId }) {
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [title, setTitle] = useState('Demo Automatizaciones by Antiagencia');
  const [privacy, setPrivacy] = useState('');
  const [allowComment, setAllowComment] = useState(false);
  const [allowDuet, setAllowDuet] = useState(false);
  const [allowStitch, setAllowStitch] = useState(false);
  const [brandDisclosure, setBrandDisclosure] = useState(false);
  const [brandOrganic, setBrandOrganic] = useState(false);
  const [brandedContent, setBrandedContent] = useState(false);

  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND}/tiktok/demo/creator-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(data => {
        setCreatorInfo(data);
        const defaultPrivacy = data.privacy_level_options?.[0] || 'SELF_ONLY';
        setPrivacy(defaultPrivacy);
      })
      .catch(() => setCreatorInfo({}))
      .finally(() => setLoadingInfo(false));
  }, [sessionId]);

  const privacyLabels = {
    PUBLIC_TO_EVERYONE: 'Público',
    MUTUAL_FOLLOW_FRIENDS: 'Amigos mutuos',
    FOLLOWER_OF_CREATOR: 'Seguidores',
    SELF_ONLY: 'Solo yo',
  };

  const isPrivate = privacy === 'SELF_ONLY';
  const effectiveBrandedContent = brandDisclosure && brandedContent;
  // Si branded content está activo, no puede ser privado
  const privacyOptions = (creatorInfo?.privacy_level_options || ['SELF_ONLY']).filter(p =>
    !(effectiveBrandedContent && p === 'SELF_ONLY')
  );

  async function handlePost() {
    setPosting(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND}/tiktok/demo/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          title,
          privacy_level: privacy,
          disable_comment: !allowComment,
          disable_duet: !allowDuet,
          disable_stitch: !allowStitch,
          brand_content_toggle: effectiveBrandedContent,
          brand_organic_toggle: brandDisclosure && brandOrganic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ ok: true, publishId: data.publish_id });
      } else {
        setResult({ ok: false, error: data.error || 'Error desconocido' });
      }
    } catch (err) {
      setResult({ ok: false, error: err.message });
    } finally {
      setPosting(false);
    }
  }

  if (loadingInfo) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-white/40" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Creator info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-3">
        {creatorInfo?.creator_avatar_url && (
          <img src={creatorInfo.creator_avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{creatorInfo?.creator_nickname || name || 'TikTok'}</p>
          {creatorInfo?.creator_username && (
            <p className="text-white/40 text-xs">@{creatorInfo.creator_username}</p>
          )}
        </div>
        <div className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Post form */}
      {!result?.ok && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">

          {/* Título */}
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 150))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#0067FD]"
              placeholder="Título del vídeo"
            />
            <p className="text-white/30 text-xs mt-1 text-right">{title.length}/150</p>
          </div>

          {/* Privacidad */}
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Privacidad</label>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#0067FD]"
            >
              {privacyOptions.map(p => (
                <option key={p} value={p}>{privacyLabels[p] || p}</option>
              ))}
            </select>
          </div>

          {/* Interacciones */}
          <div>
            <p className="text-white/60 text-xs font-medium mb-2">Permitir interacciones</p>
            <div className="space-y-2.5">
              {[
                { label: 'Comentarios', value: allowComment, set: setAllowComment, disabled: creatorInfo?.comment_disabled },
                { label: 'Duet', value: allowDuet, set: setAllowDuet, disabled: creatorInfo?.duet_disabled },
                { label: 'Stitch', value: allowStitch, set: setAllowStitch, disabled: creatorInfo?.stitch_disabled },
              ].map(({ label, value, set, disabled }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-sm ${disabled ? 'text-white/25' : 'text-white/70'}`}>{label}</span>
                  <Toggle checked={value} onChange={set} disabled={disabled} />
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Content Disclosure */}
          <div className="border border-zinc-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Divulgación de contenido comercial</p>
                <p className="text-white/40 text-xs mt-0.5">¿Este vídeo incluye contenido pagado o promocionado?</p>
              </div>
              <Toggle checked={brandDisclosure} onChange={setBrandDisclosure} />
            </div>
            {brandDisclosure && (
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={brandOrganic} onChange={e => setBrandOrganic(e.target.checked)} className="mt-0.5 accent-[#0067FD]" />
                  <div>
                    <p className="text-white/80 text-xs font-medium">Tu marca</p>
                    <p className="text-white/40 text-xs">Estás promocionando tu propio negocio o marca personal</p>
                  </div>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={brandedContent} onChange={e => setBrandedContent(e.target.checked)} className="mt-0.5 accent-[#0067FD]" />
                  <div>
                    <p className="text-white/80 text-xs font-medium">Contenido patrocinado</p>
                    <p className="text-white/40 text-xs">Estás promocionando una marca o producto de un tercero</p>
                  </div>
                </label>
                {(brandOrganic || brandedContent) && (
                  <p className="text-white/40 text-xs pt-1 border-t border-zinc-700">
                    Al publicar, confirmas que este contenido cumple con la{' '}
                    <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noopener noreferrer" className="text-[#0067FD] underline">
                      Política de Contenido de Marca
                    </a>{' '}
                    de TikTok.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {result?.ok === false && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
              Error: {typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}
            </div>
          )}

          {/* Botón publicar */}
          <button
            onClick={handlePost}
            disabled={posting}
            className="w-full flex items-center justify-center gap-2 bg-[#0067FD] hover:bg-[#0057d4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            {posting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Publicando...
              </>
            ) : (
              <>
                <TikTokIcon />
                Publicar vídeo de prueba
              </>
            )}
          </button>
        </div>
      )}

      {/* Resultado */}
      {result?.ok && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-medium">Vídeo enviado a TikTok</p>
          {result.publishId && (
            <p className="text-white/40 text-xs font-mono">Publish ID: {result.publishId}</p>
          )}
          <p className="text-white/40 text-xs">
            Puede tardar unos minutos en aparecer en tu perfil.
          </p>
        </div>
      )}
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="text-white font-medium mb-2">Error al conectar</p>
      <p className="text-white/40 text-sm mb-6">{error}</p>
      <a href="/tiktok-connect" className="text-[#0067FD] hover:underline text-sm">
        Intentar de nuevo
      </a>
    </div>
  );
}

export default function TikTokConnect() {
  const [searchParams] = useSearchParams();
  const connected = searchParams.get('connected') === 'true';
  const name = searchParams.get('name');
  const sessionId = searchParams.get('session');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/images/01d58b46c_AALogo.png" alt="Antiagencia" className="w-12 h-12 mx-auto mb-3 object-contain" />
          <h1 className="text-white text-2xl font-bold">Automatizaciones</h1>
          <p className="text-white/40 text-sm mt-1">by Antiagencia</p>
        </div>
        {error ? (
          <ErrorState error={error} />
        ) : connected ? (
          <ConnectedState name={name} sessionId={sessionId} />
        ) : (
          <ConnectState />
        )}
      </div>
    </div>
  );
}
