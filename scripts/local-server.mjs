import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContactRequest } from '../api/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const port = Number(process.env.PORT || 3000);

await loadEnv(path.join(root, '.env.local'));
await loadEnv(path.join(root, '.env'));

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

async function loadEnv(file) {
  try {
    const content = await fs.readFile(file, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const raw = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = raw.replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (_) {}
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = path.normalize(decoded).replace(/^\.\.(\/|\\|$)/, '');
  return clean === '/' ? '/index.html' : clean;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/contact') {
      const body = await collectBody(req);
      const headers = { ...req.headers, 'x-real-ip': req.socket.remoteAddress || '127.0.0.1' };
      const result = await handleContactRequest({
        method: req.method,
        headers,
        body
      });
      for (const [key, value] of Object.entries(result.headers || {})) res.setHeader(key, value);
      res.statusCode = result.status;
      res.end(result.body);
      return;
    }

    let filePath = path.join(distDir, safePath(url.pathname));
    let data;
    try {
      data = await fs.readFile(filePath);
    } catch (_) {
      filePath = path.join(distDir, 'index.html');
      data = await fs.readFile(filePath);
    }

    const ext = path.extname(filePath);
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.end(data);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`\nABS Law Office local server running at http://localhost:${port}`);
  console.log('Form endpoint: http://localhost:' + port + '/api/contact');
  console.log('Gunakan npm run local supaya frontend + API berjalan bersamaan.\n');
});
