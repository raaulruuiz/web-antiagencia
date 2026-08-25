import { useState } from 'react';

function InstallModal({ onClose }) {
  const [variant, setVariant] = useState('chrome');

  const chromeSteps = [
    <><a href="/pomodoro-extension.zip" download className="underline text-white hover:text-zinc-300">Descarga la extensión</a> y descomprime el ZIP.</>,
    <>Abre Chrome y ve a <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">chrome://extensions</code></>,
    <>Activa el <strong>Modo desarrollador</strong> (arriba a la derecha).</>,
    <>Haz clic en <strong>Cargar descomprimida</strong> y selecciona la carpeta <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">pomodoro-extension</code>.</>,
    <>Listo. La extensión se activa automáticamente según los horarios.</>,
    <>¿Usas Firefox? <button onClick={() => setVariant('firefox')} className="underline text-white hover:text-zinc-300" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Haz clic aquí</button> para las instrucciones de Firefox.</>,
  ];

  const firefoxSteps = [
    <><a href="/pomodoro-extension-firefox.zip" download className="underline text-white hover:text-zinc-300">Descarga la extensión para Firefox</a> y descomprime el ZIP.</>,
    <>Abre Firefox y ve a <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">about:debugging</code></>,
    <>Haz clic en <strong>Este Firefox</strong> (panel izquierdo).</>,
    <>Haz clic en <strong>Cargar complemento temporal</strong> y selecciona el archivo <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs">manifest.json</code> dentro de la carpeta descomprimida.</>,
    <>Listo. La extensión se activa automáticamente según los horarios. Nota: en Firefox, la extensión temporal se elimina al cerrar el navegador.</>,
    <>¿Usas Chrome? <button onClick={() => setVariant('chrome')} className="underline text-white hover:text-zinc-300" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Haz clic aquí</button> para las instrucciones de Chrome.</>,
  ];

  const steps = variant === 'chrome' ? chromeSteps : firefoxSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-md mx-4 border border-zinc-800 rounded-xl p-6" style={{ backgroundColor: '#111' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg leading-none">✕</button>
        <h2 className="text-base font-semibold mb-1">
          {variant === 'chrome' ? 'Instalar Pomodoro Blocker' : 'Instalar Pomodoro Blocker — Firefox'}
        </h2>
        <p className="text-sm text-zinc-400 mb-5">La extensión bloquea las URLs durante las sesiones activas.</p>
        <ol className="space-y-4 text-sm text-zinc-300 mb-6">
          {steps.map((content, i) => (
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

export default function InstallExtensionButton({ className = '' }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        onClick={() => setShow(true)}
        className={`text-sm text-white underline underline-offset-2 hover:text-zinc-300 transition-colors ${className}`}
      >
        📦 Instalar extensión
      </button>
      {show && <InstallModal onClose={() => setShow(false)} />}
    </>
  );
}
