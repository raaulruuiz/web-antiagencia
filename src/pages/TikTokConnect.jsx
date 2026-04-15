import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const BACKEND = 'https://automatizaciones-production-a376.up.railway.app';

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
    </svg>
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
            <span className="w-6 h-6 rounded-full bg-[#0067FD]/20 text-[#0067FD] text-xs font-bold flex items-center justify-center shrink-0">
              {step}
            </span>
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
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState(null);

  async function handlePost() {
    setPosting(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND}/tiktok/demo/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
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

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Cuenta conectada</p>
            <p className="text-white/40 text-xs">{name || 'TikTok'}</p>
          </div>
          <div className="ml-auto">
            <TikTokIcon />
          </div>
        </div>
        <p className="text-white/50 text-sm">
          Automatizaciones tiene acceso para publicar contenido en TikTok en nombre de esta cuenta.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-medium text-sm mb-1">Publicar vídeo de prueba</h3>
        <p className="text-white/40 text-xs mb-4">
          Publica un vídeo de demostración directamente en TikTok usando la Content Posting API.
        </p>

        {result?.ok ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-400 font-medium text-sm">Vídeo enviado a TikTok</p>
            {result.publishId && (
              <p className="text-white/40 text-xs mt-1">Publish ID: {result.publishId}</p>
            )}
          </div>
        ) : result?.ok === false ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 mb-3">
            Error: {typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}
          </div>
        ) : null}

        {!result?.ok && (
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
        )}
      </div>
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
      <a
        href="/tiktok-connect"
        className="text-[#0067FD] hover:underline text-sm"
      >
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
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/images/01d58b46c_AALogo.png"
            alt="Antiagencia"
            className="w-12 h-12 mx-auto mb-3 object-contain"
          />
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
