import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const socials = [
  {
    img: "/images/a4823a37f_1.png",
    handle: "@raaulruuiz",
    url: "https://www.instagram.com/raaulruuiz/",
  },
  {
    img: "/images/5d0ae39e1_2.png",
    handle: "@raaulruuiz",
    url: "https://www.linkedin.com/in/raaulruuiz/",
  },
  {
    img: "/images/8eb37bde2_3.png",
    handle: "@raaulruuiz3",
    url: "https://www.tiktok.com/@raaulruuiz3",
  },
  {
    img: "/images/233633487_4.png",
    handle: "@raaulruuiz",
    url: "https://www.youtube.com/@raaulruuiz",
  },
];

export default function SocialSection() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v95037e5bac78f29ed026832ca21a7c7b";
    script.type = "text/javascript";
    document.body.appendChild(script);

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/180770580729955797/takel");

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="bg-[#121212] py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-headline font-bold text-white text-3xl md:text-5xl leading-tight mb-3">
            ESCUCHA LO QUE DECIMOS
          </h2>
          <p className="font-headline text-[#0067FD] text-xl md:text-2xl">
            y aprende gratis
          </p>
        </motion.div>

        {/* Social grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {socials.map((social, index) => (
            <motion.a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-full rounded-xl overflow-hidden bg-white/5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={social.img}
                  alt={social.handle}
                  className="w-full h-auto object-contain"
                />
              </div>
              <span className="flex items-center gap-1.5 font-headline font-bold text-white text-sm group-hover:text-[#0067FD] transition-colors">
                {social.handle}
                <ExternalLink className="w-3 h-3 opacity-70" />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h3 className="font-headline font-bold text-white text-2xl md:text-3xl mb-2">
            Apúntate a nuestra newsletter
          </h3>
          <p className="font-body text-[#0067FD] text-sm md:text-base">
            Te aporto valor, te doy mi opinión y te entretengo, con un mail al día
          </p>
        </motion.div>

        {/* MailerLite Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <style>{`
            .ml-form-embedSubmitLoad { display: inline-block; width: 20px; height: 20px; }
            .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
            .ml-form-embedSubmitLoad:after { content: " "; display: block; width: 11px; height: 11px; margin: 1px; border-radius: 50%; border: 4px solid #fff; border-color: #ffffff #ffffff #ffffff transparent; animation: ml-form-embedSubmitLoad 1.2s linear infinite; }
            @keyframes ml-form-embedSubmitLoad { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            #mlb2-37838971.ml-form-embedContainer { box-sizing: border-box; display: table; margin: 0 auto; position: static; width: 100% !important; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper { background-color: transparent; border-width: 0px; border-color: transparent; border-radius: 4px; border-style: solid; box-sizing: border-box; display: inline-block !important; margin: 0; padding: 0; position: relative; width: 100%; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody, #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody { padding: 0; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent, #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent { text-align: center; margin: 0 0 20px 0; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4 { color: #ffffff; font-family: 'Rubik', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 10px 0; text-align: center; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p { color: #0067FD; font-family: 'Rubik', sans-serif; font-size: 14px; text-align: center; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form { margin: 0; width: 100%; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent.horozintalForm { margin: 0; padding: 0 0 10px 0; width: 100%; float: left; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-horizontalRow { height: auto; width: 100%; float: left; display: flex; gap: 10px; }
            .ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-input-horizontal { width: 70%; float: left; }
            .ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-button-horizontal { width: 30%; float: left; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-horizontalRow input { background-color: #1e1e1e !important; color: #ffffff !important; border-color: #333333; border-radius: 8px !important; border-style: solid !important; border-width: 1px !important; font-family: 'Rubik', sans-serif; font-size: 14px !important; line-height: 21px !important; padding: 12px 16px !important; width: 100%; box-sizing: border-box; overflow-y: initial; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-horizontalRow input::placeholder { color: #888888; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-horizontalRow button { background-color: #7000FF !important; border-color: #7000FF; border-style: solid; border-width: 1px; border-radius: 8px; box-shadow: none; color: #ffffff !important; cursor: pointer; font-family: 'Rubik', sans-serif; font-size: 14px !important; font-weight: 700; line-height: 20px; margin: 0 !important; padding: 12px 16px !important; width: 100%; height: auto; transition: background-color 0.2s; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-horizontalRow button:hover { background-color: #0067FD !important; border-color: #0067FD !important; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow { float: left; width: 100%; margin: 0 0 10px 0; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label { font-weight: normal; margin: 0; padding: 0; position: relative; display: block; min-height: 24px; padding-left: 24px; cursor: pointer; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type="checkbox"] { box-sizing: border-box; padding: 0; position: absolute; z-index: -1; opacity: 0; margin-top: 5px; margin-left: -1.5rem; overflow: visible; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description { color: #ffffff; display: block; font-family: 'Rubik', sans-serif; font-size: 12px; text-align: left; margin-bottom: 0; position: relative; vertical-align: top; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::before { position: absolute; top: 2px; left: -1.5rem; display: block; width: 16px; height: 16px; pointer-events: none; content: ""; background-color: #1e1e1e; border: #555 solid 1px; border-radius: 3px; box-sizing: border-box; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::after { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-size: 50% 50%; background-position: center; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::before { border-color: #7000FF !important; background-color: #7000FF !important; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::after { position: absolute; top: 0px; left: -1.5rem; display: block; width: 1rem; height: 1rem; content: ""; background: no-repeat 50%/50% 50%; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label p { color: #ffffff !important; font-family: 'Rubik', sans-serif !important; font-size: 12px !important; font-weight: normal !important; line-height: 18px !important; padding: 0 !important; margin: 0 5px 0 0 !important; }
            #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label a { color: #0067FD; text-decoration: underline; }
            .ml-subscribe-close { display: none; }
            .ml-mobileButton-horizontal { display: none; }
            #mlb2-37838971 .ml-mobileButton-horizontal button { background-color: #7000FF !important; border-color: #7000FF !important; border-style: solid !important; border-width: 1px !important; border-radius: 8px !important; box-shadow: none !important; color: #ffffff !important; cursor: pointer; font-family: 'Rubik', sans-serif !important; font-size: 14px !important; font-weight: 700 !important; line-height: 20px !important; padding: 12px 16px !important; width: 100% !important; }
            @media only screen and (max-width: 800px) {
              #mlb2-37838971.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent.horozintalForm { padding: 0 0 10px 0 !important; }
              .ml-form-formContent.horozintalForm .ml-form-horizontalRow { flex-direction: column; }
              .ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-input-horizontal { width: 100% !important; }
              .ml-form-formContent.horozintalForm .ml-button-horizontal { display: none !important; }
              .ml-mobileButton-horizontal { display: inline-block !important; margin-bottom: 10px; width: 100%; }
            }
            .ml-error input { border-color: red !important; }
            .ml-error .label-description, .ml-error .label-description p { color: #ff0000 !important; }
          `}</style>

          <div id="mlb2-37838971" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-37838971">
            <div className="ml-form-align-center">
              <div className="ml-form-embedWrapper embedForm">
                <div className="ml-form-embedBody ml-form-embedBodyHorizontal row-form">
                  <div className="ml-form-embedContent" style={{ marginBottom: 0 }} />
                  <form
                    className="ml-block-form"
                    action="https://assets.mailerlite.com/jsonp/686354/forms/180770580729955797/subscribe"
                    data-code=""
                    method="post"
                    target="_blank"
                  >
                    <div className="ml-form-formContent horozintalForm">
                      <div className="ml-form-horizontalRow">
                        <div className="ml-input-horizontal">
                          <div style={{ width: "100%" }} className="horizontal-fields">
                            <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                              <input
                                type="email"
                                className="form-control"
                                name="fields[email]"
                                placeholder="Email"
                                autoComplete="email"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="ml-button-horizontal primary">
                          <button type="submit" className="primary">Apuntarme</button>
                          <button disabled style={{ display: "none" }} type="button" className="loading">
                            <div className="ml-form-embedSubmitLoad"></div>
                            <span className="sr-only">Loading...</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="ml-form-checkboxRow ml-validate-required">
                      <label className="checkbox">
                        <input type="checkbox" />
                        <div className="label-description">
                          <p>
                            <span style={{ color: "rgb(255,255,255)" }}>Acepto la </span>
                            <a href="https://antiagencia.es/PoliticaPrivacidad" style={{ color: "#0067FD" }}>política de privacidad</a>
                          </p>
                        </div>
                      </label>
                    </div>
                    <input type="hidden" name="ml-submit" value="1" />
                    <div className="ml-mobileButton-horizontal">
                      <button type="submit" className="primary">Apuntarme</button>
                      <button disabled style={{ display: "none" }} type="button" className="loading">
                        <div className="ml-form-embedSubmitLoad"></div>
                        <span className="sr-only">Loading...</span>
                      </button>
                    </div>
                    <input type="hidden" name="anticsrf" value="true" />
                  </form>
                </div>
                <div className="ml-form-successBody row-success" style={{ display: "none" }}>
                  <div className="ml-form-successContent">
                    <h4>¡Gracias por apuntarte!</h4>
                    <p>Prometo mandarte mucho valor y entretenimiento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-white/30 text-[10px] font-body leading-relaxed mt-3 max-w-xl mx-auto text-center">
            Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en CampaignMonitor, proveedor de email marketing. CampaignMonitor también cumple con el RGPD, así que todo está protegido y amparado por la ley.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
