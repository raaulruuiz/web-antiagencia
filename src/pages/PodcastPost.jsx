import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import PodcastLayout from "@/components/blog/PodcastLayout";
import MailerLiteForm from "@/components/MailerLiteForm";

const ML_CSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1778769");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#mlb2-38376765.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}#mlb2-38376765.ml-form-embedContainer h4,#mlb2-38376765.ml-form-embedContainer p,#mlb2-38376765.ml-form-embedContainer span,#mlb2-38376765.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:100%;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000ff!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#7000ff!important}.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}.ml-error .custom-checkbox-radio-list{border:1px solid red!important;border-radius:4px;padding:10px}.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow.ml-error .label-description p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow.ml-error .label-description p:first-letter{color:#ff0000!important}@media only screen and (max-width:800px){.ml-form-embedWrapper.embedDefault,.ml-form-embedWrapper.embedPopup{width:100%!important}.ml-form-formContent.horozintalForm{float:left!important}.ml-form-formContent.horozintalForm .ml-form-horizontalRow{height:auto!important;width:100%!important;float:left!important}.ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-input-horizontal{width:100%!important}.ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-input-horizontal>div{padding-right:0px!important;padding-bottom:10px}.ml-form-formContent.horozintalForm .ml-button-horizontal{width:100%!important}.ml-form-formContent.horozintalForm .ml-button-horizontal.labelsOn{padding-top:0px!important}}
`;

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?/\s]+)/);
  return m ? m[1] : null;
}

const PLATFORM_ICONS = {
  spotify: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.441 17.313a.75.75 0 01-1.032.249c-2.826-1.727-6.381-2.117-10.573-1.16a.75.75 0 01-.335-1.463c4.587-1.048 8.521-.597 11.692 1.341a.75.75 0 01.248 1.033zm1.452-3.23a.938.938 0 01-1.29.309c-3.233-1.987-8.163-2.563-11.988-1.402a.938.938 0 01-.543-1.794c4.371-1.323 9.8-.682 13.513 1.597a.938.938 0 01.308 1.29zm.125-3.362C15.38 8.39 9.126 8.188 5.624 9.292a1.125 1.125 0 01-.652-2.152c4.052-1.228 10.793-1.001 15.051 1.594a1.125 1.125 0 01-1.005 2.008z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  ),
  ivoox: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13v10l7-5z"/>
    </svg>
  ),
  amazon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705a.661.661 0 01-.76.074c-1.07-.89-1.261-1.3-1.848-2.15-1.766 1.799-3.017 2.34-5.309 2.34-2.711 0-4.822-1.674-4.822-5.021 0-2.612 1.415-4.393 3.434-5.266 1.748-.773 4.192-.911 6.057-1.123v-.421c0-.773.06-1.686-.394-2.353-.395-.596-1.154-.842-1.823-.842-1.237 0-2.343.635-2.611 1.951-.056.285-.268.567-.549.581l-3.063-.331c-.259-.059-.546-.271-.472-.673C5.867 2.307 8.494 1.5 10.83 1.5c1.194 0 2.754.317 3.697 1.22 1.194 1.116.924 2.604.924 4.23v3.835c0 1.152.478 1.659.927 2.282.158.221.192.485-.01.651l-2.219 1.877h-.005zm3.892 1.619c-.36.28-1.216.85-1.823 1.16l.143.189c.567-.414 1.399-1.008 1.75-1.287.349-.278.238-.462-.07-.062z"/>
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5l-4.5-2.5-4.5 2.5 1-5-3.5-3 5-.5L12 3l2 5 5 .5-3.5 3 1 5z"/>
    </svg>
  ),
};

const PLATFORM_COLORS = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  apple: "#872EC4",
  ivoox: "#FF6600",
  amazon: "#00A8E1",
  google: "#4285F4",
};

export default function PodcastPost({ slug }) {
  const [podcast, setPodcast] = useState(undefined);
  const [prev, setPrev] = useState(null);
  const [next, setNext] = useState(null);

  useEffect(() => {
    supabase
      .from("podcasts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(async ({ data }) => {
        setPodcast(data || null);
        if (!data) return;

        const publishedAt = data.published_at;

        // Previous podcast (older)
        const { data: prevData } = await supabase
          .from("podcasts")
          .select("slug, titulo")
          .eq("published", true)
          .lt("published_at", publishedAt)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setPrev(prevData || null);

        // Next podcast (newer)
        const { data: nextData } = await supabase
          .from("podcasts")
          .select("slug, titulo")
          .eq("published", true)
          .gt("published_at", publishedAt)
          .order("published_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        setNext(nextData || null);
      });
  }, [slug]);

  if (podcast === undefined) return null;
  if (!podcast) return null;

  const youtubeId = getYouTubeId(podcast.youtube_url);

  const plataformas = Array.isArray(podcast.plataformas) ? podcast.plataformas : [];

  return (
    <>
      <Helmet>
        <title>{podcast.titulo} — Podcasts Raúl Ruiz</title>
        <meta name="description" content={podcast.excerpt || podcast.titulo} />
        <link rel="canonical" href={`https://antiagencia.es/podcasts/${slug}`} />
      </Helmet>

      <PodcastLayout>
        <article>
          {/* Título */}
          <h1
            className="text-3xl md:text-4xl font-normal leading-snug mb-4"
            style={{ color: "#7000FF" }}
          >
            {podcast.titulo}
          </h1>

          {/* Programa + Host */}
          <p className="text-lg mb-6">
            {podcast.programa_nombre && (
              <span className="text-gray-500 mr-2">{podcast.programa_nombre} · </span>
            )}
            {podcast.host_url ? (
              <a
                href={podcast.host_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7000FF" }}
              >
                Por {podcast.host_nombre}
              </a>
            ) : (
              <span style={{ color: "#7000FF" }}>Por {podcast.host_nombre}</span>
            )}
          </p>

          {/* YouTube embed */}
          {youtubeId && (
            <div
              className="mb-6 w-full overflow-hidden rounded"
              style={{ aspectRatio: "16/9" }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={podcast.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* Audio embed (Spotify-style) */}
          {podcast.audio_embed_url && (
            <div className="mb-6 w-full">
              <iframe
                src={podcast.audio_embed_url}
                title={`Audio: ${podcast.titulo}`}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="w-full border-0 rounded"
                style={{ height: "152px" }}
              />
            </div>
          )}

          {/* Plataformas */}
          {plataformas.length > 0 && (
            <div className="mb-8">
              <p className="font-bold mb-3 text-gray-900">Escúchalo donde prefieras:</p>
              <div className="flex flex-wrap gap-3">
                {plataformas.map((plat, i) => {
                  const key = (plat.icono || "").toLowerCase();
                  const icon = PLATFORM_ICONS[key];
                  const color = PLATFORM_COLORS[key] || "#7000FF";
                  return (
                    <a
                      key={i}
                      href={plat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ backgroundColor: color }}
                    >
                      {icon || (
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold uppercase">
                          {(plat.nombre || plat.icono || "?")[0]}
                        </span>
                      )}
                      {plat.nombre}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transcripción */}
          {podcast.transcripcion && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Transcripción</h2>
              <p className="text-sm text-gray-400 mb-8">
                Esto no lo he escrito yo, está transcrito directamente. Puede haber faltas.
              </p>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">{children}</h3>,
                  h2: ({ children }) => <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">{children}</h4>,
                  h3: ({ children }) => <h5 className="font-bold text-gray-900 mt-4 mb-2">{children}</h5>,
                  p: ({ children }) => <p className="text-gray-800 leading-relaxed mb-6 text-base">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                  hr: () => <hr className="my-8 border-gray-200" />,
                }}
              >
                {podcast.transcripcion}
              </ReactMarkdown>
            </div>
          )}
        </article>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <nav className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row md:justify-between gap-4 text-lg items-center md:items-start">
            {prev ? (
              <Link
                to={`/podcasts/${prev.slug}`}
                style={{ color: "#7000FF" }}
                className="hover:underline w-full md:w-auto md:max-w-xs text-center md:text-left"
                onClick={() => window.scrollTo(0, 0)}
              >
                ← {prev.titulo}
              </Link>
            ) : (
              <span className="hidden md:block" />
            )}
            {next && (
              <Link
                to={`/podcasts/${next.slug}`}
                style={{ color: "#7000FF" }}
                className="hover:underline w-full md:w-auto md:max-w-xs text-center md:text-right"
                onClick={() => window.scrollTo(0, 0)}
              >
                {next.titulo} →
              </Link>
            )}
          </nav>
        )}

        {/* Subscribe form */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center font-bold text-gray-900 text-lg mb-6">
            Suscríbete gratis y date de baja cuando te apetezca
          </p>
          <div style={{ color: '#000' }}>
            <MailerLiteForm
              mlb2Id="38376765"
              accountId="686354"
              formActionId="181751106241562330"
              css={ML_CSS}
              submitText="Apúntame a la lista"
              instanceId="podcastpost"
              scriptVersion="vb397d78ebaa8a0f631d35384c46d781b"
            />
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en MailerLite, proveedor de email marketing. MailerLite también cumple con el RGPD, así que todo está protegido y amparado por la ley.
            </p>
          </div>
        </div>
      </PodcastLayout>
    </>
  );
}
