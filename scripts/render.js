// Turns an email JSON file (a list of blocks) into finished, email-safe HTML.
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const mjml2html = require('mjml');

const ROOT = path.join(__dirname, '..');
const brand = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'brand.json'), 'utf8'));

function compile() {
  const hb = Handlebars.create();
  // Stats bands with 4 KPIs use smaller numbers so values like 'On budget' stay on one line
  hb.registerHelper('statSize', (items) => (Array.isArray(items) && items.length > 3 ? '22px' : '30px'));
  hb.registerPartial('layout', fs.readFileSync(path.join(ROOT, 'blocks', 'layout.hbs'), 'utf8'));
  return hb.compile(fs.readFileSync(path.join(ROOT, 'blocks', 'blocks.hbs'), 'utf8'), { strict: false });
}

/** @returns {{ subject: string, preheader: string, html: string, warnings: string[] }} */
function render(emailFile) {
  const email = JSON.parse(fs.readFileSync(emailFile, 'utf8'));
  const known = ['topbar', 'hero', 'intro', 'stats', 'spotlight', 'gallery', 'quote', 'progress', 'cta', 'divider', 'footer'];
  const unknown = (email.blocks || []).filter((b) => !known.includes(b.type)).map((b) => b.type);
  if (unknown.length) throw new Error(`${path.basename(emailFile)}: unknown block type(s): ${unknown.join(', ')}`);
  const mjml = compile()({ ...email, brand: brand() });
  const out = mjml2html(mjml, { validationLevel: 'soft', keepComments: false, filePath: ROOT });
  return {
    subject: email.subject || '',
    preheader: email.preheader || '',
    html: out.html,
    warnings: (out.errors || []).map((e) => e.formattedMessage || e.message),
  };
}

module.exports = { render, ROOT };
