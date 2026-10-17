// npm run preview — builds, serves dist/ at http://localhost:4600 and rebuilds when you save a file.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { build } = require('./build');
const { ROOT } = require('./render');

const PORT = Number(process.env.PORT) || 4600;
build();
let timer = null;
['emails', 'blocks'].forEach((d) => fs.watch(path.join(ROOT, d), () => { clearTimeout(timer); timer = setTimeout(() => { console.log('\nChange detected, rebuilding…'); build(); }, 200); }));
fs.watch(path.join(ROOT, 'brand.json'), () => { clearTimeout(timer); timer = setTimeout(build, 200); });

http.createServer((req, res) => {
  const p = decodeURIComponent((req.url || '/').split('?')[0]);
  const f = path.join(ROOT, 'dist', p === '/' ? 'index.html' : p);
  if (!f.startsWith(path.join(ROOT, 'dist'))) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(d);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`\nPreview: http://localhost:${PORT}  (refresh after saving)`));
