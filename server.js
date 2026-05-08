const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const LITE_DATA_FILE = path.join(__dirname, 'lite-data.json');

const MIME = {
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

/* ── CORS headers ── */
function corsHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=3600',
  };
}

/* ── Preview de URL ── */
function fetchPreview(targetUrl, res) {
  let parsedUrl;
  try { parsedUrl = new URL(targetUrl); } catch {
    res.writeHead(400, corsHeaders('application/json'));
    res.end(JSON.stringify({ error: 'URL invalida' }));
    return;
  }

  const lib = parsedUrl.protocol === 'https:' ? https : http;
  const req = lib.request({
    hostname: parsedUrl.hostname,
    path:     parsedUrl.pathname + parsedUrl.search,
    method:   'GET',
    headers:  { 'User-Agent': 'Mozilla/5.0 (compatible; AndyNet/3.0)' },
    timeout:  5000,
  }, (r) => {
    if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
      fetchPreview(r.headers.location, res);
      return;
    }

    let html = '';
    r.setEncoding('utf8');
    r.on('data', chunk => {
      html += chunk;
      if (html.length > 80000) r.destroy();
    });
    r.on('end', () => {
      const getMeta = (name) => {
        const m = html.match(new RegExp('<meta[^>]+(?:name|property)=["\']' + name + '["\'][^>]+content=["\']([^"\']+)["\']', 'i'))
                || html.match(new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:name|property)=["\']' + name + '["\']', 'i'));
        return m ? m[1].trim() : '';
      };
      const getTitle = () => {
        const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return m ? m[1].trim() : '';
      };

      res.writeHead(200, corsHeaders('application/json'));
      res.end(JSON.stringify({
        title:       getMeta('og:title') || getMeta('twitter:title') || getTitle(),
        description: (getMeta('og:description') || getMeta('description')).slice(0, 200),
        image:       getMeta('og:image') || getMeta('twitter:image'),
        domain:      parsedUrl.hostname.replace('www.', ''),
      }));
    });
  });

  req.on('error', () => {
    res.writeHead(200, corsHeaders('application/json'));
    res.end(JSON.stringify({ title: '', description: '', image: '', domain: '' }));
  });
  req.on('timeout', () => { req.destroy(); });
  req.end();
}

/* ── Servidor ── */
const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url, true);
  const urlPath = parsed.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders('text/plain'));
    res.end();
    return;
  }

  // ── SYNC: Guardar datos de andy.lite ──
  if (urlPath === '/api/lite/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        data._savedAt = new Date().toISOString();
        fs.writeFile(LITE_DATA_FILE, JSON.stringify(data, null, 2), (err) => {
          if (err) {
            res.writeHead(500, corsHeaders('application/json'));
            res.end(JSON.stringify({ ok: false, error: err.message }));
            return;
          }
          res.writeHead(200, corsHeaders('application/json'));
          res.end(JSON.stringify({ ok: true, savedAt: data._savedAt }));
        });
      } catch (err) {
        res.writeHead(400, corsHeaders('application/json'));
        res.end(JSON.stringify({ ok: false, error: 'JSON invalido' }));
      }
    });
    return;
  }

  // ── SYNC: Cargar datos de andy.lite ──
  if (urlPath === '/api/lite/load' && req.method === 'GET') {
    fs.readFile(LITE_DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        // Si no existe el archivo todavía, devolver estado vacío
        res.writeHead(200, corsHeaders('application/json'));
        res.end(JSON.stringify({ ok: true, data: null }));
        return;
      }
      try {
        res.writeHead(200, corsHeaders('application/json'));
        res.end(JSON.stringify({ ok: true, data: JSON.parse(data) }));
      } catch {
        res.writeHead(500, corsHeaders('application/json'));
        res.end(JSON.stringify({ ok: false, error: 'Error leyendo datos' }));
      }
    });
    return;
  }

  // ── API: preview de URL ──
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

  // ── API: Chat con Anet ──
  if (urlPath === '/api/chat') {
    if (req.method !== 'POST') {
      res.writeHead(405, corsHeaders('application/json'));
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages, context } = JSON.parse(body);
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          res.writeHead(500, corsHeaders('application/json'));
          res.end(JSON.stringify({ error: 'API key no configurada' }));
          return;
        }

        const systemPrompt = [
          'Eres Anet, la asistente personal integrada en Andy.net, el sistema operativo personal de Andrea.',
          '',
          'QUIEN ES ANDREA:',
          '- Creadora, disenadora y builder de proyectos digitales',
          '- Vive en Chihuahua, Mexico',
          '- Proyectos: Botanica Adaptogens, Toltia, Andy.net, Editorial, AP Studio',
          '- Usa Andy.net para planificar, crear y ejecutar su vida y proyectos',
          '',
          'TU ROL:',
          '- Directa, sin relleno ni frases genericas',
          '- Conoces su sistema completo y lo usas activamente',
          '- Hablas siempre en espanol',
          '- Generas ideas, brainstorming, analisis de carga de trabajo, priorizacion',
          '- Puedes EJECUTAR ACCIONES REALES en el sistema',
          '',
          'ACCIONES QUE PUEDES EJECUTAR:',
          'Cuando el usuario pida crear algo, incluye al FINAL de tu respuesta bloques de accion:',
          '',
          'Inbox: [ACCION:crear_tarea:texto] o [ACCION:crear_nota:texto]',
          'Planner: [ACCION:crear_evento:texto|YYYY-MM-DD|morning]',
          '  (bloques: morning, afternoon, night)',
          'Nota viva: [ACCION:nota_viva:nombre proyecto|tipo|texto]',
          '  (tipos: idea, decision, pendiente, hallazgo)',
          'Avance: [ACCION:registrar_avance:nombre proyecto|tipo|texto]',
          '  (tipos: entrega, decision, bloqueo, nota, inicio)',
          '',
          'REGLAS DE ACCIONES:',
          '- Solo incluye [ACCION:...] cuando el usuario claramente pide crear o guardar algo',
          '- Los bloques se ejecutan automaticamente y no son visibles para Andrea',
          '- Confirma con lenguaje natural lo que hiciste',
          '',
          'CONTEXTO DEL SISTEMA:',
          context || 'Sin contexto disponible',
          '',
          'REGLAS GENERALES:',
          '- Nunca digas "Como IA" ni "No tengo acceso"',
          '- Se concisa pero completa',
          '- Usa el contexto para respuestas relevantes y personalizadas',
        ].join('\n');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages,
          }),
        });

        const data = await response.json();
        res.writeHead(200, corsHeaders('application/json'));
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, corsHeaders('application/json'));
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ── Archivos estáticos ──
  if (urlPath === '/sw-lite.js') {
  const filePath = path.join(__dirname, 'sw-lite.js');
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(data);
  });
  return;
}
  if (urlPath === '/lite') {
    const filePath = path.join(__dirname, 'lite.html');
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  let filePath = urlPath === '/' || urlPath === '' ? '/index.html' : urlPath;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log('Andy.net server running on ' + HOST + ':' + PORT);
});
