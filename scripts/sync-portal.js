// npm run sync-portal — copies the templates, blocks and brand into the F1 Portal's Cloud
// Functions (../syndicate-pro/functions/email-studio) so the portal renders identical emails.
// Run it after changing anything here, then deploy the portal's functions.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DEST = path.join(ROOT, '..', 'syndicate-pro', 'functions', 'email-studio');
for (const d of ['blocks', 'emails']) {
  fs.mkdirSync(path.join(DEST, d), { recursive: true });
  for (const f of fs.readdirSync(path.join(DEST, d))) fs.unlinkSync(path.join(DEST, d, f));
  for (const f of fs.readdirSync(path.join(ROOT, d))) fs.copyFileSync(path.join(ROOT, d, f), path.join(DEST, d, f));
}
fs.copyFileSync(path.join(ROOT, 'brand.json'), path.join(DEST, 'brand.json'));
console.log('Synced to', DEST);
