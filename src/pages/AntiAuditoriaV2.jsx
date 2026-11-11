import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { MailerLiteForm, mailerLiteCSS } from "./TrabajaConNosotros2";

// /trabajaconnosotros — nueva página de venta: documento «Página Venta», desde su página 11 (11-11-2026).
// La versión anterior (Anti-Auditoría del 28-10-2026) queda archivada sin ruta en AntiAuditoria.jsx.

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

// Rombo azul
function Paso({ children }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex-shrink-0 font-bold" style={{ color: AZUL }} aria-hidden="true">◆</span>
      <div className="[&>p]:mb-4 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

function H2({ children }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{children}</h2>;
}

function H3({ children, centered = false }) {
  return <h3 className={`text-xl md:text-2xl font-bold text-gray-900 mb-2${centered ? ' text-center' : ''}`}>{children}</h3>;
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

export default function AntiAuditoriaV2() {
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
        <title>Acompañamiento de email marketing 1 a 1 — Antiagencia</title>
        <meta name="description" content="Durante 90 días te ayudo a sacar más partido al email marketing de tu tienda online: visita presencial, un plan para cada mes y revisión de resultados." />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">

            <Carta>
              <p>{"Te aviso, esta página es larga, pero leerla entera puede ser algo muy provechoso para ti y para tu tienda."}</p>
              <Espacio />
              <p>{"Normalmente lo que hace la gente en páginas así de largas es bajar para ver el precio. "}</p>
              <Espacio />
              <p>{"Es algo normal, yo también lo hago. Pero como me gustaría que siguieras un orden y poder explicarte todo bien, te lo voy a poner al principio. Ves el precio y ahora te comento lo que incluye."}</p>
              <Espacio />
              <p>{"¿Te parece bien?"}</p>
              <Espacio />
              <p>{"Estupendo."}</p>
              <Espacio />
              <p>{"Mi acompañamiento dura 3 meses y el precio es de 1.350€ en total, impuestos incluidos. Las formas de pago y el fraccionamiento te lo detallo más abajo."}</p>
              <Espacio />
              <p><span style={{ color: ROJO }}>{"(Solo me queda una plaza para empezar en diciembre)"}</span></p>
              <Espacio />
              <Espacio />
              <p><B>{"Dicho esto"}</B>{". Tu email marketing probablemente podría estar dando mucho más de sí. La pregunta es, ¿cómo se hace?"}</p>
              <Espacio />
              <p>{"Verás, hace poco estuve hablando con un amigo que tiene varias tiendas online."}</p>
              <Espacio />
              <p>{"Y me contó algo que me tuvo la cabeza comida unos días."}</p>
              <Espacio />
              <p>{"La cosa es que hace aproximadamente un año contrató a un consultor externo para que le ayudara a tomar mejores decisiones sobre su negocio."}</p>
              <Espacio />
              <p>{"No un consultor de pacotilla de estos que te meten en sesiones grupales con 40 personas varias veces por semana. Ni de los que te obligan a ver contenido grabado por 100 horas. "}</p>
              <Espacio />
              <p>{"No. "}<B>{"Un tío que trabaja con él uno a uno."}</B></p>
              <Espacio />
              <p>{"El consultor analiza los números, les ayuda a planificar y revisa periódicamente qué está funcionando y qué deberían cambiar."}</p>
              <Espacio />
              <p>{"Hasta aquí todo bien. PEEEERO."}</p>
              <Espacio />
              <p>{"La cosa es que ya trabajaban con una agencia. Que se supone que también hace ese trabajo. Cuando me lo contó mi primera reacción fue algo como:"}</p>
              <Espacio />
              <p><em>{"“¿Para qué contratas a un tio que te diga que hacer cuando tienes a alguien que se supone que decide que hacer, y además, lo hace…?”"}</em></p>
              <Espacio />
              <p>{"No dije nada, solo lo pensé. En silencio."}</p>
              <Espacio />
              <p>{"Mi falta de respuesta seguramente le hizo pensar que no estaba entendiendo ni la mitad de la película. "}</p>
              <Espacio />
              <p>{"¿Y sabes qué me dijo?"}</p>
              <Espacio />
              <p>{"Que desde que empezaron a trabajar así, han notado una mejora importante en los resultados."}</p>
              <Espacio />
              <p><B>{"De hecho, me insistió bastante en que se nota muchísimo cuando hay una estrategia detrás de lo que haces."}</B></p>
              <Espacio />
              <p>{"No la estrategia de una agencia que está muy enfocada en ejecutar. No. La estrategia de un tío que se dedica solo a pensar, a mirar el negocio desde fuera, analizar, comparar, y proponer la estrategia adecuada para que la agencia (o quien sea) ejecute."}</p>
              <Espacio />
              <p>{"Y me hizo pensar en el email marketing."}</p>
              <Espacio />
              <p>{"Porque veo muchas tiendas que envían correos, tienen automatizaciones, hacen campañas cada semana…"}</p>
              <Espacio />
              <p>{"Y eso me hace pensar… "}</p>
              <Espacio />
              <p>{"¿Quién decide qué correos deberían enviar? "}</p>
              <p>{"¿Por qué tienen 5 automatizaciones en vez de 9? ¿o 20? "}</p>
              <p>{"¿Quién revisa si lo que hacen está funcionando o si deberían ir por otro lado?"}</p>
              <Espacio />
              <p>{"Porque una cosa es enviar emails."}</p>
              <Espacio />
              <p>{"Y otra muy distinta es saber qué merece la pena hacer con tu email marketing, por qué y qué hacer después."}</p>
              <Espacio />
              <p><B>{"Te voy a contar algunos problemas por los que me suelen contratar las tiendas online con las que trabajo."}</B></p>
              <Espacio />
              <H3>{"Sabes que podrías vender más por email, pero no sabes exactamente qué cambiar."}</H3>
              <Espacio />
              <p>{"A lo mejor llevas meses enviando newsletters y tienes varias automatizaciones funcionando. Haces lo que te dijeron o lo que viste en un curso, y no has cambiado nada o prácticamente nada desde entonces."}</p>
              <Espacio />
              <p>{"O quizá todavía no has empezado a enviar nada. Tienes suscriptores pero no le has enviado nada. Cero. Nothing."}</p>
              <Espacio />
              <p>{"El caso es que te corroe esa sensación de que podrías estar sacándole mucho más partido."}</p>
              <Espacio />
              <p>{"¿Deberías enviar más correos? ¿menos? ¿Cambiar la forma de escribirlos? ¿Crear nuevas automatizaciones? ¿quitar alguna? ¿Segmentar mejor? ¿o menos? ¿Dejar de hacer tantos descuentos? ¿o hacer más?"}</p>
              <Espacio />
              <p>{"Opciones tienes para aburrirte."}</p>
              <Espacio />
              <p>{"Lo complicado es saber qué hacer. "}</p>
              <Espacio />
              <p><B>{"Y no tienes a nadie que te diga si lo estás haciendo bien o mal."}</B></p>
              <Espacio />
              <p>{"Porque sí, le preguntas a ChatGPT: "}<em>{"“oye, debería hacer esta campaña”"}</em></p>
              <Espacio />
              <p>{"Y te responde: "}<em>{"“por supuesto, suena genial, de hecho tiene más sentido que lo que yo te había propuesto antes.”"}</em></p>
              <Espacio />
              <Espacio />
              <p>{"O le dices: "}<em>{"“compañero, tengo un problema, ¿debería escribirle a mi ex? Pero no me digas que sí, razona y dame una respuesta con criterio”"}</em></p>
              <Espacio />
              <p>{"Y te responde: "}<em>{"“Sí, pero con un matiz. No deberías escribirle directamente “oye, vuelve conmigo”, porque ahí parecería que estás desesperado…”"}</em></p>
              <Espacio />
              <Espacio />
              <p>{"Ya sabes a lo que me refiero con esto. Siguiente problema que veo."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <H3>{"Las ventas que te llegan del email, no son del email."}</H3>
              <Espacio />
              <p>{"Tu herramienta de email, ya sea Klaviyo, Connectif o la que sea, te marca ventas. Muchas. Parece que va de puta madre."}</p>
              <Espacio />
              <p><B>{"Pero realmente no sabes si vienen de ahí."}</B></p>
              <Espacio />
              <p>{"¿O vienen de la publi? ¿O es el tipo este que me escribió por instagram? ¿O del que me llamó?"}</p>
              <Espacio />
              <p>{"Haces email porque tienes que hacerlo. Porque es otro canal y hay que trabajarlo, y ya. No porque de verdad veas lo que te aporta."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <H3>{"Dependes demasiado de la publicidad o de las redes."}</H3>
              <Espacio />
              <p>{"Conseguir que alguien visite tu tienda cuesta dinero, tiempo grabando y publicnado contenido, o ambas cosas."}</p>
              <Espacio />
              <p>{"La gente entra a la web y compra, y eso está bien. "}</p>
              <Espacio />
              <p>{"Pero si paras la publi… cagaste. Si ahora Zuck te cambia el algoritmo y cuando antes llegabas a 100.000 personas ahora llegas a 20.000… cagaste. "}</p>
              <Espacio />
              <p><B>{"No puedes parar de gastar en publi ni de postear en redes"}</B>{" (y ojo, no deberías parar de hacerlo)."}</p>
              <Espacio />
              <p>{"¿Pero qué pasaría si se cortara? A mi me pasó que me bloquearon la publi y mi tienda quebró. Literalmente."}</p>
              <Espacio />
              <p>{"El caso es que hay personas que entran en tu web y se van sin comprar."}</p>
              <Espacio />
              <p>{"Otras compran una vez y no vuelven."}</p>
              <Espacio />
              <p>{"Y otras llevan meses apuntadas a tu lista de correo sin que hayas conseguido despertar su interés."}</p>
              <Espacio />
              <p>{"Claro que no todo el mundo va a comprarte."}</p>
              <Espacio />
              <p>{"Pero ¿estás haciendo todo lo que puedes para conseguir que lo hagan? ¿o para que te tengan en mente? ¿o para que hablen de ti a sus amigos?"}</p>
              <Espacio />
              <p>{"Porque mientras sigues gastando pasta en atraer nuevos visitantes o posteando contenido como un hijoputa, puede que estés dejando pasar oportunidades con personas que ya te conocen."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <H3>{"Tus emails podrían ser los de cualquier otra tienda."}</H3>
              <Espacio />
              <p>{"Llevas años construyendo tu marca. Tus vídeos en redes molan, tienen personalidad. Claro, sales tú o alguien de tu equipo hablando, y eso se transmite."}</p>
              <Espacio />
              <p>{"Cuentas historias, experiencias y opiniones que hacen reír o que llaman la atención. Además le pones lucecitas y una buena edición y la gente se queda pegada a la pantalla mirándote."}</p>
              <Espacio />
              <p>{"Quizá no haces esto, pero seguro que tienes una personalidad y en tu día a día eres alguien interesante. Sino serías un robot, y todavía no hemos llegado a ese punto."}</p>
              <Espacio />
              <p>{"La cosa es que con toda tu personalidad, única, característica, contagiosa… En email pones cosas como: "}</p>
              <Espacio />
              <p><em>{"«Descubre la nueva colección»"}</em>{"."}</p>
              <Espacio />
              <p><em>{"«20 % de descuento por tiempo limitado»"}</em>{"."}</p>
              <Espacio />
              <p><em>{"«Últimas horas para hacerte con tus favoritos»"}</em>{"."}</p>
              <Espacio />
              <p><em>{"«Llevamos 40 años en el sector»"}</em>{"."}</p>
              <Espacio />
              <p>{"Vamos, no me jodas…"}</p>
              <Espacio />
              <p>{"Que le cambio tu logo, pongo el de tu competidor y me dice lo mismo...."}</p>
              <Espacio />
              <p><B>{"Así no hay quien se acuerde de tu marca."}</B></p>
              <Espacio />
              <Espacio />
              <Espacio />
              <H3>{"No tienes tiempo para estar pensando constantemente qué hacer."}</H3>
              <Espacio />
              <p>{"Tienes una tienda que dirigir. Proveedores que te pierden los pedidos. Clientes que te tocan los cojones con quejas absurdas. Empleados. Publicidad…."}</p>
              <Espacio />
              <p><B>{"Y encima tienes que pensar qué enviar esta tarde, que toca newsletter y aún no la has escrito."}</B></p>
              <Espacio />
              <p>{"Pues nada, la vieja confiable: pillamos la plantilla que mejor nos funciona, cambiamos tres cosas y a enviar. Un email rapidito, corto y listo. Le pongo varias imágenes para que el producto se vea bien y ale."}</p>
              <Espacio />
              <p>{"Y te justificas con "}<em>{"“mi cliente no lee”"}</em>{", "}<em>{"“total si solo le interesan las promos, esto no le van a hacer mucho caso”"}</em>{" y cosas así."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <H3>{"Es demasiado caro"}</H3>
              <Espacio />
              <p>{"Tienes a alguien contratado, alguien interno. O una agencia. O un freelance. O incluso lo haces tú (piensa lo que te cuesta respecto al tiempo que le inviertes)."}</p>
              <Espacio />
              <p>{"El caso es que como no ves los resultados que te gustaría, piensas que es caro. Que no merece la pena pagar por ello (o pagar tanto por alguien que lo haga)."}</p>
              <Espacio />
              <p>{"Es caro porque no te aporta lo que te tiene que aportar."}</p>
              <Espacio />
              <p>{"Y como no te aporta lo que tú consideras que te tiene que aportar lo vas apartando. Lo vas dejando. Echas a la persona que lo lleva. Buscas a alguien que te ofrezca otras cosas además del email para que te rente poner la pasta. Le das prioridad a otras tareas."}</p>
              <Espacio />
              <p>{"Y como lo dejas de lado, no mejora."}</p>
              <Espacio />
              <p>{"Y como no mejora, se converte en una cosa que está por estar. Incluso hay quien deja de hacerlo."}</p>
              <Espacio />
              <p>{"Y como está por estar o no se hace, terminas dejándote miles y miles y decenas de miles de euros encima de la mesa."}</p>
              <Espacio />
              <p><B>{"No es que no funcione, es que no lo haces bien. Es que no has contratado a la persona correcta. Es duro, pero es la realidad."}</B></p>
              <Espacio />
              <p>{"Como me dijo mi abuelo: el primer paso para superarlo es admitirlo."}</p>
              <Espacio />
              <p>{"(en realidad no se quien me lo dijo, pero es así)."}</p>
              <Espacio />
              <Espacio />
              <p><B>{"Estos son los motivos por los que me suelen contratar."}</B>{" Pero ahora es cuando me dices que tu email es perfecto, que tienes el mejor equipo y que no se puede mejorar, en ese caso, puedes dejarlo por aquí, no puedo ayudarte. Te deseo lo mejor. Enserio."}</p>
              <Espacio />
              <p>{"Pero si algo de lo que dije te resuena, lee estos casos reales de clientes reales en los que aplicamos estrategias totalmente distintas y adaptadas a cada caso en concreto: "}</p>
              <Espacio />
              <p><M>{"Inés"}</M>{" es una clienta que enviaba 2 campañas a la semana. Cada email vendía más de 1.000€, empezamos a enviar 6, y siguieron vendiendo más de 1.000€ cada uno. Multiplicamos por 3 sin tocar nada más. Solo modificamos un detalle muy concreto."}</p>
              <Espacio />
              <p><M>{"Celia"}</M>{", con solo 3 emails por semana, ha conseguido, en menos de un año, que varias clientas le hayan comprado incluso más de veinte veces. Y un tercio, compran de nuevo cada mes."}</p>
              <Espacio />
              <p>{"O a "}<M>{"Delia"}</M>{", con quién hicimos un lanzamiento sin publicidad, a una lista de menos de 1000 personas y generamos 25.000€ en menos de una semana. Para esto hay que entender muy bien al cliente y qué decirle."}</p>
              <Espacio />
              <p>{"O a "}<M>{"Sheyla"}</M>{", que entendiendo muy bien a su público y haciendo un pequeño cambio en el formulario de registro y el estilo de comunicación, en pocas semanas pasó de no vender por campañas, a vender en cada campaña que manda. Lo mismo hicimos en los flujos, entendimos al cliente y pasamos de 7 a 22 automatizaciones, multiplicando por 10 los resultados."}</p>
              <Espacio />
              <p><span style={{ color: ROJO }}>{"(Solo me queda una plaza para empezar en diciembre)"}</span></p>
              <Espacio />
              <Espacio />
              <H2>{"Bien, ¿cómo voy a conseguir esto para ti?"}</H2>
              <Espacio />
              <p>{"Primero me presento, que no lo he hecho: Soy Raúl, tuve una tienda que quebró porque me bloquearon la publi y como no sabía hacer email marketing, no pude remontar."}</p>
              <Espacio />
              <p>{"Después de eso he levantado mi agencia a fuerza de enviar emails en frío. Y he trabajado con más de 60 tiendas online en los últimos años."}</p>
              <Espacio />
              <p>{"Vale, vamos con lo que haré por ti y por tu tienda:"}</p>
              <Espacio />
              <p>{"Durante 90 días voy a ayudarte a sacar más partido a tu email marketing. Con una estrategia pensada para tu tienda, tus clientes y tu forma de vender. Y voy a supervisar que todo salga bien."}</p>
              <Espacio />
              <p>{"¿Cómo?"}</p>
              <Espacio />
              <p><B>{"1. Voy a visitarte en persona."}</B></p>
              <Espacio />
              <p>{"Esto quizá es lo más importante. Porque estamos en una época en la que parece que el contacto humano no merece la pena."}</p>
              <Espacio />
              <p>{"Que con mirar tu web, tus fotos, tus redes y las reseñas, me puedo hacer una idea de lo que vendes… Pero no es así. No soy Local Guide de nivel 10 en Google Maps por nada."}</p>
              <Espacio />
              <p>{"Voy a ir a verte, para probar tu producto, tocarlo, sentirlo, ver como lo fabricas si es que lo fabricas tú, comerlo si es que se come. Quiero verte trabajar, que demos un paseo y hablemos de cosas que no tienen que ver con el trabajo."}</p>
              <Espacio />
              <p>{"Quiero saber como eres realmente y cómo es tu producto. Solo así podré ayudarte a venderlo."}</p>
              <Espacio />
              <p>{"El viaje me lo pago yo, no te preocupes, va en el precio."}</p>
              <Espacio />
              <p>{"Lo dicho: analizaré tus productos, clientes, competencia, emails y resultados actuales."}</p>
              <Espacio />
              <p>{"Así sabremos qué merece la pena mejorar, qué está funcionando bien y dónde tiene sentido poner nuestros esfuerzos. "}</p>
              <Espacio />
              <p>{"Además de encontrar oportunidades que quizá estas pasando por alto por estar muy metido en el negocio."}</p>
              <Espacio />
              <Espacio />
              <p><B>{"2. Te prepararé un plan de acción para que sepas exactamente qué hacer."}</B></p>
              <Espacio />
              <p>{"Tendrás una estrategia general para los 90 días y un plan detallado para cada mes, organizado por semanas. Te lo entregaré en un documento PDF y lo veremos en una reunión que quedará grabada."}</p>
              <Espacio />
              <p>{"Sabrás qué campañas plantear, qué automatizaciones revisar o crear y qué cambios priorizar. Todo explicado de forma sencilla para que no te cueste llevarlo a cabo. "}</p>
              <Espacio />
              <p>{"Quiero que sepas por qué haces las cosas, no solo que las hagas. Esto es importante."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <p><B>{"3. Estaré a tu lado mientras lo pones en práctica."}</B></p>
              <Espacio />
              <p>{"Durante los tres meses podrás consultarme las dudas que te vayan surgiendo."}</p>
              <Espacio />
              <p>{"Si tienes una idea y no sabes si merece la pena, la vemos. Si algo no está funcionando como esperabas, buscamos qué cambiar."}</p>
              <Espacio />
              <p>{"No te voy a entregar un documento y desaparecer. Voy a estar contigo."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <p><B>{"4. Revisaremos los resultados y adaptaremos la estrategia."}</B></p>
              <Espacio />
              <p>{"Cada mes nos reuniremos para analizar qué se ha hecho, qué resultados hemos conseguido y qué podemos mejorar."}</p>
              <Espacio />
              <p>{"Con eso prepararemos el plan del siguiente mes. De nuevo, te lo entregaré en PDF y las reuniones se quedarán grabadas. Además, me tendrás para preguntarme cualquier duda."}</p>
              <Espacio />
              <p>{"No vamos a tomar ninguna decisión chupándonos el dedo y levantándolo para ver por donde sopla el viento. Lo haremos con datos reales."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <p><B>{"5. ¿Y qué NO voy a hacer?"}</B></p>
              <Espacio />
              <p>{"No voy a escribir tus emails, diseñar campañas, configurar automatizaciones ni enviarlas."}</p>
              <Espacio />
              <p>{"Tampoco voy a sustituir a tu equipo o a tu agencia, si los tienes."}</p>
              <Espacio />
              <p><B>{"Mi trabajo es investigar, darte dirección y ayudarte a tomar decisiones. La ejecución corre de tu parte o de quien tú elijas."}</B></p>
              <Espacio />
              <p>{"Y aquí hay una ventaja importante:"}</p>
              <Espacio />
              <p><B>{"Yo no gano más porque envíes más campañas, crees más automatizaciones o tengas más trabajo que hacer."}</B></p>
              <Espacio />
              <p>{"Si creo que necesitas crear diez automatizaciones, te lo diré."}</p>
              <Espacio />
              <p>{"Si creo que no necesitas ninguna nueva, también."}</p>
              <Espacio />
              <p>{"Porque mi trabajo es ayudarte a hacer lo que le conviene a tu tienda. Aunque eso signifique hacer menos."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <p><B>{"El resultado de todo esto es que vas a vender más, con más beneficio porque no dependerás tanto de la publicidad, y tu marca va a transmitir la personalidad que llevas años trabajando, para que no parezca un "}<em>{"“más de lo mismo”"}</em>{" pero con otro logo."}</B></p>
              <Espacio />
              <Espacio />
              <Espacio />
              <Espacio />
              <H3 centered>{"PERO ESTO NO ES TODO"}</H3>
              <Espacio />
              <p className="text-center">{"Aún está en BETA, pero vas a tener acceso a una herramienta que estoy construyendo y que "}<B>{"te permitirá escribir tus emails prácticamente en segundos"}</B>{", sin que suenen a IA y reflejando tu personalidad como si el que te lee estuviera hablando contigo."}</p>
              <Espacio />
              <p className="text-center">{"Podrás elegir entre hacer diseños más sencillos o más profesionales, flujos completos desde 0, y luego llevártelo a tu plataforma de email con un clic."}</p>
              <Espacio />
              <p className="text-center">{"Así no solo tendrás el criterio que te voy a aportar, sino que lo podrás ejecutar  más rápido, ya sea que lo hagas tú o tu equipo."}</p>
              <Espacio />
              <Espacio />
              <Espacio />
              <p>{"Imagino que si has llegado hasta aquí es porque esto te hace tilín. Si no, como te dije antes, buena suerte. Espero que te vaya genial."}</p>
              <Espacio />
              <p>{"Bueno, lee más casos de clientes reales, con problemas reales: "}</p>
              <Espacio />
              <p><M>{"Inés"}</M>{", la misma de antes, hace un año tenía muy poco margen beneficio, y con una anti-promoción especial de una semana, aumentamos el beneficio total de la tienda un 30% ad eternum (para siempre)."}</p>
              <Espacio />
              <p>{"A "}<M>{"Neus"}</M>{" el email le lleva 10 minutos cada día, y más de la mitad de las ventas de su tienda, vienen por ahí (ventas reales, no de esas que no sabes de dónde vienen realmente). Hemos hecho la prueba, y con la herramienta, se consigue lo mismo en menos de 5 minutos."}</p>
              <Espacio />
              <p><M>{"Otro cliente"}</M>{", factura el 70% de lo que vende por email, y le dedica menos de 20 minutos al día. Con la herramienta, consigue lo mismo también en menos de 5 minutos. "}</p>
              <Espacio />
              <Espacio />
              <p><span style={{ color: ROJO }}>{"(Solo me queda una plaza para empezar en diciembre)"}</span></p>
              <Espacio />
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
              <Paso>Trabajo sobre el plan general de 3 meses y el plan detallado del primer mes</Paso>
              <Paso>Nos vemos en la primera reunión online.</Paso>
              <Paso>Te envío la grabación de la reunión y los documentos, y comenzamos a trabajar codo con codo.</Paso>
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
              <H2>PREGUNTAS FRECUENTES</H2>
              <H3>¿Cómo funciona exactamente?</H3>
              <p>Estudio tu tienda y preparo un plan para los próximos 90 días, y te preparo el plan detallado para el mes en curso. Lo ejecutarás siempre con mi supervisión y pudiendo preguntarme cualquier cosa. A final de mes nos reunimos, analizamos los números y te presento el plan para el siguiente mes.</p>
              <Espacio />
              <H3>¿Se puede pagar a plazos?</H3>
              <p>Sí, en el momento del pago puedes elegir si pagarlo de una vez o financiarlo con Klarna a 3 meses sin intereses, es decir, pagas el mismo precio pero dividido en 3 meses.</p>
              <Espacio />
              <H3>¿Cuánto cuesta?</H3>
              <p>¿De verdad? 1.350€ con todos los respectivos impuestos incluidos.</p>
              <Espacio />
              <H3>¿Por qué los plazos para empezar son tan tarde?</H3>
              <p>Por mi agenda y porque esto no es una estrategia igual para cada cliente que copio y pego en tu tienda. No. Es criterio, y la investigación y el desarrollo de una buena estrategia lleva su tiempo.</p>
              <Espacio />
              <H3>¿Cuándo son la visita presencial y la primera reunión?</H3>
              <p>La primera reunión la eliges al inicio, entre las fechas que tengo disponibles. Esto te lo paso cuando rellenes el formulario, si me interesa el proyecto. La visita presencial la coordinamos después de realizar el pago.</p>
              <Espacio />
              <H3>¿Qué pasa si después de la reunión no me ha quedado claro?</H3>
              <p>Estoy disponible para acompañarte y resolverte cualquier duda durante los 3 meses.</p>
              <Espacio />
              <H3>¿Qué pasa si la reunión se alarga?</H3>
              <p>Si nos alargamos más del tiempo que establecemos, no hay problema, cuadramos para terminarla en otro momento.</p>
              <Espacio />
              <H3>¿Entonces pago antes o en el momento de empezar?</H3>
              <p>El pago se hace en el momento en el que eliges una de las fechas disponibles. Es decir, para reservar la fecha debes realizar primero el pago, una vez hecho, tendrás tu plaza y fecha aseguradas.</p>
              <Espacio />
              <H3>¿Qué incluye?</H3>
              <p>Un plan general de 90 días, y un plan específico para cada mes. Te acompaño en todo momento, revisando y analizando los resultados, y al final de cada mes, nos volvemos a juntar y planteamos el plan del siguiente mes. Además, pongo a tu disposición mi software para que puedas escribir los correos mucho más rápido, por lo que no solo ganas claridad, sino que ahorras tiempo.</p>
              <Espacio />
              <H3>¿Cuánto tiempo le tengo que dedicar al día?</H3>
              <p>¿Otra vez? Muy poco, porque vas a saber qué hacer y te doy la herramienta para que lo hagas rápido, del análisis de los resultados me encargo yo. Y de la ejecución, si tienes equipo, mejor, puedo trabajar mano a mano con él.</p>
              <Espacio />
              <H3>¿No es caro 1.350€?</H3>
              <p>No, es barato.</p>
              <Espacio />
              <H3>¿Y si mi sector es raro?</H3>
              <p>Raro tú.</p>
              <Espacio />
              <H3>¿Hay grupos, comunidad o recursos adicionales?</H3>
              <p>No, un acompañamiento individual. Te doy el plan general, y cada mes, el específico. Nada más. Bueno sí, criterio. Mucho. Y el software.</p>
              <Espacio />
              <H3>¿Qué pasa si aplico algo y no funciona?</H3>
              <p>Lo analizo por ti y te propongo los cambios y soluciones.</p>
              <Espacio />
              <H3>¿Cómo es el proceso de apuntarse?</H3>
              <p>Rellenas el formulario - Si me gusta el proyecto te paso las fechas disponibles - Eliges - Te envío la factura y el contrato - Pagas - Creo un grupo de WhatsApp por el que te pediré la info y el material - Agendamos la visita presencial - Trabajo sobre el plan general y el del primer mes - Nos vemos en la primera reunión online - Te envío la grabación de la reunión y los documentos - Empieza el trabajo diario.</p>
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
