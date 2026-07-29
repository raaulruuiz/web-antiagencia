import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import BlogLayout from "@/components/blog/BlogLayout";
import MailerLiteForm from "@/components/MailerLiteForm";

const ML_CSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1778769");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#mlb2-38376765.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}#mlb2-38376765.ml-form-embedContainer h4,#mlb2-38376765.ml-form-embedContainer p,#mlb2-38376765.ml-form-embedContainer span,#mlb2-38376765.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:100%;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000ff!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#7000ff!important}.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}.ml-error .custom-checkbox-radio-list{border:1px solid red!important;border-radius:4px;padding:10px}.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow.ml-error .label-description p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow.ml-error .label-description p:first-letter{color:#ff0000!important}@media only screen and (max-width:800px){.ml-form-embedWrapper.embedDefault,.ml-form-embedWrapper.embedPopup{width:100%!important}.ml-form-formContent.horozintalForm{float:left!important}.ml-form-formContent.horozintalForm .ml-form-horizontalRow{height:auto!important;width:100%!important;float:left!important}.ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-input-horizontal{width:100%!important}.ml-form-formContent.horozintalForm .ml-form-horizontalRow .ml-input-horizontal>div{padding-right:0px!important;padding-bottom:10px}.ml-form-formContent.horozintalForm .ml-button-horizontal{width:100%!important}.ml-form-formContent.horozintalForm .ml-button-horizontal.labelsOn{padding-top:0px!important}}
`;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPost({ slug }) {
  const [post, setPost] = useState(undefined);
  const [prev, setPrev] = useState(null);
  const [next, setNext] = useState(null);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(async ({ data }) => {
        setPost(data || null);
        if (!data) return;

        const publishedAt = data.published_at;

        // Previous post (older)
        const { data: prevData } = await supabase
          .from("blog_posts")
          .select("slug, subject")
          .eq("published", true)
          .lt("published_at", publishedAt)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setPrev(prevData || null);

        // Next post (newer)
        const { data: nextData } = await supabase
          .from("blog_posts")
          .select("slug, subject")
          .eq("published", true)
          .gt("published_at", publishedAt)
          .order("published_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        setNext(nextData || null);
      });
  }, [slug]);

  if (post === undefined) return null;
  if (!post) return null; // caller handles 404

  // Parsear el contenido en grupos con su nivel de espacio posterior:
  // \n   = línea del mismo bloque → <br>
  // \n\n = párrafo normal → mb-6
  // \n\n\n = espacio grande (2 separadores en el email) → mb-12
  const paragraphGroups = (() => {
    const content = post.content_html || "";
    const groups = [];
    let lastIndex = 0;
    const re = /\n{2,}/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const text = content.slice(lastIndex, m.index).trim();
      if (text) groups.push({ text, bigGap: m[0].length >= 3 });
      lastIndex = m.index + m[0].length;
    }
    const last = content.slice(lastIndex).trim();
    if (last) groups.push({ text: last, bigGap: false });
    return groups;
  })();

  return (
    <>
      <Helmet>
        <title>{post.subject} — Anti-Blog Raúl Ruiz</title>
        <meta name="description" content={post.excerpt || post.subject} />
      </Helmet>

      <BlogLayout>
        <article>
          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-normal leading-snug mb-4"
            style={{ color: "#7000FF" }}
          >
            {post.subject}
          </h1>

          {/* Meta */}
          <p className="text-lg mb-10">
            <Link to="/" style={{ color: "#7000FF" }}>
              Por Raúl Ruiz
            </Link>
          </p>

          {/* Body */}
          <div className="text-gray-800 leading-relaxed text-lg blog-post-body">
            {paragraphGroups.map(({ text, bigGap }, i) => {
              const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
              return (
                <p key={i} className={bigGap ? "mb-12" : "mb-6"}>
                  {lines.map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line) }} />
                    </span>
                  ))}
                </p>
              );
            })}
          </div>
        </article>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <nav className="mt-16 pt-8 border-t border-gray-200 flex justify-between gap-4 text-lg">
            {prev ? (
              <Link
                to={`/${prev.slug}`}
                style={{ color: "#7000FF" }}
                className="hover:underline max-w-xs"
              >
                ← {prev.subject}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={`/${next.slug}`}
                style={{ color: "#7000FF" }}
                className="hover:underline max-w-xs text-right"
              >
                {next.subject} →
              </Link>
            )}
          </nav>
        )}

        {/* Subscribe form */}
        <div className="mt-16 pt-8 border-t border-gray-200 blog-subscribe-form">
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
            instanceId="blogpost"
            scriptVersion="vb397d78ebaa8a0f631d35384c46d781b"
          />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en MailerLite, proveedor de email marketing. MailerLite también cumple con el RGPD, así que todo está protegido y amparado por la ley.
          </p>
          </div>
        </div>
      </BlogLayout>
    </>
  );
}
