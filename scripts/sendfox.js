/*
 * npm run sendfox -- <command>
 *
 *   lists                          Show your SendFox lists and their IDs
 *   draft <email> [--list <id>]    Create a SendFox campaign draft from emails/<email>.json
 *   send <campaignId>              Send a draft campaign (asks you to confirm)
 *
 * Needs a SendFox API token in .env (SENDFOX_TOKEN=...). Get it in SendFox under
 * Settings → API → Personal Access Tokens. The token never leaves your computer except to SendFox.
 *
 * Drafts are the default on purpose: review the email in SendFox (and send a test to yourself)
 * before it goes to investors.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { render, ROOT } = require('./render');

const API = 'https://api.sendfox.com';

function env() {
  const f = path.join(ROOT, '.env');
  const out = { ...process.env };
  if (fs.existsSync(f)) {
    fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && !out[m[1]]) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
  return out;
}

async function call(method, url, body) {
  const { SENDFOX_TOKEN } = env();
  if (!SENDFOX_TOKEN) throw new Error('Add SENDFOX_TOKEN to a .env file first (see .env.example).');
  const res = await fetch(API + url, {
    method,
    headers: { Authorization: `Bearer ${SENDFOX_TOKEN}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = text; }
  if (!res.ok) throw new Error(`SendFox ${method} ${url} → ${res.status}: ${typeof data === 'string' ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)}`);
  return data;
}

const ask = (q) => new Promise((r) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, (a) => { rl.close(); r(a); }); });

async function main() {
  const [cmd, arg, ...rest] = process.argv.slice(2);
  const opt = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : null; };
  const e = env();

  if (cmd === 'lists') {
    const r = await call('GET', '/lists');
    (r.data || r).forEach((l) => console.log(`${String(l.id).padEnd(10)} ${l.name}  (${l.subscribed_contacts_count ?? l.contacts_count ?? '?'} contacts)`));
    return;
  }

  if (cmd === 'draft') {
    if (!arg) throw new Error('Usage: npm run sendfox -- draft <email-name> [--list <listId>]');
    const file = path.join(ROOT, 'emails', `${arg.replace(/\.json$/, '')}.json`);
    const r = render(file);
    if (/^\s*(re|fwd?):/i.test(r.subject)) throw new Error('SendFox rejects subjects that start with RE: or FWD:.');
    const list = opt('list');
    const body = {
      title: `${arg} · ${new Date().toISOString().slice(0, 10)}`,
      subject: r.subject,
      html: r.html,
      from_name: e.FROM_NAME || 'Forma One',
      from_email: e.FROM_EMAIL || 'invest@forma1.agency',
      ...(list ? { lists: [Number(list)] } : {}),
    };
    const c = await call('POST', '/campaigns', body);
    const id = (c.data && c.data.id) || c.id;
    console.log(`\n✓ Draft created in SendFox (campaign ${id}).`);
    console.log('  Open SendFox → Emails to review it and send yourself a test.');
    if (!list) console.log('  No list attached yet: choose recipients in SendFox, or re-run with --list <id> (see: npm run sendfox -- lists).');
    return;
  }

  if (cmd === 'send') {
    if (!arg) throw new Error('Usage: npm run sendfox -- send <campaignId>');
    const ok = await ask(`Send campaign ${arg} to its list(s) now? This emails real recipients. Type SEND to confirm: `);
    if (ok.trim() !== 'SEND') return console.log('Cancelled.');
    await call('POST', `/campaigns/${encodeURIComponent(arg)}/send`);
    console.log('✓ Sent.');
    return;
  }

  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace('/*', '').replace(/^ \* ?/gm, ''));
}

main().catch((err) => { console.error('✗ ' + err.message); process.exit(1); });
