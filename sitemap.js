const fs = require('fs').promises;
const path = require('path');

const BASE_URL = process.env.BASE_URL;
const API_URL = process.env.API_URL || '';
const OUTPUT_PATH = process.env.OUTPUT_PATH || path.join(__dirname, 'frontend', 'public', 'sitemap.xml');

if (!BASE_URL) {
  console.error('ERROR: set BASE_URL environment variable, e.g. https://example.com');
  process.exit(1);
}

const staticPaths = [
  '/',
  '/about',
  '/blogs',
  '/contact',
  '/create-design',
  '/designs',
  '/cancellation-policy',
  '/checkout',
  '/cart',
  '/designer'
];

async function tryFetchProducts() {
  const origin = (API_URL || BASE_URL).replace(/\/$/, '');
  const endpoints = ['/api/products', '/api/product', '/products', '/product'];
  let fetchFn = global.fetch;
  if (!fetchFn) {
    try { fetchFn = require('node-fetch'); } catch (e) { return []; }
  }

  for (const ep of endpoints) {
    const url = origin + ep;
    try {
      const res = await fetchFn(url, { method: 'GET' });
      if (!res || (res.status && res.status >= 400)) continue;
      const data = await (typeof res.json === 'function' ? res.json() : res);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.products)) return data.products;
    } catch (err) {
      // ignore and try next endpoint
    }
  }
  return [];
}

function buildUrlset(urls) {
  const items = urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

(async () => {
  const base = BASE_URL.replace(/\/$/, '');
  const urls = staticPaths.map(p => base + p);
  const products = await tryFetchProducts();
  for (const p of products) {
    const slug = p.slug || p._id || p.id || (p.name && String(p.name).toLowerCase().replace(/\s+/g, '-'));
    if (!slug) continue;
    urls.push(`${base}/product/${encodeURIComponent(slug)}`);
  }

  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, buildUrlset(urls), 'utf8');
    console.log('Sitemap written to', OUTPUT_PATH);
  } catch (err) {
    console.error('Failed to write sitemap:', err);
    process.exit(1);
  }
})();
