import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import PodcastLayout from "@/components/blog/PodcastLayout";
import MailerLiteForm from "@/components/MailerLiteForm";

const ML_CSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1778769");
.ml-form-checkboxRow label.checkbox{display:flex!important;align-items:flex-start!important;gap:8px!important;cursor:pointer}
.ml-form-checkboxRow label.checkbox input[type=checkbox]{margin-top:3px;flex-shrink:0}
.ml-form-checkboxRow label.checkbox .label-description{flex:1}
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
    <svg viewBox="0 0 413 413" className="w-5 h-5" fill="white">
      <path d="M130.58 206.23C142.34 211.74 155.17 215.75 169.05 218.28C155.17 220.81 142.34 224.81 130.58 230.33C108.89 240.51 92.0199 254.64 79.9599 272.72C68.3499 290.14 62.3499 310.23 61.9199 333H136.68C137.07 320.87 139.84 310.27 145.03 301.23C150.65 291.45 158.63 283.95 168.94 278.73C179.25 273.51 191.77 270.89 206.5 270.89C221.23 270.89 233.42 273.5 243.86 278.73C254.3 283.96 262.34 291.38 267.96 301.02C273.17 309.95 275.93 320.62 276.32 332.99H351.07C350.59 310.38 344.59 290.35 333.04 272.9C320.99 254.69 304.12 240.5 282.42 230.32C270.66 224.81 257.83 220.8 243.95 218.27C257.83 215.74 270.66 211.74 282.42 206.22C304.11 196.04 320.98 181.91 333.04 163.83C344.65 146.41 350.65 126.32 351.08 103.55H276.32C275.93 115.68 273.16 126.28 267.97 135.32C262.35 145.1 254.37 152.59 244.06 157.82C233.75 163.04 221.23 165.66 206.5 165.66C191.77 165.66 179.58 163.05 169.14 157.82C158.69 152.6 150.66 145.17 145.04 135.53C139.83 126.6 137.07 115.93 136.68 103.56H61.9299C62.4099 126.17 68.4099 146.2 79.9599 163.65C92.0099 181.86 108.88 196.05 130.58 206.23Z"/>
      <path d="M238.71 56.67C235.64 52.07 231.35 48.47 225.83 45.88C220.31 43.29 213.87 41.99 206.51 41.99C199.15 41.99 192.71 43.29 187.18 45.88C181.66 48.47 177.36 52.07 174.3 56.67C171.23 61.27 169.7 66.64 169.7 72.77C169.7 78.9 171.23 84.19 174.3 88.82C177.37 93.46 181.66 97.07 187.18 99.66C192.7 102.25 199.14 103.54 206.51 103.54C213.88 103.54 220.31 102.24 225.83 99.66C231.35 97.07 235.65 93.47 238.71 88.87C241.78 84.27 243.31 78.94 243.31 72.87C243.31 66.8 241.78 61.26 238.71 56.66V56.67Z"/>
    </svg>
  ),
  amazon: (
    <svg viewBox="0 0 30 30" className="w-5 h-5" fill="currentColor">
      <path d="M 15.183594 3 C 11.820594 3 8.0848281 4.2580938 7.2988281 8.3710938 C 7.2148281 8.8090937 7.5215469 9.0336562 7.8105469 9.0976562 L 11.224609 9.4453125 C 11.545609 9.4283125 11.801281 9.1304531 11.863281 8.8144531 C 12.157281 7.3974531 13.357125 6.6972656 14.703125 6.6972656 C 15.430125 6.6972656 16.253594 6.9692812 16.683594 7.6132812 C 17.180594 8.3322813 17.097656 9.3095781 17.097656 10.142578 L 17.097656 10.615234 C 15.048656 10.843234 12.376937 10.982406 10.460938 11.816406 C 8.2469375 12.763406 6.6933594 14.695156 6.6933594 17.535156 C 6.6933594 21.169156 9.0171875 23.001953 11.992188 23.001953 C 14.505187 23.001953 15.860781 22.399359 17.800781 20.443359 C 18.441781 21.362359 18.66975 21.81425 19.84375 22.78125 C 20.10775 22.92125 20.440828 22.8955 20.673828 22.6875 L 20.673828 22.71875 C 21.378828 22.09675 22.664766 20.981859 23.384766 20.380859 C 23.671766 20.146859 23.609766 19.781891 23.384766 19.462891 C 22.738766 18.579891 22.076172 17.847031 22.076172 16.207031 L 22.076172 10.771484 C 22.076172 8.4624844 22.232672 6.3263281 20.513672 4.7363281 C 19.156672 3.4483281 16.901594 3 15.183594 3 z M 16.140625 13.425781 C 16.459625 13.404781 16.777656 13.425781 17.097656 13.425781 L 17.097656 14.183594 C 17.098656 15.547594 17.152984 16.668859 16.458984 17.880859 C 15.896984 18.864859 14.993953 19.460938 14.001953 19.460938 C 12.645953 19.460938 11.861328 18.445641 11.861328 16.931641 C 11.861328 14.326641 13.910625 13.570781 16.140625 13.425781 z M 26.080078 22.220703 C 25.171078 22.233703 24.106016 22.424234 23.291016 22.990234 C 23.041016 23.164234 23.077469 23.409953 23.355469 23.376953 C 24.272469 23.267953 26.299063 23.011656 26.664062 23.472656 C 27.028063 23.934656 26.261922 25.832641 25.919922 26.681641 C 25.815922 26.937641 26.041391 27.036797 26.275391 26.841797 C 27.801391 25.577797 28.208484 22.956266 27.896484 22.572266 C 27.741484 22.385266 26.990078 22.207703 26.080078 22.220703 z M 2.1777344 22.701172 C 1.9877344 22.726172 1.9132812 22.973344 2.1132812 23.152344 C 5.5052812 26.184344 9.9770781 28 14.955078 28 C 18.506078 28 22.651094 26.899312 25.496094 24.820312 C 25.966094 24.475313 25.557172 23.943484 25.076172 24.146484 C 21.887172 25.486484 18.401047 26.136719 15.248047 26.136719 C 10.573047 26.136719 6.06525 24.873625 2.40625 22.765625 C 2.32525 22.719625 2.2397344 22.693172 2.1777344 22.701172 z"/>
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
              <>
                {podcast.host_url ? (
                  <a href={podcast.host_url} target="_blank" rel="noopener noreferrer" style={{ color: "#7000FF" }}>
                    {podcast.programa_nombre}
                  </a>
                ) : (
                  <span style={{ color: "#7000FF" }}>{podcast.programa_nombre}</span>
                )}
                <span className="text-gray-400 mx-2">·</span>
              </>
            )}
            {podcast.host_url ? (
              <a href={podcast.host_url} target="_blank" rel="noopener noreferrer" className="text-base" style={{ color: "#7000FF" }}>
                Por {podcast.host_nombre}
              </a>
            ) : (
              <span className="text-base" style={{ color: "#7000FF" }}>Por {podcast.host_nombre}</span>
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
