import React, { useState, useEffect } from "react";

const RAILWAY_URL = "https://automatizaciones-production-a376.up.railway.app";
const SESSION_KEY = "q3_acceso_email";

const bloques = [
  {
    titulo: "BLOQUE 0 - BONUS INDISCIPLINADO",
    descripcion: "Cómo gestionar tu publicidad durante este trimestre",
    paginas: 16,
    link: "https://drive.google.com/file/d/1S0iv3qXRHSGndovpWjg5VGA0OeiBXZit/view?usp=drivesdk",
  },
  {
    titulo: "BLOQUE 1 - CONTEXTO",
    descripcion: "Entiende el contexto en el que estamos y cómo se comportará la gente",
    paginas: 16,
    link: "https://drive.google.com/file/d/1qrwtVUd154HnVvFomeYU75blLZI5dYgm/view?usp=drivesdk",
  },
  {
    titulo: "BLOQUE 2 - CREATIVIDAD Y MENSAJE",
    descripcion: "Entiende qué mensajes dar, y cómo darlos de forma diferencial",
    paginas: 7,
    link: "https://drive.google.com/file/d/1dfUNR1wMzjTFUdpEMAcNYgPa4mLfJR6e/view?usp=drivesdk",
  },
  {
    titulo: "BLOQUE 3 - CAMPAÑAS FLASH",
    descripcion: "Cómo hacer mejores campañas que tus competidores",
    paginas: 15,
    link: "https://drive.google.com/file/d/1gKgRc7ZDqnOJUMkUFvi-y7n0x4FsvR9v/view?usp=drivesdk",
  },
];

const blueText = { color: '#0067FD' };
const gradientBadge = { background: 'linear-gradient(135deg, #000000 0%, #0067FD 100%)' };

function Gate({ onAcceso }) {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('idle'); // idle | cargando | error

  async function verificar(e) {
    e.preventDefault();
    if (!email) return;
    setEstado('cargando');
    try {
      const res = await fetch(`${RAILWAY_URL}/api/verificar-acceso-q3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.acceso) {
        sessionStorage.setItem(SESSION_KEY, email);
        onAcceso();
      } else {
        setEstado('error');
      }
    } catch {
      setEstado('error');
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        fontFamily: "'Georgia', serif",
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#111' }}>
          Accede al Planning Q3
        </h2>
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '28px', lineHeight: '1.6' }}>
          Accede con el email con el que te registraste.
        </p>
        <form onSubmit={verificar}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEstado('idle'); }}
            required
            style={{
              width: '100%', padding: '12px 14px', fontSize: '15px',
              border: '1px solid #ccc', borderRadius: '4px',
              marginBottom: '12px', boxSizing: 'border-box',
              fontFamily: "'Georgia', serif",
            }}
          />
          {estado === 'error' && (
            <p style={{ color: '#cc0000', fontSize: '13px', marginBottom: '12px' }}>
              Este email no tiene acceso. Si crees que es un error, escríbenos.
            </p>
          )}
          <button
            type="submit"
            disabled={estado === 'cargando'}
            style={{
              width: '100%', padding: '13px',
              backgroundColor: estado === 'cargando' ? '#999' : '#0067FD',
              color: '#fff', border: 'none', borderRadius: '4px',
              fontSize: '15px', fontWeight: '700', cursor: estado === 'cargando' ? 'default' : 'pointer',
              fontFamily: "'Georgia', serif",
            }}
          >
            {estado === 'cargando' ? 'Verificando...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PlanningQ3() {
  const [acceso, setAcceso] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) setAcceso(true);
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Georgia', 'Times New Roman', Times, serif" }}>
      {!acceso && <Gate onAcceso={() => setAcceso(true)} />}

      {/* Hero */}
      <div className="text-white text-center px-6 py-24 md:py-32" style={{ background: 'linear-gradient(135deg, #000000 0%, #7000ff 100%)' }}>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4" style={{ fontFamily: "'Georgia', serif" }}>
          Planning Q3
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
          Prepárate para los próximos 3 meses
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bloques.map((bloque) => (
            <a
              key={bloque.titulo}
              href={bloque.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between border border-zinc-200 rounded-2xl p-7 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center" style={gradientBadge}>
                  <span className="text-white text-sm font-bold">
                    {bloque.titulo.split(" ")[1]}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-2 leading-snug" style={{ ...blueText, fontFamily: "'Georgia', serif" }}>
                  {bloque.titulo}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                  {bloque.descripcion}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-150" style={{ ...blueText, fontFamily: "'Georgia', serif" }}>
                Accede al documento de {bloque.paginas} páginas
                <span className="text-base">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
