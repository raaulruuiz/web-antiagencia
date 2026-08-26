import { useEffect, useState } from 'react';

const SUPABASE_URL = 'https://wphvmyqsxicyoifrlevt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaHZteXFzeGljeW9pZnJsZXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTc2OTYsImV4cCI6MjA5MDg3MzY5Nn0.sb_anon_placeholder';

export default function TestEmail() {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/emails_capturados?order=capturado_at.desc&limit=1`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaHZteXFzeGljeW9pZnJsZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI5NzY5NiwiZXhwIjoyMDkwODczNjk2fQ.RNcpcR9civTNd9WTiciNr5_Wb0NTIeRdzA2aCix05mA',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaHZteXFzeGljeW9pZnJsZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI5NzY5NiwiZXhwIjoyMDkwODczNjk2fQ.RNcpcR9civTNd9WTiciNr5_Wb0NTIeRdzA2aCix05mA',
      },
    })
      .then(r => r.json())
      .then(data => { setEmail(data[0] || null); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: 'system-ui', color: '#6b7280' }}>Cargando…</div>;
  if (error)   return <div style={{ padding: 40, fontFamily: 'system-ui', color: '#ef4444' }}>Error: {error}</div>;
  if (!email)  return <div style={{ padding: 40, fontFamily: 'system-ui', color: '#6b7280' }}>No hay emails capturados todavía. Usa la extensión en Gmail para capturar uno.</div>;

  const capturadoAt = new Date(email.capturado_at).toLocaleString('es-ES');

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>

      {/* Metadata bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 32px', display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Asunto</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{email.asunto || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Remitente</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>{email.remitente_nombre || '—'}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{email.remitente_email || ''}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Fecha email</div>
          <div style={{ fontSize: 14, color: '#374151' }}>{email.fecha_email || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Capturado</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{capturadoAt}</div>
        </div>
      </div>

      {/* Email body */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <iframe
          srcDoc={email.html_body}
          style={{
            width: '100%',
            maxWidth: 680,
            minHeight: 600,
            border: 'none',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: 8,
          }}
          sandbox="allow-same-origin"
          title="Email capturado"
          onLoad={e => {
            try {
              const h = e.target.contentDocument?.body?.scrollHeight;
              if (h) e.target.style.height = h + 'px';
            } catch (_) {}
          }}
        />
      </div>
    </div>
  );
}
