import { useRef, useState, useCallback } from 'react';
import EmailEditor from 'react-email-editor';
import { BACKEND_URL as BACKEND, LOOM_API_KEY as API_KEY } from '@/lib/config';

// ─── Zona de imágenes drag & drop ────────────────────────────────────────────

function ImageDropZone({ label, hint, images, onAdd, onRemove }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  async function processFiles(files) {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise(resolve => {
        const r = new FileReader();
        r.onload = e => resolve(e.target.result);
        r.readAsDataURL(file);
      });
      onAdd({ name: file.name, dataUrl });
    }
  }

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, []);

  return (
    <div>
      <label className="text-zinc-300 text-sm font-medium mb-2 block">{label}</label>
      {hint && <p className="text-zinc-500 text-xs mb-2">{hint}</p>}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-colors ${
          dragging ? 'border-zinc-400 bg-zinc-800' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
        }`}
      >
        <p className="text-zinc-400 text-sm">Arrastra imágenes aquí o <span className="text-white underline">selecciona archivos</span></p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => processFiles(Array.from(e.target.files))} />
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img.dataUrl} alt={img.name} className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
              <button onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-900 border border-zinc-600 rounded-full text-zinc-400 hover:text-white text-xs flex items-center justify-center">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EmailBuilder() {
  const [tab, setTab] = useState('editor');
  const emailEditorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  // HTML tab state
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlPreview, setHtmlPreview] = useState(false);

  // IA state
  const [imagenes, setImagenes] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [extraerEstructura, setExtraerEstructura] = useState(true);
  const [extraerEstilo, setExtraerEstilo] = useState(false);
  const [urlMarca, setUrlMarca] = useState('');
  const [textoExacto, setTextoExacto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [htmlGenerado, setHtmlGenerado] = useState('');
  const [error, setError] = useState('');

  const tieneDatos = imagenes.length > 0 || referencias.length > 0 || urlMarca.trim() || textoExacto.trim() || descripcion.trim();

  function switchTab(next) {
    setTab(next);
  }

  function aplicarHtmlAlEditor() {
    if (!emailEditorRef.current?.editor || !htmlCode.trim()) return;
    emailEditorRef.current.editor.loadDesign({ html: htmlCode, classic: true });
    setTab('editor');
  }

  async function generarEmail() {
    setLoading(true);
    setError('');
    setHtmlGenerado('');
    try {
      const res = await fetch(`${BACKEND}/admin/email-builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({
          descripcion, textoExacto, urlMarca,
          imagenes: imagenes.map(i => i.dataUrl),
          referencias: referencias.map(i => i.dataUrl),
          extraerEstructura, extraerEstilo,
        }),
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
    if (!emailEditorRef.current?.editor || !htmlGenerado) return;
    emailEditorRef.current.editor.loadDesign({ html: htmlGenerado, classic: true });
    setTab('editor');
  }

  function exportarHtml() {
    if (!emailEditorRef.current?.editor) return;
    emailEditorRef.current.editor.exportHtml(({ html }) => {
      const blob = new Blob([html], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'email.html';
      a.click();
    });
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <h1 className="text-white text-xl font-semibold flex-1">Email Builder</h1>
        {tab === 'editor' && editorReady && (
          <button onClick={exportarHtml}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
            ⬇ Exportar HTML
          </button>
        )}
        <button onClick={() => switchTab('editor')}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === 'editor' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
          ✍️ Editor visual
        </button>
        <button onClick={() => switchTab('html')} disabled={!editorReady}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === 'html' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'} disabled:opacity-40`}>
          {'</>'} HTML
        </button>
        <button onClick={() => switchTab('ia')}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === 'ia' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
          🤖 Generar con IA
        </button>
      </div>

      {/* Editor Unlayer — siempre montado */}
      <div className={tab !== 'editor' ? 'hidden' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <EmailEditor
          ref={emailEditorRef}
          onReady={() => setEditorReady(true)}
          minHeight={window.innerHeight - 61}
          style={{ flex: 1 }}
          options={{
            displayMode: 'email',
            features: { preview: true },
          }}
        />
      </div>

      {/* Pestaña HTML */}
      {tab === 'html' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-xs">Pega aquí un HTML para cargarlo en el editor visual.</span>
              <button onClick={() => setHtmlPreview(p => !p)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                {htmlPreview ? 'Ver código' : 'Vista previa'}
              </button>
            </div>
            <button onClick={aplicarHtmlAlEditor} disabled={!htmlCode.trim()}
              className="px-4 py-1.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Cargar en editor visual →
            </button>
          </div>
          {htmlPreview ? (
            <iframe srcDoc={htmlCode} style={{ flex: 1, border: 'none', background: 'white' }} title="HTML preview" />
          ) : (
            <textarea
              value={htmlCode}
              onChange={e => setHtmlCode(e.target.value)}
              spellCheck={false}
              placeholder="Pega aquí el HTML del email..."
              style={{
                flex: 1,
                resize: 'none',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                padding: '16px',
                background: '#0d0d0d',
                color: '#e4e4e7',
                border: 'none',
                outline: 'none',
                width: '100%',
              }}
            />
          )}
        </div>
      )}

      {/* Pestaña IA */}
      {tab === 'ia' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl flex flex-col gap-6">

            <ImageDropZone
              label="🖼️ Imágenes para el email"
              hint="La IA las verá y las incluirá en el diseño"
              images={imagenes}
              onAdd={img => setImagenes(prev => [...prev, img])}
              onRemove={i => setImagenes(prev => prev.filter((_, j) => j !== i))}
            />

            <div>
              <ImageDropZone
                label="📧 Emails de referencia"
                hint="Sube capturas de emails que te gusten para que la IA extraiga su estructura o estilo"
                images={referencias}
                onAdd={img => setReferencias(prev => [...prev, img])}
                onRemove={i => setReferencias(prev => prev.filter((_, j) => j !== i))}
              />
              <div className="flex gap-5 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={extraerEstructura} onChange={e => setExtraerEstructura(e.target.checked)} className="accent-white w-4 h-4" />
                  <span className="text-zinc-300 text-sm">Estructura</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={extraerEstilo} onChange={e => setExtraerEstilo(e.target.checked)} className="accent-white w-4 h-4" />
                  <span className="text-zinc-300 text-sm">
                    Estilo
                    {extraerEstilo && urlMarca && <span className="text-zinc-500 text-xs ml-1">(colores y tipografía los marca la URL)</span>}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-medium mb-2 block">🌐 URL de la web <span className="text-zinc-500 font-normal">(para extraer estilo de marca)</span></label>
              <input value={urlMarca} onChange={e => setUrlMarca(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="https://antiagencia.es" />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-medium mb-2 block">📝 Texto exacto del email <span className="text-zinc-500 font-normal">(opcional)</span></label>
              <textarea value={textoExacto} onChange={e => setTextoExacto(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-zinc-500 transition-colors"
                rows={5} placeholder="Pega aquí el asunto, el cuerpo del email, el texto del botón... exactamente como quieres que aparezca." />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-medium mb-2 block">💬 Descripción / instrucciones <span className="text-zinc-500 font-normal">(opcional)</span></label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-zinc-500 transition-colors"
                rows={4} placeholder="Ej: Email de bienvenida, tono cercano, fondo oscuro, botón verde, logo arriba..." />
            </div>

            <button onClick={generarEmail} disabled={!tieneDatos || loading}
              className="bg-white text-black font-medium py-2.5 px-6 rounded-lg text-sm hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start">
              {loading ? 'Generando...' : 'Generar email'}
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {htmlGenerado && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-300 text-sm font-medium">Vista previa</span>
                  <button onClick={cargarEnEditor} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Editar en editor visual →
                  </button>
                </div>
                <div className="border border-zinc-700 rounded-lg overflow-hidden bg-white">
                  <iframe srcDoc={htmlGenerado} className="w-full" style={{ height: '500px' }} title="Preview email" />
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
