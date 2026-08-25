import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import PodcastLayout from "@/components/blog/PodcastLayout";

const PODCASTS_PER_PAGE = 5;

export default function Podcasts() {
  const { page: pageParam } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  const [podcasts, setPodcasts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const from = (page - 1) * PODCASTS_PER_PAGE;
    const to = from + PODCASTS_PER_PAGE - 1;

    supabase
      .from("podcasts")
      .select("slug, titulo, host_nombre, host_url, miniatura_url, excerpt, published_at", { count: "exact" })
      .eq("published", true)
      .order("published_at", { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setPodcasts(data || []);
        setTotal(count || 0);
        setLoading(false);
      });
  }, [page]);

  const totalPages = Math.ceil(total / PODCASTS_PER_PAGE);

  function goToPage(p) {
    window.scrollTo(0, 0);
    if (p === 1) {
      navigate("/podcasts");
    } else {
      navigate(`/podcasts/page/${p}`);
    }
  }

  return (
    <>
      <Helmet>
        <title>
          {page > 1
            ? `Podcasts de Raúl Ruiz — Página ${page} — Antiagencia`
            : "Podcasts de Raúl Ruiz — Antiagencia"}
        </title>
        <meta
          name="description"
          content="Todos los podcasts en los que ha aparecido Raúl Ruiz. Email marketing, ventas y negocios sin filtros."
        />
        <link
          rel="canonical"
          href={
            page > 1
              ? `https://antiagencia.es/podcasts/page/${page}`
              : "https://antiagencia.es/podcasts"
          }
        />
      </Helmet>

      <PodcastLayout>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : podcasts.length === 0 ? (
          <p className="text-gray-400 text-center py-20">Próximamente.</p>
        ) : (
          <>
            {podcasts.map((podcast, i) => (
              <div key={podcast.slug}>
                <article className="py-8">
                  {/* Miniatura */}
                  {podcast.miniatura_url && (
                    <Link to={`/podcasts/${podcast.slug}`} className="block mb-4 overflow-hidden rounded">
                      <img
                        src={podcast.miniatura_url}
                        alt={podcast.titulo}
                        className="w-full object-cover"
                        style={{ height: "160px" }}
                      />
                    </Link>
                  )}

                  {/* Título */}
                  <h2 className="text-2xl md:text-3xl text-gray-900 font-normal mb-2 leading-snug">
                    <Link to={`/podcasts/${podcast.slug}`} className="hover:underline">
                      {podcast.titulo}
                    </Link>
                  </h2>

                  {/* Host */}
                  <p className="text-sm mb-4">
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

                  {/* Excerpt */}
                  {podcast.excerpt && (
                    <p
                      className="text-gray-700 leading-relaxed mb-4 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {podcast.excerpt}
                    </p>
                  )}

                  {/* Link escuchar */}
                  <Link
                    to={`/podcasts/${podcast.slug}`}
                    className="text-sm hover:underline"
                    style={{ color: "#7000FF" }}
                  >
                    Escuchar →
                  </Link>
                </article>
                {i < podcasts.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-gray-200">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="text-gray-400 px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className="w-9 h-9 text-sm rounded transition-colors"
                        style={
                          p === page
                            ? { backgroundColor: "#7000FF", color: "white" }
                            : { color: "#555" }
                        }
                      >
                        {p}
                      </button>
                    )
                  )}
                {page < totalPages && (
                  <button
                    onClick={() => goToPage(page + 1)}
                    className="ml-2 text-sm hover:underline"
                    style={{ color: "#7000FF" }}
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </PodcastLayout>
    </>
  );
}
