const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wphvmyqsxicyoifrlevt.supabase.co';
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

module.exports = async (req, res) => {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: posts } = await sb
    .from('blog_posts')
    .select('slug, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const blogUrls = (posts || []).map(p => ({
    loc: `https://antiagencia.es/blog-email-marketing/${p.slug}`,
    lastmod: new Date(p.published_at).toISOString().slice(0, 10),
    changefreq: 'monthly',
    priority: '0.7',
  }));

  const allUrls = [...STATIC_URLS, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
