import https from 'https';

const SUPABASE_HOST = 'wphvmyqsxicyoifrlevt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cB3mpag9moVvhekQG6GBWw_ogz_nb9M';

const STATIC_URLS = [
  { loc: 'https://antiagencia.es/', changefreq: 'weekly', priority: '1.0' },
  { loc: 'https://antiagencia.es/blog-email-marketing', changefreq: 'weekly', priority: '0.9' },
  { loc: 'https://antiagencia.es/facebook-instagram', changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://antiagencia.es/TrabajaConNosotros', changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://antiagencia.es/anti-biblioteca', changefreq: 'weekly', priority: '0.8' },
  { loc: 'https://antiagencia.es/jorge-coronado', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://antiagencia.es/newsletter', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://antiagencia.es/ComoTrabajamos', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://antiagencia.es/Contacto', changefreq: 'monthly', priority: '0.6' },
  { loc: 'https://antiagencia.es/politica-privacidad', changefreq: 'yearly', priority: '0.3' },
  { loc: 'https://antiagencia.es/AvisoLegal', changefreq: 'yearly', priority: '0.3' },
  { loc: 'https://antiagencia.es/PoliticaCookies', changefreq: 'yearly', priority: '0.3' },
];

function fetchPosts() {
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_HOST,
      path: '/rest/v1/blog_posts?select=slug,published_at&published=eq.true&order=published_at.desc',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    };
    https.get(options, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

export default async function handler(req, res) {
  const posts = await fetchPosts();

  const blogUrls = (Array.isArray(posts) ? posts : []).map((p) => ({
    loc: `https://antiagencia.es/blog-email-marketing/${p.slug}`,
    lastmod: new Date(p.published_at).toISOString().slice(0, 10),
    changefreq: 'monthly',
    priority: '0.7',
  }));

  const allUrls = [...STATIC_URLS, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
