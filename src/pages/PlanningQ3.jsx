import React from "react";

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

const gradientBadge = {
  background: 'linear-gradient(135deg, #000000 0%, #0067FD 100%)',
};

export default function PlanningQ3() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Georgia', 'Times New Roman', Times, serif" }}>
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
