import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BACKEND_URL as BACKEND, LOOM_API_KEY as API_KEY } from '@/lib/config';

const SITE_URL = 'https://antiagencia.es';

const HARDCODED_PAGES = [
  { nombre: 'Home',                   path: '/' },
  { nombre: 'Aviso Legal',            path: '/AvisoLegal' },
  { nombre: 'Cómo Trabajamos',        path: '/ComoTrabajamos' },
  { nombre: 'Contacto',               path: '/Contacto' },
  { nombre: 'Gracias',                path: '/Gracias' },
  { nombre: 'Política de Privacidad', path: '/politica-privacidad' },
  { nombre: 'Política de Cookies',    path: '/PoliticaCookies' },
  { nombre: 'Trabaja con Nosotros',   path: '/TrabajaConNosotros' },
];

export default function Paginas() {
  const [dbPages, setDbPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // page object merged with DB data
  const [creatingNew, setCreatingNew] = useState(false);
  const [newForm, setNewForm] = useState({ nombre: '', path: '' });

  // Preview
  const [htmlActual, setHtmlActual] = useState(null);   // contenido guardado en DB
  const [htmlPropuesto, setHtmlPropuesto] = useState(null); // propuesta IA pendiente de guardar

  // Chat
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // SEO
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoForm, setSeoForm] = useState({ meta_titulo: '', meta_descripcion: '', indexada: true, publicada: true });
  const [savingSeo, setSavingSeo] = useState(false);

  // Guardar HTML
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDbPages(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  async function fetchDbPages() {
    setLoadingPages(true);
    const { data } = await supabase.from('paginas').select('*').order('nombre');
    setDbPages(data || []);
    setLoadingPages(false);
  }

  // Hardcoded + dynamic merged
  const allPages = [
    ...HARDCODED_PAGES.map(hc => {
      const db = dbPages.find(d => d.path === hc.path);
      return { ...db, nombre: hc.nombre, path: hc.path, es_hardcoded: true };
    }),
    ...dbPages.filter(d => !HARDCODED_PAGES.find(hc => hc.path === d.path)),
  ];

  const filtered = allPages.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.path.toLowerCase().includes(search.toLowerCase())
  );

  function seleccionarPagina(page) {
    setSelected(page);
    setCreatingNew(false);
    setHtmlActual(page.contenido || null);
    setHtmlPropuesto(null);
    setMensajes([{
      role: 'assistant',
      texto: page.contenido
        ? `Estoy listo para editar "${page.nombre}". Dime qué quieres cambiar.`
        : page.es_hardcoded
          ? `Esta es la página "${page.nombre}" (código React). Dime qué quieres cambiar — leeré el código y haré los cambios.`
          : `Página nueva. Cuéntame cómo quieres que sea y lo creo.`,
    }]);
    setSeoForm({
      meta_titulo: page.meta_titulo || '',
      meta_descripcion: page.meta_descripcion || '',
      indexada: page.indexada !== false,
      publicada: page.publicada !== false,
    });
    setSeoOpen(false);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function nuevaPagina() {
    setCreatingNew(true);
    setSelected(null);
    setNewForm({ nombre: '', path: '' });
    setHtmlActual(null);
    setHtmlPropuesto(null);
    setMensajes([]);
    setSeoOpen(false);
  }

  async function crearPagina() {
    if (!newForm.nombre.trim() || !newForm.path.trim()) return;
    const path = newForm.path.startsWith('/') ? newForm.path : '/' + newForm.path;
    const { data, error } = await supabase.from('paginas').insert({
      nombre: newForm.nombre,
      path,
      indexada: true,
      publicada: true,
    }).select().single();
    if (error) { alert(error.message); return; }
    await fetchDbPages();
    seleccionarPagina({ ...data, es_hardcoded: false });
  }

  async function enviarMensaje() {
    if (!input.trim() || chatLoading) return;
    const mensaje = input.trim();
    setInput('');
    const historial = mensajes
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.texto }));

    setMensajes(prev => [...prev, { role: 'user', texto: mensaje }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${BACKEND}/admin/paginas/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({
          path: selected?.path || '/',
          mensaje,
          html_actual: htmlPropuesto || htmlActual || null,
          historial,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMensajes(prev => [...prev, { role: 'assistant', texto: data.texto }]);
      if (data.html) setHtmlPropuesto(data.html);
    } catch (e) {
      setMensajes(prev => [...prev, { role: 'assistant', texto: `Error: ${e.message}`, isError: true }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  async function guardarHtml() {
    if (!htmlPropuesto || !selected) return;
    setSaving(true);
    const path = selected.path;

    // Si la página ya tiene ID en DB: update. Si es hardcoded sin DB entry: insert
    if (selected.id) {
      await supabase.from('paginas').update({ contenido: htmlPropuesto }).eq('id', selected.id);
    } else {
      await supabase.from('paginas').insert({
        nombre: selected.nombre,
        path,
        contenido: htmlPropuesto,
        indexada: true,
        publicada: true,
      });
    }

    setHtmlActual(htmlPropuesto);
    setHtmlPropuesto(null);
    await fetchDbPages();
    setSaving(false);
    setMensajes(prev => [...prev, { role: 'assistant', texto: '✓ Cambios guardados. La página ya sirve el nuevo contenido.' }]);
  }

  async function guardarSeo() {
    if (!selected) return;
    setSavingSeo(true);
    const payload = {
      meta_titulo: seoForm.meta_titulo,
      meta_descripcion: seoForm.meta_descripcion,
      indexada: seoForm.indexada,
      publicada: seoForm.publicada,
    };
    if (selected.id) {
      await supabase.from('paginas').update(payload).eq('id', selected.id);
    } else {
      await supabase.from('paginas').insert({ nombre: selected.nombre, path: selected.path, ...payload });
    }
    await fetchDbPages();
    setSavingSeo(false);
    setSeoOpen(false);
  }

  async function eliminarPagina() {
    if (!selected?.id || selected.es_hardcoded) return;
    if (!confirm(`¿Eliminar la página "${selected.nombre}"?`)) return;
    await supabase.from('paginas').delete().eq('id', selected.id);
    setSelected(null);
    setCreatingNew(false);
    await fetchDbPages();
  }

  // Lo que muestra el iframe
  const previewSrcDoc = htmlPropuesto || htmlActual;
  const previewSrc    = !previewSrcDoc && selected ? `${SITE_URL}${selected.path}` : undefined;

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* ── Lista izquierda ── */}
      <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '16px 12px 12px', borderBottom: '1px solid #27272a', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Páginas</span>
            <button onClick={nuevaPagina}
              style={{ background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Nueva
            </button>
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '7px 10px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingPages ? (
            <div style={{ padding: 16, color: '#71717a', fontSize: 13 }}>Cargando...</div>
          ) : filtered.map(page => {
            const isSelected = selected?.path === page.path;
            return (
              <button key={page.path} onClick={() => seleccionarPagina(page)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  background: isSelected ? '#27272a' : 'transparent',
                  border: 'none', borderBottom: '1px solid #18181b', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {page.nombre}
                  </span>
                  {page.contenido && <span style={{ color: '#10b981', fontSize: 10 }}>●</span>}
                  {page.indexada === false && <span style={{ color: '#f97316', fontSize: 10 }}>noindex</span>}
                </div>
                <span style={{ color: '#71717a', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {page.path}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Crear nueva página ── */}
      {creatingNew && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: 32, width: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: 18, fontWeight: 600 }}>Nueva página</h3>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, display: 'block', marginBottom: 6 }}>Nombre</label>
              <input value={newForm.nombre} onChange={e => setNewForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Mis servicios"
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, display: 'block', marginBottom: 6 }}>Path (URL)</label>
              <input value={newForm.path} onChange={e => setNewForm(p => ({ ...p, path: e.target.value }))}
                placeholder="/mis-servicios"
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={crearPagina} disabled={!newForm.nombre || !newForm.path}
                style={{ flex: 1, background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!newForm.nombre || !newForm.path) ? 0.4 : 1 }}>
                Crear página
              </button>
              <button onClick={() => setCreatingNew(false)}
                style={{ flex: 1, background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: 8, padding: '10px', fontSize: 14, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel principal ── */}
      {selected && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid #27272a' }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: 15, flex: 1 }}>{selected.nombre}</span>
            <code style={{ color: '#71717a', fontSize: 12, background: '#18181b', padding: '3px 8px', borderRadius: 6 }}>{selected.path}</code>
            <a href={`${SITE_URL}${selected.path}`} target="_blank" rel="noreferrer"
              style={{ color: '#71717a', fontSize: 13, textDecoration: 'none', padding: '5px 10px', borderRadius: 8, border: '1px solid #27272a' }}>
              Ver en web ↗
            </a>
            <button onClick={() => setSeoOpen(o => !o)}
              style={{ color: seoOpen ? 'white' : '#71717a', fontSize: 13, padding: '5px 10px', borderRadius: 8, border: '1px solid #27272a', background: seoOpen ? '#27272a' : 'transparent', cursor: 'pointer' }}>
              SEO
            </button>
            {!selected.es_hardcoded && (
              <button onClick={eliminarPagina}
                style={{ color: '#ef4444', fontSize: 13, padding: '5px 10px', borderRadius: 8, background: 'transparent', border: '1px solid #27272a', cursor: 'pointer' }}>
                Eliminar
              </button>
            )}
            {htmlPropuesto && (
              <button onClick={guardarHtml} disabled={saving}
                style={{ background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : '✓ Guardar cambios'}
              </button>
            )}
          </div>

          {/* SEO panel */}
          {seoOpen && (
            <div style={{ flexShrink: 0, padding: '16px 20px', borderBottom: '1px solid #27272a', background: '#0d0d0d', display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ color: '#a1a1aa', fontSize: 12, display: 'block', marginBottom: 5 }}>Título (title tag)</label>
                <input value={seoForm.meta_titulo} onChange={e => setSeoForm(p => ({ ...p, meta_titulo: e.target.value }))}
                  placeholder="Antiagencia | Mi página"
                  style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '7px 10px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 2, minWidth: 280 }}>
                <label style={{ color: '#a1a1aa', fontSize: 12, display: 'block', marginBottom: 5 }}>Meta descripción</label>
                <input value={seoForm.meta_descripcion} onChange={e => setSeoForm(p => ({ ...p, meta_descripcion: e.target.value }))}
                  placeholder="Descripción para Google..."
                  style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '7px 10px', color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#a1a1aa', fontSize: 13 }}>
                <input type="checkbox" checked={seoForm.indexada} onChange={e => setSeoForm(p => ({ ...p, indexada: e.target.checked }))} />
                Indexar en Google
              </label>
              {!selected.es_hardcoded && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#a1a1aa', fontSize: 13 }}>
                  <input type="checkbox" checked={seoForm.publicada} onChange={e => setSeoForm(p => ({ ...p, publicada: e.target.checked }))} />
                  Publicada
                </label>
              )}
              <button onClick={guardarSeo} disabled={savingSeo}
                style={{ background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: savingSeo ? 0.6 : 1, flexShrink: 0 }}>
                {savingSeo ? 'Guardando...' : 'Guardar SEO'}
              </button>
            </div>
          )}

          {/* Propuesta pendiente banner */}
          {htmlPropuesto && (
            <div style={{ flexShrink: 0, padding: '8px 20px', background: '#1a2e1a', borderBottom: '1px solid #14532d', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#4ade80', fontSize: 13, flex: 1 }}>Vista previa de la propuesta — guarda para que se aplique en la web</span>
              <button onClick={() => setHtmlPropuesto(null)}
                style={{ color: '#71717a', fontSize: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Descartar
              </button>
            </div>
          )}

          {/* Contenido: preview + chat */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Preview iframe */}
            <div style={{ flex: 1, borderRight: '1px solid #27272a', position: 'relative', overflow: 'hidden' }}>
              {previewSrcDoc ? (
                <iframe srcDoc={previewSrcDoc} style={{ width: '100%', height: '100%', border: 'none' }} title="preview" />
              ) : previewSrc ? (
                <iframe src={previewSrc} style={{ width: '100%', height: '100%', border: 'none' }} title="preview" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: 14 }}>
                  Sin contenido aún
                </div>
              )}
            </div>

            {/* Chat */}
            <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mensajes.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '90%', padding: '8px 12px', borderRadius: 10, fontSize: 13, lineHeight: '1.5',
                      background: m.role === 'user' ? '#27272a' : '#18181b',
                      color: m.isError ? '#f87171' : '#e4e4e7',
                      border: m.role === 'assistant' ? '1px solid #27272a' : 'none',
                    }}>
                      {m.texto}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: '8px 12px', color: '#71717a', fontSize: 13 }}>
                      Pensando...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ flexShrink: 0, padding: '12px 14px', borderTop: '1px solid #27272a', display: 'flex', gap: 8 }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje(); } }}
                  placeholder="Dile a la IA qué cambiar... (Enter para enviar)"
                  rows={3}
                  style={{
                    flex: 1, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8,
                    padding: '8px 10px', color: 'white', fontSize: 13, resize: 'none', outline: 'none',
                    fontFamily: 'inherit', lineHeight: '1.5',
                  }}
                />
                <button onClick={enviarMensaje} disabled={chatLoading || !input.trim()}
                  style={{
                    background: 'white', color: 'black', border: 'none', borderRadius: 8,
                    padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    opacity: (chatLoading || !input.trim()) ? 0.4 : 1, flexShrink: 0,
                  }}>
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder cuando no hay nada seleccionado */}
      {!selected && !creatingNew && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: 14 }}>
          Selecciona una página para editarla
        </div>
      )}
    </div>
  );
}
