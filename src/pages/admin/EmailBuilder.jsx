import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsNewsletter from 'grapesjs-preset-newsletter';
import { BACKEND_URL as BACKEND, LOOM_API_KEY as API_KEY } from '@/lib/config';

export default function EmailBuilder() {
  const [tab, setTab] = useState('editor');
  const editorContainerRef = useRef(null);
  const gjsRef = useRef(null);

  // IA state
  const [texto, setTexto] = useState('');
  const [imagenes, setImagenes] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [htmlGenerado, setHtmlGenerado] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editorContainerRef.current) return;
    const editor = grapesjs.init({
      container: editorContainerRef.current,
      plugins: [gjsNewsletter],
      storageManager: false,
      height: '100%',
      width: 'auto',
    });
    gjsRef.current = editor;
    return () => editor.destroy();
  }, []);

  async function generarEmail() {
    setLoading(true);
    setError('');
    setHtmlGenerado('');
    try {
      const res = await fetch(`${BACKEND}/admin/email-builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ texto, imagenes: imagenes.filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error generando email');
      setHtmlGenerado(data.html);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function cargarEnEditor() {
    if (gjsRef.current && htmlGenerado) {
      gjsRef.current.setComponents(htmlGenerado);
      setTab('editor');
    }
  }

  function addImagen() {
    setImagenes(prev => [...prev, '']);
  }

  function removeImagen(i) {
    setImagenes(prev => prev.filter((_, j) => j !== i));
  }

  function updateImagen(i, val) {
    setImagenes(prev => { const next = [...prev]; next[i] = val; return next; });
  }

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <h1 className="text-white text-xl font-semibold flex-1">Email Builder</h1>
        <button
          onClick={() => setTab('editor')}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            tab === 'editor' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          ✍️ Editor visual
        </button>
        <button
          onClick={() => setTab('ia')}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            tab === 'ia' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          🤖 Generar con IA
        </button>
      </div>

      {/* GrapesJS — siempre montado, oculto cuando no está en editor */}
      <div className={`flex-1 overflow-hidden ${tab !== 'editor' ? 'hidden' : ''}`}>
        <div ref={editorContainerRef} style={{ height: '100%' }} />
      </div>

      {/* Pestaña IA */}
      {tab === 'ia' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl flex flex-col gap-5">

            <p className="text-zinc-400 text-sm">
              Describe el email que necesitas y añade las URLs de las imágenes. La IA generará el HTML listo para editar en el editor visual.
            </p>

            {/* Descripción */}
            <div>
              <label className="text-zinc-300 text-sm mb-2 block font-medium">Descripción del email</label>
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-zinc-500 transition-colors"
                rows={6}
                placeholder="Ej: Email de bienvenida para nuevos suscriptores. Tono cercano y directo. Fondo blanco, acento azul. Arriba el logo, luego un texto de bienvenida, después una imagen y un botón de CTA que lleve a antiagencia.es."
              />
            </div>

            {/* Imágenes */}
            <div>
              <label className="text-zinc-300 text-sm mb-2 block font-medium">Imágenes (URLs)</label>
              <div className="flex flex-col gap-2">
                {imagenes.map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={img}
                      onChange={e => updateImagen(i, e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                      placeholder="https://..."
                    />
                    {imagenes.length > 1 && (
                      <button
                        onClick={() => removeImagen(i)}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addImagen}
                className="mt-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                + Añadir imagen
              </button>
            </div>

            {/* Botón generar */}
            <button
              onClick={generarEmail}
              disabled={!texto.trim() || loading}
              className="bg-white text-black font-medium py-2.5 px-6 rounded-lg text-sm hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start"
            >
              {loading ? 'Generando...' : 'Generar email'}
            </button>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Vista previa */}
            {htmlGenerado && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-300 text-sm font-medium">Vista previa</span>
                  <button
                    onClick={cargarEnEditor}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Editar en editor visual →
                  </button>
                </div>
                <div className="border border-zinc-700 rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={htmlGenerado}
                    className="w-full"
                    style={{ height: '500px' }}
                    title="Preview email"
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
