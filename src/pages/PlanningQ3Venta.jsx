import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

const STRIPE_URL = "https://buy.stripe.com/test_9B63cv84R8rbc9T2aWgfu00";

function BuyButton() {
  return (
    <div className="mt-8 mb-16">
      <p><br /></p>
      <a
        href={STRIPE_URL}
        style={{
          display: 'inline-block',
          backgroundColor: '#0067FD',
          color: '#ffffff',
          fontFamily: "'Georgia', serif",
          textDecoration: 'none',
          padding: '16px 40px',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7000FF'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0067FD'}
      >
        <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.3' }}>
          Conseguir el plan para Q3 · 25€
        </div>
        <div style={{ fontSize: '13px', fontWeight: '400', marginTop: '4px', opacity: 0.9 }}>
          Todos los impuestos incluidos
        </div>
      </a>
    </div>
  );
}

export default function PlanningQ3Venta() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-5xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed" style={{ lineHeight: '2' }}>

              <h1 className="text-3xl md:text-5xl text-gray-900 leading-tight mb-4 font-bold">Hay algo que debes hacer siempre…&nbsp;</h1>
              <h1 className="text-3xl md:text-5xl text-gray-900 leading-tight mb-4 font-bold">Y que no te puedes saltar…&nbsp;</h1>
              <h1 className="text-3xl md:text-5xl text-gray-900 leading-tight mb-4 font-bold">Si quieres que te vaya bien en tu tienda…</h1>
              <p>&nbsp;</p>
              <h2 className="text-2xl md:text-3xl text-gray-900 leading-tight mb-4" style={{ fontWeight: 400 }}>Y eso es planificar con tiempo.</h2>
              <p><br /><br /></p>

              <p>Si eres de los que piensa que ya lo haces y que no lo necesitas, bien. Puedes marcharte.</p>
              <p>&nbsp;</p>
              <p>En cambio, si eres de los que se preocupan por que les vayan bien las cosas, sigue leyendo.</p>
              <p>&nbsp;</p>
              <p>Ya sabes que el mundo se organiza por trimestres.</p>
              <p>La escuela.</p>
              <p>El trabajo.</p>
              <p>Las grandes organizaciones.</p>
              <p>Todo….</p>
              <p>&nbsp;</p>
              <p>Y en una tienda online, también.</p>
              <p>&nbsp;</p>
              <p>Tiene sentido organizarse de forma trimestral.</p>
              <p>&nbsp;</p>
              <p>Mirar los 3 meses que tenemos por delante y plantear con tiempo qué vamos a hacer.</p>
              <p>&nbsp;</p>
              <p>Para estar preparados y que luego no nos pille el toro.</p>
              <p>&nbsp;</p>
              <p>Puede parecer algo fácil, pero <strong><span style={{ color: '#0067FD' }}>hay muchos factores que tener en cuenta:</span></strong></p>
              <p>&nbsp;</p>
              <p>¿Cómo está el mundo?</p>
              <p>¿Qué piensa hacer la gente respecto a como está el mundo?</p>
              <p>¿Es igual todos los meses?</p>
              <p>¿Qué hago yo cada mes?</p>
              <p>¿Qué campañas hay?</p>
              <p>¿Cómo organizo estas campañas?</p>
              <p>¿Qué ofrezco?</p>
              <p>&nbsp;</p>
              <p>Y un largo etcétera.</p>
              <p>&nbsp;</p>
              <p>Es por eso que he preparado un planning completo para el tercer trimestre, o Q3 como dicen los americanos.</p>
              <p>&nbsp;</p>
              <p>Para que no tengas que pensar mucho.</p>
              <p>&nbsp;</p>
              <p><strong>Y desaparece el domingo 05 de Julio. Para siempre.</strong></p>
              <p>&nbsp;</p>
              <BuyButton />

              <h3 className="text-2xl md:text-4xl text-gray-900 mb-4 font-bold">TÓMATE UNA CERVEZA</h3>
              <p>&nbsp;</p>
              <p>Quiero decir, planificar lleva tiempo. Horas. Días incluso si quieres hacerlo bien.</p>
              <p>&nbsp;</p>
              <p>Pero con este planning no tienes que invertir este tiempo.</p>
              <p>&nbsp;</p>
              <p>Ya lo hice yo por ti. Así que aprovéchalo para relajarte o hacer otras cosas.</p>
              <p>&nbsp;</p>
              <p>Con el planning que te he preparado solo vas a tener que pensar los detalles de tu negocio, que asumo que los conoces.</p>
              <p>&nbsp;</p>
              <p>Lo demás está hecho.</p>
              <p>&nbsp;</p>
              <p>Por cierto, yo soy más de cocacola zero.</p>
              <p>&nbsp;</p>
              <BuyButton />

              <h3 className="text-2xl md:text-4xl text-gray-900 mb-4 font-bold">LOS MÁS RICOS LO DICEN</h3>
              <p>&nbsp;</p>
              <p>El señor Warren Buffett, uno de los hombres más ricos del mundo, y uno de los mejores inversores…</p>
              <p>&nbsp;</p>
              <p>Dijo esto:</p>
              <p>&nbsp;</p>
              <p>&nbsp;</p>
              <p style={{ textAlign: 'center' }}><em>"Nunca se puede predecir la economía, pero sí se puede preparar para ella"</em></p>
              <p style={{ textAlign: 'center' }}><br /><br /></p>
              <p>No sabemos que va a pasar.</p>
              <p>&nbsp;</p>
              <p>Por eso tenemos que mirar ciertos datos para prepararnos.</p>
              <p>&nbsp;</p>
              <p>Y no lo digo yo.</p>
              <p>&nbsp;</p>
              <p>Lo dice un tío que haciendo esto se ha hecho multimillonario.</p>
              <p>&nbsp;</p>
              <p>Tampoco te digo que con esto te vas a hacer rico los próximos 3 meses.</p>
              <p>&nbsp;</p>
              <p>Pero al menos, muy probablemente, ganarás más que si no lo haces.</p>
              <p>&nbsp;</p>
              <p>Y no se tú, pero a mi me gusta ganar dinero. Por eso lo hago.</p>
              <p><br /><br /></p>
              <BuyButton />

              <h3 className="text-2xl md:text-4xl text-gray-900 mb-4 font-bold">SERÁS EL PUTO AMO</h3>
              <p>&nbsp;</p>
              <p>O la puta ama.</p>
              <p>&nbsp;</p>
              <p>¿Sabes esa sensación de mirar atrás y decir "<em>joder, lo conseguí</em>"?</p>
              <p>&nbsp;</p>
              <p>¿Ese orgullo de construir algo con tus propias manos?</p>
              <p>&nbsp;</p>
              <p>Para eso emprendemos, para eso montamos nuestros negocios.</p>
              <p>&nbsp;</p>
              <p>Y para que siga creciendo y puedas mirar atrás y decir: "<em>Puta madre que buen verano he hecho</em>" tienes que planificar bien.</p>
              <p>&nbsp;</p>
              <p>Que oye, saber lo que tienes que hacer te permite dejártelo hecho y pillarte unas buenas vacaciones sin preocuparte de nada.</p>
              <p>&nbsp;</p>
              <p>Cada uno con lo suyo.</p>
              <p><br /><br /></p>
              <BuyButton />

              <h3 className="text-2xl md:text-4xl text-gray-900 mb-4 font-bold">¿TONTOS O GENIOS?</h3>
              <p>&nbsp;</p>
              <p>De nuevo, el gran Warren Buffett nos da la clave.</p>
              <p><br /><br /></p>
              <p style={{ textAlign: 'center' }}><em>"Un tonto con un plan puede ganarle a un genio sin un plan"</em></p>
              <p style={{ textAlign: 'center' }}><br /><br /></p>
              <p>Con esto no digo que seas tonto, ni mucho menos.</p>
              <p>&nbsp;</p>
              <p>Entiendeme.</p>
              <p>&nbsp;</p>
              <p>Pero si te digo que, por experiencia, la mayoría de tiendas se la pasan improvisando.</p>
              <p>&nbsp;</p>
              <p>Por tanto, el adelntarte y planificar con tiempo…</p>
              <p>Hacer las cosas con tiempo…</p>
              <p>Guardar el tiempo de improvisar para revisar en vez de apagar fuegos…</p>
              <p>&nbsp;</p>
              <p>Y sobre todo, pasar a toda la competencia que no lo hace….</p>
              <p>&nbsp;</p>
              <p>Si quieres todo eso.</p>
              <p><br /><br /></p>
              <BuyButton />

              <p>Me despido por aquí.</p>
              <p>&nbsp;</p>
              <p>Raúl Ruiz.</p>
              <p><br /><br /></p>
              <p><strong>P.D.</strong> ¿Y si planificar con tiempo realmente te hace ganar más dinero? ¿Dejarás otra vez que te pille el toro? ¿Volverías a improvisar? ¿Lo dejarías para el año que viene? Es lo único que no te puedes saltar en tu tienda online.</p>

            </div>
          </div>
        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
