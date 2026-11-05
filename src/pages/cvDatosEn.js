// English version of the interactive CV (/cv-en). Same structure as cvDatos.js; also used by the PDF generator.
export const PDF_EN = "/cv/raul-ruiz-romero-cv-en.pdf";
const img = (n) => `/cv/cv-${n}.jpg`;

export const PANTALLAS_EN = [
  {
    titulo: "MY CV",
    texto: [
      "This is a different kind of CV. Instead of bluntly throwing everything I've ever done at you, like a boring telegram, I'm going to tell you a little story.",
      "You can also download it as a PDF and miss out on this wonderful journey. Your call.",
      { t: "Ready?", em: true },
    ],
    botones: [{ label: "LET'S GO!", accion: "siguiente" }, { label: "I'D RATHER HAVE THE PDF", accion: "pdf", secundario: true }],
  },
  {
    imagenes: [{ src: img("00"), alt: "Raúl with a deer in Nara (Japan)" }],
    texto: [
      { t: "This is me… Raúl.", em: true },
      "You might have expected a more “formal” picture. Maybe the one from my graduation, or one from a cousin's wedding where someone caught me in a suit.",
      { t: "Well.", em: true },
      "The truth is, I'm one of those people who think that being professional doesn't mean talking all serious or wearing a suit and tie. To me that's bland, boring and lacking personality.",
      "Mind you, if that's someone else's personality, great, but it's not mine.",
      "I'm the kind of guy who stays in his pyjamas until the first meeting of the day, then puts on a tracksuit and a T-shirt. And at “formal” events I wear jeans and a polo shirt.",
      "But anyway, let's not get sidetracked. The CV…",
      "As I was saying, I'm Raúl Ruiz Romero. I'm 26. I'm self-employed, and I make a very good living writing emails for online stores.",
      "But to see how I got here, we need to go back in time a little…",
      { t: "Click here:", em: true },
    ],
    reloj: true,
  },
  {
    intro: { imagen: { src: img("01"), alt: "Where it all began", ancha: true }, frase: "Oops, not that far back…" },
    imagenes: [
      { src: img("02"), alt: "Ventas de Zafarraya (Granada, Spain)" },
      { src: img("03"), alt: "Raúl in the fields wearing a straw hat" },
    ],
    texto: [
      "I was born, grew up and still live in Ventas de Zafarraya, a small village in Granada where people live off the land. That was my first job: giving my parents a hand during the summers.",
      "That experience taught me the discipline of getting up early even on holiday, that things don't cost €40 or €50 but 8–10 hours bent over in the fields, and what a proper backache feels like.",
      "A really lovely time. I love the countryside, and now that I don't have to work it, I enjoy walking through it every afternoon.",
      "My dad always told me to study, that farming is a bad business. So I left home to study.",
    ],
    botones: [{ label: "OFF TO HIGH SCHOOL", accion: "siguiente" }],
  },
  {
    imagenes: [
      { src: img("04"), alt: "Ave María Casa Madre (Granada)" },
      { src: img("05"), alt: "Raúl at his high school graduation" },
    ],
    texto: [
      "I did secondary school and sixth form at Ave María Casa Madre, a boarding school. Living in the residence taught me what “living on your own” means, without my parents, getting along with kids from all walks of life and having the discipline to study.",
      "You know you can come across just about anything in a boarding school…",
      "Luckily, I graduated with top honours, which got my university tuition paid for.",
      "My dad always wanted me to study medicine, but physics was my thing… or so I thought.",
    ],
    botones: [{ label: "ON TO UNI", accion: "siguiente" }],
  },
  {
    imagenes: [{ src: img("06"), alt: "Faculty of Sciences, University of Granada" }],
    texto: [
      "This is where I went from model student to not-so-model student, at least by “normal” standards. My time in physics was short: I dropped out in my second year. Then I enrolled in Marketing, which I dropped in my third year.",
      { t: "Ouch.", em: true },
      "So what did I do during all that time?",
      { t: "Start businesses.", em: true },
    ],
    botones: [{ label: "LET'S START A BUSINESS", accion: "siguiente" }],
  },
  {
    imagenes: [{ src: img("07"), alt: "Sales of Raúl's online store in 2020", claro: true, ancha: true }],
    texto: [
      "While still at uni, I started dropshipping. I built several stores that didn't make a profit but taught me a lot about marketing, Facebook and Instagram ads, and web development.",
      "My last store, in 2020, was a huge success: I went from 0 to over €150,000 in three months. And it taught me a big lesson:",
      "How to go broke by making bad business decisions. Let's just say I was still a beginner.",
      "Since I had no cash left to keep dropshipping, I had to find a venture that didn't need money, only time.",
      { t: "That's how Antiagencia.es was born in 2023.", em: true },
    ],
    botones: [{ label: "ANTIAGENCIA.ES", accion: "siguiente" }],
  },
  {
    imagenes: [
      { src: img("08"), alt: "Antiagencia logo", claro: true },
      { src: img("09"), alt: "Raúl wearing an Antiagencia T-shirt" },
    ],
    texto: [
      "After taking several digital marketing courses, namely the paid ads (“digital trafficker”) programme and the Emprendedores.com one, I started working with my first clients, whom I landed through emails. At first I charged little and delivered a lot, the usual.",
      "I worked with some businesses in Granada such as Enerty Sur Fotovoltaica, La Casa de las Mamparas and Clínica Silvia Funes, generating leads for them with Meta ads. I also built their websites and landing pages.",
      "Then I started working with course creators such as Stefano Barba, Delia Mogó, Edith Lando and many others, also on lead generation and building sales funnels.",
      "But there was one thing I didn't like…",
      "Every client was a whole new world. Everything new. It was a headache.",
      "Time to narrow things down. I stopped serving local businesses and course creators and focused only on online stores. Damn, I'd built a store and taken it to €150,000, I knew a thing or two about ecommerce.",
      "So since September 2024, I've only worked with online stores. Email marketing, web and ads. Some of the stores I've worked and still work with: lineargent.com, nuubedescanso.com, elarmariodetuhermana.com, lacasitadewendy.com, salvicalzados.com, chalkpaint.es and others.",
      { t: "Is that it?", em: true },
      "No, there's one more chapter.",
    ],
    botones: [{ label: "FINAL CHAPTER", accion: "siguiente" }],
  },
  {
    imagenes: [
      { src: img("10"), alt: "Raúl with his mum in Norway" },
      { src: img("11"), alt: "Raúl and Pili in Japan" },
    ],
    texto: [
      "During a wonderful month-and-a-half trip to Japan, I realised something.",
      { t: "I don't like having a team.", em: true },
      "Because I haven't mentioned it, but by then we'd grown to a team of 6: a webmaster, a media buyer, a copywriter, an editor, and Pili, my partner, and me running everything.",
      "On that trip, for the first time, I thought that to really enjoy a holiday I couldn't have a team calling me and asking questions all the time. So I had two options:",
      { t: "Grow a lot and put someone in charge of dealing with the problems.", li: true },
      { t: "Or let everyone go, run a smaller business and manage it between Pili and me.", li: true },
      "I chose the second, once again on a trip, this time to Norway with my mum. I realised I'm happier organising things myself, with a business that doesn't depend on lots of people.",
      "So at the start of this year, 2026, I decided to simplify the agency. It's just Pili and me now, and since we couldn't keep delivering the full service we used to, we focused on what we do best:",
      { t: "Email marketing.", em: true },
      "And that's it.",
      "A summary of it all:",
    ],
    botones: [{ label: "SUMMARY", accion: "siguiente" }],
  },
  {
    imagenes: [{ src: img("12"), alt: "Collage of every stage", ancha: true }],
    texto: [
      { t: "Over this time…", em: true },
      { t: "I built my own online store, which passed €150,000 in cumulative revenue in 3 months. Olympustrends.com", li: true },
      { t: "I've worked with more than 20 online stores, providing the service directly.", li: true },
      { t: "I've been hired by consultancies such as Emprendedores.com and Ecomsulting.io, where I've advised more than 100 businesses across all kinds of industries.", li: true },
      { t: "I've taken lots of courses (and still do), taught by great marketing professionals such as Miquel Baixas, Euge Oller, Rafel Mayol, Roberto Gamboa, Xavi Esqueriguela, Iván Fresneda, Vilma Núñez, Isra Bravo, Felipe Vergara and probably a few I'm forgetting.", li: true },
      { t: "I don't have an official English certificate, but my work has had me dealing with American, Irish and Indian companies, so I've had plenty of meetings in English.", li: true },
      { t: "Every now and then, the University of Granada (UGR) calls on me to mentor in its entrepreneurship programmes.", li: true },
      { t: "Every day I go for a walk in the countryside for at least an hour. To think and get some clarity.", li: true },
      "And that's about it. If I've left anything out or you have any questions, you can reach me at raul@antiagencia.es",
      { t: "Enjoy life.", em: true },
      { t: "Raúl.", em: true },
      "P.S. I've never had to send a CV before, so I don't really know how they're done. That's why I did it my way. I hope you enjoyed reading it.",
    ],
    botones: [{ label: "DOWNLOAD CV AS PDF", accion: "pdf" }],
  },
];

export const CV_EN = {
  idioma: "en",
  pdf: PDF_EN,
  pantallas: PANTALLAS_EN,
  textos: {
    titulo: "Raúl Ruiz Romero's CV · Antiagencia",
    descripcion: "Raúl Ruiz Romero's CV told as a little story: from the fields of Ventas de Zafarraya to Antiagencia, email marketing for online stores.",
    verTodo: "Tap to show the full text",
    reloj: "Go back in time",
    pdfSutil: "Download CV as PDF",
    otroIdioma: { label: "Español", href: "/cv", idioma: "es" },
  },
};
