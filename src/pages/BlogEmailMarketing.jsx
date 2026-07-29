import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import BlogLayout from "@/components/blog/BlogLayout";

const POSTS_PER_PAGE = 10;

export default function BlogEmailMarketing() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    supabase
      .from("blog_posts")
      .select("slug, subject, excerpt, published_at", { count: "exact" })
      .eq("published", true)
      .order("published_at", { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setPosts(data || []);
        setTotal(count || 0);
        setLoading(false);
      });
  }, [page]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Anti-Blog de Email Marketing — Raúl Ruiz Antiagencia</title>
        <meta
          name="description"
          content="Los emails que mando a mi lista, publicados tal cual. Email marketing sin filtros."
        />
      </Helmet>

      <BlogLayout>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-center py-20">Próximamente.</p>
        ) : (
          <>
            {posts.map((post, i) => (
              <div key={post.slug}>
                <article className="py-8">
                  <h2 className="text-2xl md:text-3xl text-gray-900 font-normal mb-2 leading-snug">
                    <Link to={`/${post.slug}`} className="hover:underline">
                      {post.subject}
                    </Link>
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "#7000FF" }}>
                    Por Raúl Ruiz
                  </p>
                  {post.excerpt && (
                    <p className="text-gray-700 leading-relaxed mb-4">{post.excerpt}</p>
                  )}
                  <Link
                    to={`/${post.slug}`}
                    className="text-sm hover:underline"
                    style={{ color: "#7000FF" }}
                  >
                    Leer más
                  </Link>
                </article>
                {i < posts.length - 1 && <hr className="border-gray-200" />}
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
                        onClick={() => { setPage(p); window.scrollTo(0, 0); }}
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
                    onClick={() => { setPage(prev => prev + 1); window.scrollTo(0, 0); }}
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
      </BlogLayout>
    </>
  );
}
