// Texto e imágenes del currículum interactivo (/cv). También lo usa el generador del PDF.
export const PDF = "/cv/raul-ruiz-romero-cv.pdf";
const img = (n) => `/cv/cv-${n}.jpg`;

// Párrafos: texto plano, { t, em } (frase corta destacada) o { t, li } (punto de lista)
export const PANTALLAS = [
  {
    titulo: "MI CURRÍCULUM",
    texto: [
      "Este es un currículum diferente, en vez de lanzarte a lo bruto todo lo que he hecho en mi vida, como si fuese un aburrido telegrama, te voy a contar una pequeña historia.",
      "También te lo puedes descargar en PDF y perderte este maravilloso viaje. Tú decides.",
      { t: "¿Listo?", em: true },
    ],
    botones: [{ label: "¡VAMOS!", accion: "siguiente" }, { label: "PREFIERO EL PDF", accion: "pdf", secundario: true }],
  },
  {
    imagenes: [{ src: img("00"), alt: "Raúl con un ciervo en Nara (Japón)" }],
    texto: [
      { t: "Este soy yo… Raúl.", em: true },
      "Es posible que esperaras ver una imagen más “formal”. Quizá la de mi graduación, o quizá una de la boda de un primo donde me pillaron en traje.",
      { t: "Bueno.", em: true },
      "La realidad es que soy de los que piensan que para ser profesional no tienes que hablar serio, o vestir con traje y corbata. Eso me parece soso, aburrido y sin personalidad.",
      "Ojo, que si es la personalidad de otra persona, perfecto, pero no es la mía.",
      "Yo soy de los que van en pijama hasta la primera reunión del día, y se viste con chándal y camiseta. Y en eventos “formales” me pongo vaqueros y un polito.",
      "Pero bueno, no nos desviemos. El currículum…",
      "Como decía, soy Raúl Ruiz Romero. Tengo 26 años. Soy autónomo, y me gano muy bien la vida escribiendo emails para tiendas online.",
      "Aunque para ver cómo he llegado hasta aquí, tenemos que retroceder un poco en el tiempo…",
      { t: "Pulsa aquí:", em: true },
    ],
    reloj: true,
  },
  {
    intro: { imagen: { src: img("01"), alt: "El origen de todo", ancha: true }, frase: "Ups, no tanto…" },
    imagenes: [
      { src: img("02"), alt: "Ventas de Zafarraya (Granada)" },
      { src: img("03"), alt: "Raúl en el campo con sombrero" },
    ],
    texto: [
      "Nací, crecí y vivo en Ventas de Zafarraya, un pueblito de Granada donde la gente vive del campo. Ese fue mi primer oficio: echar un cable a mis padres los veranos.",
      "Esta experiencia me enseñó la disciplina de madrugar incluso en vacaciones, que las cosas no cuestan 40 o 50€, sino 8-10 horas con el lomo agachado, y lo que es un buen dolor de espalda.",
      "Una época muy bonita, adoro el campo y ahora que no tengo que trabajarlo, me encanta pasear por él cada tarde.",
      "Mi padre siempre decía que estudiara, que el campo es un negocio malo. Así que me fui fuera a estudiar.",
    ],
    botones: [{ label: "VÁMONOS AL INSTITUTO", accion: "siguiente" }],
  },
  {
    imagenes: [
      { src: img("04"), alt: "Ave María Casa Madre (Granada)" },
      { src: img("05"), alt: "Raúl en su graduación de Bachillerato" },
    ],
    texto: [
      "La ESO y Bachiller los hice en el Ave María Casa Madre, un internado. En la residencia aprendí lo que es “vivir solo”, sin mis padres, a moverme en entornos con chavales de toda clase y a tener disciplina para estudiar.",
      "Ya sabes que en un internado te puedes encontrar cualquier cosa…",
      "Por suerte, me gradué con matrícula de honor y me pagaron la matrícula de la universidad.",
      "Mi padre siempre quiso que estudiara medicina, pero lo mío era la física… o eso pensaba yo.",
    ],
    botones: [{ label: "VAMOS A LA UNI", accion: "siguiente" }],
  },
  {
    imagenes: [{ src: img("06"), alt: "Facultad de Ciencias de la Universidad de Granada" }],
    texto: [
      "Aquí pasé de ser el estudiante ejemplar al no tan ejemplar, al menos, según lo “normal”. Mi paso por física fue rápido, el segundo año dejé la carrera. Y me matriculé en Marketing, carrera que dejé en tercer año.",
      { t: "Ouch.", em: true },
      "¿Y qué hice durante este tiempo?",
      { t: "Emprender.", em: true },
    ],
    botones: [{ label: "EMPRENDAMOS", accion: "siguiente" }],
  },
  {
    imagenes: [{ src: img("07"), alt: "Ventas de la tienda online de Raúl en 2020", claro: true, ancha: true }],
    texto: [
      "Compaginándolo con la uni, empecé a hacer dropshipping. Monté varias tiendas que no me generaron beneficio pero me enseñaron mucho sobre marketing, publicidad en facebook e instagram y desarrollo web.",
      "Mi última tienda, en 2020, fue todo un éxito, pasé de 0 a más de 150.000€ en tres meses. Y me enseñó una gran lección:",
      "Arruinarme por tomar malas decisiones empresariales. Vaya, que era un principiante aún.",
      "Como no tenía pasta para seguir haciendo dropshipping, me tuve que buscar un emprendimiento que no necesitara inversión de dinero, solo de tiempo.",
      { t: "Así fue como nació Antiagencia.es en 2023.", em: true },
    ],
    botones: [{ label: "ANTIAGENCIA.ES", accion: "siguiente" }],
  },
  {
    imagenes: [
      { src: img("08"), alt: "Logo de Antiagencia", claro: true },
      { src: img("09"), alt: "Raúl con la camiseta de Antiagencia" },
    ],
    texto: [
      "Tras hacer varias formaciones de marketing digital, concretamente la de trafficker digital y la de Emprendedores.com, comencé a trabajar con mis primeros clientes, que conseguía mediante emails. Al principio cobraba poco y entregaba mucho, lo típico.",
      "Trabajé con algunos negocios de Granada como Enerty Sur Fotovoltaica, La Casa de las Mamparas, o Clínica Silvia Funes, captando leads para ellos con publicidad en meta. Y también haciendo las webs y landing pages.",
      "Luego comencé a trabajar con infoproductores como Stefano Barba, Delia Mogó, Edith Lando y otros tantos también en captación de leads y creación de funnels de venta.",
      "Pero había una cosa que no me gustaba…",
      "Cada cliente era un mundo nuevo. Todo nuevo. Era un quebradero de cabeza.",
      "Tocaba acotar. Dejé de dar servicio a negocios locales e infoproductores y me centré solo en tiendas online. Joder, había creado una tienda y la llevé a 150.000€, algo de ecommerce sabía.",
      "Así que desde septiembre de 2024, solo di servicio a tiendas online. Email marketing, web y anuncios. Entre las tiendas con las que he trabajado y trabajo están: lineargent.com, nuubedescanso.com, elarmariodetuhermana.com, lacasitadewendy.com, salvicalzados.com, chalkpaint.es y otras.",
      { t: "¿Y ya está?", em: true },
      "No, queda un capítulo.",
    ],
    botones: [{ label: "CAPÍTULO FINAL", accion: "siguiente" }],
  },
  {
    imagenes: [
      { src: img("10"), alt: "Raúl con su madre en Noruega" },
      { src: img("11"), alt: "Raúl y Pili en Japón" },
    ],
    texto: [
      "Durante un maravilloso viaje de un mes y medio en Japón me di cuenta de algo.",
      { t: "Tener equipo no me gusta.", em: true },
      "Porque no lo he dicho, pero a este punto habíamos crecido hasta ser 6 personas en el equipo: un webmaster, una media buyer, una copy, un editor, y Pili, mi pareja y yo al frente de todo.",
      "En este viaje fue la primera vez que pensé que para disfrutar unas buenas vacaciones no podía tener equipo llamando y preguntando a cada rato. Así que se me plantearon dos opciones:",
      { t: "Crecer mucho y poner a alguien a que se coma los problemas.", li: true },
      { t: "O quitar a todo el mundo, tener un negocio más pequeño y manejarlo entre Pili y yo.", li: true },
      "Elegí la segunda, de nuevo, en un viaje a Noruega, con la mama. Entendí que soy más feliz organizándome yo, con un negocio que no depende de muchas personas.",
      "Así que este 2026, a inicios, decidí simplificar la agencia. Nos quedamos Pili y yo, y como no podíamos seguir entregando todo el servicio que hacíamos, nos centramos en lo que somos mejores:",
      { t: "Email marketing.", em: true },
      "Y hasta aquí.",
      "Un resumen de todo:",
    ],
    botones: [{ label: "RESUMEN", accion: "siguiente" }],
  },
  {
    imagenes: [{ src: img("12"), alt: "Collage con todas las etapas", ancha: true }],
    texto: [
      { t: "En este tiempo…", em: true },
      { t: "Creé mi propia tienda online que pasó los 150.000€ de facturación acumulada en 3 meses. Olympustrends.com", li: true },
      { t: "He trabajado con más de 20 tiendas online, entregando servicio directamente.", li: true },
      { t: "Me han contratado en consultoras como Emprendedores.com o Ecomsulting.io donde he asesorado a más de 100 negocios de todo tipo de sectores.", li: true },
      { t: "He hecho multitud de formaciones (y sigo haciendo), llevadas por grandes profesionales del marketing como: Miquel Baixas, Euge Oller, Rafel Mayol, Roberto Gamboa, Xavi Esqueriguela, Iván Fresneda, Vilma Núñez, Isra Bravo, Felipe Vergara y alguno que me dejaré fuera.", li: true },
      { t: "No tengo ningún título oficial de inglés, pero en mi trabajo me he tenido que enfrentar con empresas americanas, irlandesas e indias, así que me ha tocado tener muchas reuniones en inglés.", li: true },
      { t: "De vez en cuando, la UGR cuenta conmigo para mentorizar en los distintos programas de emprendimiento.", li: true },
      { t: "Cada día salgo a caminar al menos una hora por el campo. Para pensar y tener claridad.", li: true },
      "Y poco más, si me he dejado algo o tienes alguna duda, me puedes contactar en raul@antiagencia.es",
      { t: "Disfruta la vida.", em: true },
      { t: "Raúl.", em: true },
      "P.D. Nunca tuve que mandar currículums así que no sé cómo se hacen, por lo que lo hice a mi manera. Espero que hayas disfrutado de esta lectura.",
    ],
    botones: [{ label: "DESCARGAR CURRÍCULUM EN PDF", accion: "pdf" }],
  },
];

export const CV_ES = {
  idioma: "es",
  pdf: PDF,
  pantallas: PANTALLAS,
  textos: {
    titulo: "Currículum de Raúl Ruiz Romero · Antiagencia",
    descripcion: "El currículum de Raúl Ruiz Romero contado como una pequeña historia: del campo de Ventas de Zafarraya a Antiagencia, email marketing para tiendas online.",
    verTodo: "Toca para ver todo el texto",
    reloj: "Retroceder en el tiempo",
    pdfSutil: "Descargar currículum en PDF",
    otroIdioma: { label: "English", href: "/cv-en", idioma: "en" },
  },
};
