const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

/* ── Preview de URLs (og:title, og:image, og:description) ── */
function fetchPreview(targetUrl, res) {
  let parsedUrl;
  try { parsedUrl = new URL(targetUrl); } catch {
    res.writeHead(400, corsHeaders('application/json'));
    res.end(JSON.stringify({ error: 'URL inválida' }));
    return;
  }

  const lib = parsedUrl.protocol === 'https:' ? https : http;
  const options = {
    hostname: parsedUrl.hostname,
    path:     parsedUrl.pathname + parsedUrl.search,
    method:   'GET',
    headers:  { 'User-Agent': 'Mozilla/5.0 (compatible; AndyNet/3.0)' },
    timeout:  5000,
  };

  const req = lib.request(options, r => {
    // Solo procesar HTML
    const ct = r.headers['content-type'] || '';
    if (!ct.includes('text/html')) {
      res.writeHead(200, corsHeaders('application/json'));
      res.end(JSON.stringify({
        title: parsedUrl.hostname,
        description: '',
        image: '',
        url: targetUrl,
        domain: parsedUrl.hostname,
      }));
      return;
    }

    let html = '';
    r.setEncoding('utf8');
    r.on('data', chunk => {
      html += chunk;
      if (html.length > 80000) r.destroy(); // no bajar más de 80kb
    });
    r.on('end', () => {
      const getMeta = (prop) => {
        const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
        const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
        return (html.match(re) || html.match(re2) || [])[1] || '';
      };
      const getTitle = () => {
        return getMeta('og:title') || getMeta('twitter:title') ||
          (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
      };

      res.writeHead(200, corsHeaders('application/json'));
      res.end(JSON.stringify({
        title:       getTitle().trim().slice(0, 120),
        description: (getMeta('og:description') || getMeta('description')).trim().slice(0, 200),
        image:       getMeta('og:image') || getMeta('twitter:image'),
        url:         targetUrl,
        domain:      parsedUrl.hostname.replace('www.', ''),
      }));
    });
  });

  req.on('error', () => {
    res.writeHead(200, corsHeaders('application/json'));
    res.end(JSON.stringify({ title: parsedUrl.hostname, description: '', image: '', url: targetUrl, domain: parsedUrl.hostname }));
  });
  req.on('timeout', () => {
    req.destroy();
    res.writeHead(200, corsHeaders('application/json'));
    res.end(JSON.stringify({ title: parsedUrl.hostname, description: '', image: '', url: targetUrl, domain: parsedUrl.hostname }));
  });
  req.end();
}

function corsHeaders(ct) {
  return {
    'Content-Type': ct,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600',
  };
}

/* ── Servidor ── */
const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url, true);
  const urlPath = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders('text/plain'));
    res.end();
    return;
  }

  // API: preview de URL
  if (urlPath === '/api/preview') {
    const targetUrl = parsed.query.url;
    if (!targetUrl) {
      res.writeHead(400, corsHeaders('application/json'));
      res.end(JSON.stringify({ error: 'Falta url' }));
      return;
    }
    fetchPreview(targetUrl, res);
    return;
  }

  // Archivos estáticos
  let filePath = urlPath === '/' || urlPath === '' ? '/index.html' : urlPath;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type':  mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0',
    });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Andy.net v3 corriendo en http://${HOST}:${PORT}`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ocupado.`);
    process.exit(1);
  } else throw err;
});
