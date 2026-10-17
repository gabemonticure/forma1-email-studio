// npm run build — renders every emails/*.json to dist/<name>.html plus a dist/index.html gallery.
const fs = require('fs');
const path = require('path');
const { render, ROOT } = require('./render');

function build() {
  const dir = path.join(ROOT, 'emails');
  const dist = path.join(ROOT, 'dist');
  fs.mkdirSync(dist, { recursive: true });
  const list = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const name = f.replace(/\.json$/, '');
    try {
      const r = render(path.join(dir, f));
      fs.writeFileSync(path.join(dist, `${name}.html`), r.html);
      list.push({ name, subject: r.subject, kb: Math.round(Buffer.byteLength(r.html) / 1024) });
      r.warnings.forEach((w) => console.warn(`  ! ${name}: ${w}`));
      console.log(`✓ ${name}.html  (${list[list.length - 1].kb} KB)`);
    } catch (e) {
      console.error(`✗ ${name}: ${e.message}`);
      process.exitCode = 1;
    }
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  fs.writeFileSync(path.join(dist, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Forma One emails</title>
<style>body{font-family:Arial,sans-serif;background:#F7F5F2;margin:0;padding:24px;color:#16181C}h1{font-size:18px}
.row{display:flex;gap:24px;flex-wrap:wrap}.card{background:#fff;border:1px solid #E6E0D8;border-radius:10px;padding:12px}
.card a{font-weight:700;color:#0A2D6E;text-decoration:none}iframe{width:660px;height:900px;border:1px solid #E6E0D8;border-radius:6px;margin-top:8px;background:#fff}
small{color:#6B6560}</style><h1>Forma One email studio</h1><div class="row">${list.map((e) => `<div class="card"><a href="${e.name}.html" target="_blank">${esc(e.name)}</a> <small>· ${esc(e.subject)} · ${e.kb} KB</small><br><iframe src="${e.name}.html"></iframe></div>`).join('')}</div>`);
  return list;
}

if (require.main === module) build();
module.exports = { build };
