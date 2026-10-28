import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { MailerLiteForm, mailerLiteCSS } from "./TrabajaConNosotros2";

// /pruebas — vista previa del nuevo texto de la Anti-Auditoría.
// Copia de AntiAuditoria.jsx (/trabajaconnosotros) con los mismos estilos; la original no se toca.

const AZUL = '#0067FD';
const MORADO = '#7000FF';
const ROJO = '#E00000';

// Negritas del cuerpo en azul (h1/h2/h3 van en negro)
function B({ children }) {
  return <strong style={{ color: AZUL }}>{children}</strong>;
}

// Negritas en morado (nombres de clientas)
function M({ children }) {
  return <strong style={{ color: MORADO }}>{children}</strong>;
}

// Bullets de lista: check en círculo azul
function Bullet({ children }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <span className="flex-shrink-0 h-[2em] flex items-center">
        <span className="w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
      </span>
      <span>{children}</span>
    </div>
  );
}

// Lista numerada: número en azul
function Numero({ n, children }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <span className="flex-shrink-0 font-bold" style={{ color: AZUL }}>{n}.</span>
      <span>{children}</span>
    </div>
  );
}

// Rombo azul
function Paso({ children }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex-shrink-0 font-bold" style={{ color: AZUL }} aria-hidden="true">◆</span>
      <div className="[&>p]:mb-4 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

function H1({ children, size = "text-2xl md:text-3xl" }) {
  return <h1 className={`${size} font-bold text-gray-900 mb-4`}>{children}</h1>;
}

function H2({ children }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{children}</h2>;
}

function H3({ children }) {
  return <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{children}</h3>;
}

function Carta({ children }) {
  return (
    <div className="bg-white shadow-xl rounded-sm px-6 md:px-12 py-12 mb-10" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="text-gray-800 text-xl [&>p]:mb-4" style={{ lineHeight: '2' }}>
        {children}
      </div>
    </div>
  );
}

const Espacio = () => <p>&nbsp;</p>;

export default function Pruebas() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-tcn";
    document.head.appendChild(style);

    window.ml_webform_success_38800152 = function () {
      window.umami?.track('registro-anti-auditoria');
      const $ = window.ml_jQuery || window.jQuery;
      if ($) {
        $('.ml-subscribe-form-38800152 .row-success').show();
        $('.ml-subscribe-form-38800152 .row-form').hide();
      }
    };

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/182583896449222335/takel");

    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519";
    script.type = "text/javascript";
    script.id = "mailerlite-script-tcn";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-tcn");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-tcn");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Anti-Auditoría — Antiagencia</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">

            <Carta>
              <p style={{ color: ROJO }}>Estoy dando fechas para las primeras dos semanas de diciembre (especial enfoque en Navidad, Año Nuevo y principios de año). Luego cerramos la auditoría hasta 2027.</p>
              <Espacio />
              <H1 size="text-4xl md:text-5xl">ANTI-AUDITORÍA</H1>
              <H1 size="text-xl md:text-2xl">Completa. De email marketing. Con Raúl Ruiz</H1>
              <Espacio />
              <p>La Anti-Auditoría cuesta 1.350€ en total, con todos los impuestos incluidos.</p>
              <Espacio />
              <p>No sé si te parece caro o barato, pero tienes que entender <B>4 cosas</B>:</p>
              <Espacio />
              <p><B>La primera</B> es que son 1.350€ en total.</p>
              <Espacio />
              <p><B>La segunda</B> es que no es una consultoría grupal de estas en las que te meten con otras treinta personas en una llamada y tienes que esperar una hora para que, con suerte, te atiendan. Tampoco hay contenido grabado que te obligue a ver.</p>
              <Espacio />
              <p>Esta auditoría es una única reunión de trabajo, posterior a un proceso de investigación. No es una charla. Será una reunión que dure lo que tenga que durar, en la que te presentaré un documento que tendrá el número de páginas que tenga que tener.</p>
              <Espacio />
              <p>Ahora entramos en todos los detalles, pero es una reunión y un documento.</p>
              <Espacio />
              <p><B>La tercera cosa</B> que tienes que entender es una historia (real) muy breve que leí hace poco y que me encaja bastante para este punto:</p>
              <Espacio />
              <p>Un tipo muy millonario hizo una fiesta. Y entre los asistentes había otro tipo millonario, pero menos que el organizador. Pues bien, otro de los asistentes le dijo al tipo menos millonario que el organizador:</p>
              <Espacio />
              <p>— ¿Sabes que ese tío gana en un día lo que tú en un año?</p>
              <Espacio />
              <p>El tipo se encogió de hombros, indiferente, luego miró al que le había hecho la pregunta.</p>
              <Espacio />
              <p>— Pero yo tengo algo que este millonario nunca tendrá.</p>
              <Espacio />
              <p>— ¿El qué?</p>
              <Espacio />
              <p>— Suficiente.</p>
              <Espacio />
              <p>Bien. Esto te lo digo porque no necesito tu dinero. Aún no soy millonario, pero vivo muy tranquilo en mi pueblo en la montaña.</p>
              <Espacio />
              <p>Lejos de querer vacilarte, te lo digo para que decidas tranquilamente si esto es para ti o no. Yo trabajo cada día porque amo mi trabajo y amo contar historias. Lo hago constantemente en todo lo que escribo.</p>
              <Espacio />
              <p>Y no me malinterpretes, también amo el dinero. Pero no soy de los que te van a perseguir hasta la saciedad para que me compres. Como te digo, no lo necesito.</p>
              <Espacio />
              <p>Vas a invertir tu dinero y tu tiempo en un tío que ha levantado su negocio enviando emails, y que ha hecho lo mismo para más de 60 tiendas online. No hago absolutamente nada que no haya demostrado ya decenas de veces.</p>
              <Espacio />
              <p>Si esto te parece superficial, o chulesco, o arrogante, o no te gusta mi estilo, te puedes marchar, te deseo lo mejor. De verdad, espero que te vaya bien.</p>
              <Espacio />
              <p>Ahora bien, aquí <u>te voy a aportar criterio</u>. Algo que escasea mucho a la hora de escribir emails.</p>
              <Espacio />
              <p>Y la <B>cuarta cosa que tienes que saber</B>, como diría el Josep, el de los pistachos… es que soy Raúl, y escribo emails. Encantado.</p>
              <Espacio />
              <H2>¿DE QUÉ VA ESTO?</H2>
              <p>Ya sabes…</p>
              <Espacio />
              <p>Algunos envían 2 newsletters a la semana. O una al día. O una al mes. Unos tienen 7 automatizaciones. O 9. O ninguna. Hay quien piensa que es mejor hacer emails cortos con muchas imágenes porque la gente no lee. O quien escribe emails largos sin imágenes. Unos quieren delegar el email. O dejar de depender tanto de la publicidad. O de las redes. O enviar sólo promociones. O dejar de hacerlas. Hay quien escribe los emails siempre a última hora. O quién se programa la semana entera para que no le pille el toro.</p>
              <Espacio />
              <p>Hacen de todo sin saber muy bien por qué. Sin un criterio claro. <u>Son como las viejas de los pueblos, mirando por el visillo de la ventana lo que hace el vecino.</u></p>
              <Espacio />
              <p>Si te ha pasado, lee este caso, que podría ser inventado, pero es real:</p>
              <Espacio />
              <p><M>Inés</M> es una clienta que enviaba 2 campañas a la semana. Cada email vendía más de 1.000€, empezamos a enviar 6, y siguieron vendiendo más de 1.000€ cada uno. Multiplicamos por 3 sin tocar nada más.</p>
              <Espacio />
              <H2>NO NECESITAS</H2>
              <p>No necesitas a nadie más que te diga lo que tienes que hacer. La mayoría ya tenemos suficiente información.</p>
              <Espacio />
              <p>Todos sabemos que el email es el canal más rentable (si no lo sabes, esto no es para ti). Y muchos piensan, con bastante razón, que pueden vender más por ahí.</p>
              <Espacio />
              <p>Por eso ven tutoriales en youtube, preguntan a conocidos… o incluso ven alguna clase gratuita de algún vendecursos que les sale en anuncios.</p>
              <Espacio />
              <p>Mucho ruido y pocas nueces.</p>
              <Espacio />
              <p><B>No necesitas más información</B>, quizá ni siquiera tienes que hacer más de lo que ya haces. Se trata de hacer lo que tu marca necesita y puede permitirse. Por eso…</p>
              <Espacio />
              <p>La Anti-Auditoría no tiene grupos, ni clases en directo, ni contenido grabado, ni 400 recursos, ni llamadas semanales, ni audios adicionales, ni comunidad de whatsapp, ni agentes de IA, ni consultores privados.</p>
              <Espacio />
              <p><B>Somos tú y yo.</B> Y un proceso de investigación concluye en un dossier y en una reunión que se quedará grabada. Nada más. <B>No pagas por tener más cosas, pagas por criterio, que es lo más importante.</B></p>
              <Espacio />
              <p><B>Te voy a dar la estrategia concreta de email marketing para los próximos 90 días.</B></p>
              <Espacio />
              <p>3 meses de estrategia recogidos en un documento que, como te decía, tendrá las páginas que tenga que tener. Lo importante no es lo largo, es lo de dentro.</p>
              <Espacio />
              <p>Y te lo presentaré en una reunión, que durará lo que tenga que durar, y en la que me podrás preguntar cualquier duda que te surja. Aquí no hay preguntas tontas, hay tontos que no preguntan.</p>
              <Espacio />
              <p><B>Y no, no es una carpeta de deberes para darte más trabajo y que le dediques el tiempo que no tienes.</B></p>
              <Espacio />
              <p>Estará dividido en 5+1 módulos, y organizado en bloques de trabajo que no te llevarán más de 20 minutos diarios.</p>
              <Espacio />
              <p><B>Por lo que si tienes ese tiempo, es suficiente.</B> Si tienes más, mejor. Si tienes equipo, también mejor.</p>
              <Espacio />
              <p>Aquí tienes otro caso que podría ser inventado, pero no lo es:</p>
              <Espacio />
              <p><M>Celia</M>, con solo 3 emails por semana, ha conseguido, en menos de un año, que varias clientas le hayan comprado incluso más de veinte veces. Y un tercio, compran de nuevo cada mes.</p>
              <Espacio />
              <H2>LO MÁS IMPORTANTE</H2>
              <p><B>Te visitaré en persona.</B></p>
              <Espacio />
              <p>En esta época de la IA, me parece lo más importante. Porque sí, puedo ver tu web, tus fotos, preguntar a la IA que me haga un resumen de tu empresa… Eso está bien pero, entre tú y yo, no es suficiente.</p>
              <Espacio />
              <p>Lo que no puede hacer la IA es probar tu producto, tocarlo, sentirlo, saborearlo si es comestible. EXPERIMENTARLO.</p>
              <Espacio />
              <p><B>Y yo sí quiero hacer eso.</B></p>
              <Espacio />
              <p>Y conocerte. Quiero saber cómo eres en persona cuando estás trabajando, y cuando no lo haces. Quiero entender por qué tu marca es cómo es y que me cuentes toda la historia, y los detalles. Quiero saber si eres más o menos alto que yo (mido 1,89), si cuentas chistes cuando hablamos, si eres una persona seria. Quiero que me cuentes los malos momentos, y los buenos, cómo los viviste. Quiero ver tu cara cuando me lo cuentas.</p>
              <Espacio />
              <p><B>Quiero saberlo todo.</B></p>
              <Espacio />
              <p>Luego hablaré con tus clientes. Llamaré personalmente a algunos clientes para preguntarles por su experiencia, sus sensaciones, sus opiniones, por qué compraron y por qué lo volverían a hacer.</p>
              <Espacio />
              <p>Investigaré qué hace tu cliente en internet, qué ve, qué comenta, cómo habla, qué le preocupa. Iré a lugares presenciales donde se encuentre, para escucharle hablar. Me mezclaré como un ninja entre tus potenciales clientes.</p>
              <Espacio />
              <p>Y por supuesto, miraré todo lo que has hecho hasta ahora. El pasado nos habla mucho del presente y nos permite preparar el futuro. Illo, suena muy filosófico, pero es verdad. Leeré los emails que has enviado, veré los vídeos y anuncios que has publicado y analizaré las decisiones más importantes que has tomado para tu tienda.</p>
              <Espacio />
              <p><B>¿Todo esto para qué?</B></p>
              <Espacio />
              <p>Para darte criterio. Este será el módulo +1 de la Anti-Auditoría. Un resumen, con sus conclusiones de la investigación que voy a hacer. Esto no va de instalarte un sistema en 7 días. Va de dedicar el tiempo necesario a entender TU negocio y TU cliente, no un copia y pega que le entregue a cualquiera, con mensajes muy bonitos pero que no dicen nada.</p>
              <Espacio />
              <p>Quizá puede que te pase como a <M>Sheyla</M>, que entendiendo a su público y haciendo un pequeño cambio en el formulario de registro y el estilo de comunicación, en pocas semanas pasó de no vender por campañas, a vender en cada campaña que manda.</p>
              <Espacio />
              <p>Lo mismo hicimos en los flujos, entendimos al cliente y pasamos de 7 a 22 automatizaciones, multiplicando por 10 los resultados.</p>
              <Espacio />
              <H2>LO GORDO</H2>
              <p>Fíjate que hasta ahora solo hemos hablado del primer módulo de la Anti-Auditoría. También es que es el más importante, eso es verdad. ¿Pero qué hay de los otros?</p>
              <Espacio />
              <p>Los siguientes cuatro módulos ya son los bloques de trabajo. Es el criterio aplicado a tu tienda. Lo que tienes que hacer, lo que tienes que dejar de hacer, lo que puedes mejorar, lo que tienes que cambiar.</p>
              <Espacio />
              <p>Ni más ni menos que eso.</p>
              <Espacio />
              <p>Podría venir con un dossier de mil páginas en el que te diga lo que puedes hacer, y me faltarían otras mil para escribirlo todo. No quiero eso. Y tú tampoco.</p>
              <Espacio />
              <p>En el <B>primer módulo</B> verás los cambios rápidos que te traerán <B>más beneficio en menos tiempo</B>.</p>
              <Espacio />
              <p>En el <B>segundo</B>, será lo que te traerá más beneficio pero lleva más tiempo.</p>
              <Espacio />
              <p>En el <B>tercero</B>, ajustes y detalles que implementas rápido, pero que tienen menos impacto en los resultados.</p>
              <Espacio />
              <p>Y <B>por último</B>, recomendaciones y consejos que no son obligatorios de implementar, pero que si lo haces, notarás la diferencia. Suelen ser misiones arriesgadas, atrevidas, que desafían lo que has venido haciendo, pero que la recompensa que te darán, será grande.</p>
              <Espacio />
              <p>Todo está organizado para que lo puedas implementar con una <B>dedicación máxima de 20 minutos al día.</B> Si le puedes dedicar más, mejor. Si tienes alguien que lo haga por ti, también mejor. Pero con 20 minutos, es suficiente.</p>
              <Espacio />
              <p><B>Es un plan de 90 días.</B> Por supuesto que incluirá calendario de fechas importantes, planteamiento para las campañas que tienes que hacer, todo con tiempo y bien preparado.</p>
              <Espacio />
              <p>¿Cómo me aseguro que la implementación no te lleve más de 20 minutos?</p>
              <Espacio />
              <p>Obvio hay parte de habilidad en todo, pero en cada módulo tendrás:</p>
              <Espacio />
              <Bullet><u>Ejemplos de cómo otras marcas implementan lo que te recomiendo</u>. Tanto de tu sector, como de otros (se consigue mucho criterio mirando fuera de tu sector).</Bullet>
              <Bullet><u>Propuestas escritas por mí</u> para tu propia marca. Podrás usarlas o adaptarlas.</Bullet>
              <Bullet><u>Descripciones, imágenes y guías</u> de las plataformas de email para que sepas donde ir en cada momento.</Bullet>
              <Bullet><u>Guía y detalles que tienes que tener en cuenta</u> a la hora de realizar los cambios.</Bullet>
              <Espacio />
              <p>En definitiva, <B>todo lo que necesitas para poder trabajar teniendo delante solo la auditoría</B>, no mil pestañas abiertas.</p>
              <Espacio />
              <p>Lee esto, que son casos reales:</p>
              <Espacio />
              <p>A <M>Neus</M> el email le lleva 10 minutos cada día, y más de la mitad de las ventas de su tienda, vienen por ahí.</p>
              <Espacio />
              <p>U <M>otro cliente</M>, que factura el 70% de lo que vende por email, y le dedica menos de 20 minutos al día.</p>
              <Espacio />
              <H2>LA VENTAJA PRINCIPAL</H2>
              <p>La Anti-Auditoría es de por sí un producto que se rentabiliza con 3-4 emails que envíes. No es porque lo haga yo ni nada por el estilo. No soy tan importante. Es porque lo he visto en decenas de tiendas.</p>
              <Espacio />
              <p>Pero es que este último módulo de la Anti-Auditoría, el módulo 5…</p>
              <Espacio />
              <p>Aquí es donde todo el mundo pasa de decir "esta mierda vale cada céntimo de euro que he pagado por ella" a decir "esto es el mayor regalo que me han hecho nunca".</p>
              <Espacio />
              <p>En este módulo dejo de darte criterio para enseñarte a tener criterio.</p>
              <Espacio />
              <p><B>¿Qué ocurre si implemento todo y no funciona?</B></p>
              <Espacio />
              <p>Esa es la pregunta que todos se hacen.</p>
              <Espacio />
              <p>Por eso, este módulo es para responder esa pregunta. En los demás módulos tendrás una explicación del razonamiento por el que llego a proponerte lo que te propongo.</p>
              <Espacio />
              <p><B>Aquí entramos en el detalle, en las tripas:</B> Cómo pienso para tomar las decisiones. Qué miro, qué dejo de mirar, cómo lo evalúo… Te voy a enseñar a analizar cada cosa que implementas para que no me necesites más. Ni a mí, ni a nadie.</p>
              <Espacio />
              <p>Te voy a mostrar posibles escenarios, cómo actuar en cada uno, cómo desarrollar el plan A, B y C de cada cambio que haces, para que si algo falla, sepas:</p>
              <Espacio />
              <Numero n={1}>Qué ha fallado.</Numero>
              <Numero n={2}>Por qué ha fallado.</Numero>
              <Numero n={3}>Qué puedes hacer para corregirlo.</Numero>
              <Numero n={4}>Cómo medirlo de nuevo.</Numero>
              <Espacio />
              <p>Este módulo solo justifica los 1.350€ que vale la Anti-Auditoría. De hecho es por lo que me pagan mis clientes de servicio y de consultoría (y pagan mucho más).</p>
              <Espacio />
              <p>Este criterio es el que aplicamos con <M>Inés</M> hace un año. Tenía muy poco beneficio, y con una anti-promoción especial de una semana, aumentamos el beneficio total de la tienda un 30% ad eternum (para siempre).</p>
              <Espacio />
              <p>O a <M>Delia</M>, con quién hicimos un lanzamiento sin publicidad, a una lista de menos de 1000 personas y generamos 25.000€ en menos de una semana.</p>
              <Espacio />
              <H2>PLAZOS</H2>
              <p>Sencillo:</p>
              <Espacio />
              <Paso>Una vez que rellenas el formulario, me pongo en contacto contigo al día siguiente para decirte si me interesa o no el proyecto.</Paso>
              <Paso>Si es que sí, te paso las fechas disponibles.</Paso>
              <Paso>Eliges.</Paso>
              <Paso>Te envío la factura y el contrato.</Paso>
              <Paso>Pagas el total por adelantado.</Paso>
              <Paso>Creo un grupo de WhatsApp por el que te pediré la info y el material que voy a necesitar para trabajar.</Paso>
              <Paso>Agendamos la visita presencial.</Paso>
              <Paso>Trabajo sobre el dossier.</Paso>
              <Paso>Nos vemos en la reunión online.</Paso>
              <Paso>Te envío la grabación de la reunión y el dossier.</Paso>
              <Espacio />
              <H2>FORMAS DE PAGO</H2>
              <p>Cobro por adelantado <u>siempre</u>.</p>
              <Espacio />
              <p>Una vez que te mande la factura, tienes dos días para realizar el pago de la Anti-Auditoría.</p>
              <Espacio />
              <p>Si no se ha pagado en ese tiempo, la fecha elegida quedará a disposición de otro cliente.</p>
              <Espacio />
              <p>En el enlace de pago, podrás fraccionarlo en 3 plazos sin intereses con Klarna. Si quieres pagar por transferencia bancaria, me lo tendrás que decir.</p>
              <Espacio />
              <p>Y ya estaría.</p>
              <Espacio />
              <p>Si te interesa, aquí abajo tienes el formulario para que estudie tu caso.</p>
              <Espacio />
              <p>Disfruta la vida.</p>
              <Espacio />
              <p>Raúl.</p>
              <Espacio />
              <MailerLiteForm buttonText="Estudia mi caso" />
              <div className="clear-both" />
              <Espacio />
              <H2>PREGUNTAS</H2>
              <H3>¿Cómo funciona exactamente?</H3>
              <p>Te entrego un dossier con las páginas que tenga que tener y te lo presento en una reunión que dure lo que tenga que durar, luego te paso también la grabación. Para hacer este dossier iré a verte en persona y dedicaré el tiempo necesario a investigar y redactar el plan para los siguientes 90 días a la reunión que vamos a tener.</p>
              <Espacio />
              <H3>¿Se puede pagar a plazos?</H3>
              <p>Sí, en el momento del pago puedes elegir si pagarlo de una vez o financiarlo con Klarna a 3 meses sin intereses, es decir, pagas el mismo precio pero dividido en 3 meses.</p>
              <Espacio />
              <H3>¿Cuánto cuesta?</H3>
              <p>¿De verdad? 1.350€ con todos los respectivos impuestos incluidos.</p>
              <Espacio />
              <H3>¿Cuándo son la visita presencial y la reunión?</H3>
              <p>La reunión final la eliges al inicio, entre las fechas que tengo disponibles. Esto te lo paso cuando rellenes el formulario, si me interesa el proyecto. La visita presencial la coordinamos después de realizar el pago.</p>
              <Espacio />
              <H3>¿Entonces pago antes o en el momento de empezar?</H3>
              <p>El pago se hace en el momento en el que eliges una de las fechas disponibles. Es decir, para reservar la fecha debes realizar primero el pago, una vez hecho, tendrás tu plaza y fecha aseguradas.</p>
              <Espacio />
              <H3>¿Qué incluye?</H3>
              <p>Un plan de 90 días, separado en módulos y en tareas que no te van a llevar más de 20 minutos. Está organizado para que hagas primero lo que más resultados te va a traer en menor tiempo.</p>
              <Espacio />
              <H3>¿Cuánto tiempo le tengo que dedicar al día?</H3>
              <p>¿Otra vez? 20 minutos al día. Te doy todo lo que necesitas para que sea así. Si tienes más tiempo, mejor. Si tienes equipo, mejor.</p>
              <Espacio />
              <H3>¿No es caro 1.350€?</H3>
              <p>No, es barato.</p>
              <Espacio />
              <H3>¿Y si mi sector es raro?</H3>
              <p>Raro tú.</p>
              <Espacio />
              <H3>¿Hay grupos, comunidad o recursos adicionales?</H3>
              <p>No, es un dossier y una reunión. Nada más. Bueno sí, criterio. Mucho.</p>
              <Espacio />
              <H3>¿Qué pasa si aplico algo y no funciona?</H3>
              <p>Módulo 5.</p>
              <Espacio />
              <H3>¿Cómo es el proceso de apuntarse?</H3>
              <p>Rellenas el formulario - Si me gusta el proyecto te paso las fechas disponibles - Eliges - Te envío la factura y el contrato - Pagas - Creo un grupo de WhatsApp por el que te pediré la info y el material - Agendamos la visita presencial - Trabajo sobre el dossier - Nos vemos en la reunión online - Te envío la grabación de la reunión y el dossier.</p>
              <Espacio />
              <MailerLiteForm buttonText="Estudia mi caso" />
              <div className="clear-both" />
              <Espacio />
              <p><B>P.D.</B> Recuerda que la vida es para disfrutarla. Y es mejor hacerlo con un negocio que crece, no con uno que se estanca.</p>

              {/* Firma con logo, igual que en /trabajaconnosotros */}
              <div className="clear-both flex items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-200">
                <img
                  src="https://media.base44.com/images/public/697678eac9cf34e2aefb7d57/82d53b854_logonegro.png"
                  alt="AntiAgencia"
                  className="h-10 w-auto"
                />
                <span className="font-bold text-gray-900 text-xl tracking-wide" style={{ fontFamily: "'Rubik', monospace" }}>Antiagencia</span>
              </div>
            </Carta>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
