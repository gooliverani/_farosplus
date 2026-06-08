// check-parity.js — verify each EN page exposes the same main.js hooks as its -sr twin.
// Dependency-free. Run: node check-parity.js   (exit code 1 on any mismatch)
const fs = require('fs');

const PAGES = ['index', 'about', 'service', 'projects', 'contact'];

// 1. Derive the hook vocabulary straight from main.js — the single source of truth.
const js = fs.readFileSync('main.js', 'utf8');
const ids = [...js.matchAll(/getElementById\('([^']+)'\)/g)].map(m => m[1]);
const classes = [...js.matchAll(/querySelector(?:All)?\('\.([^']+)'\)/g)].map(m => m[1]);

// 2. For one HTML file, return the set of vocabulary hooks actually present.
function hooksIn(html) {
  const present = new Set();
  for (const id of ids) {
    if (new RegExp(`id="${id}"`).test(html)) present.add(`#${id}`);
  }
  for (const cls of classes) {
    // exact class token (not a hyphen-prefix): class="... cls ..."
    if (new RegExp(`class="(?:[^"]*\\s)?${cls}(?:\\s[^"]*)?"`).test(html)) present.add(`.${cls}`);
  }
  return present;
}

// 3. Diff each pair and report the symmetric difference.
let failed = false;
for (const page of PAGES) {
  const en = hooksIn(fs.readFileSync(`${page}.html`, 'utf8'));
  const sr = hooksIn(fs.readFileSync(`${page}-sr.html`, 'utf8'));
  const enOnly = [...en].filter(h => !sr.has(h));
  const srOnly = [...sr].filter(h => !en.has(h));
  if (enOnly.length || srOnly.length) {
    failed = true;
    console.error(`✗ ${page}.html ↔ ${page}-sr.html`);
    if (enOnly.length) console.error(`    only in EN: ${enOnly.join(', ')}`);
    if (srOnly.length) console.error(`    only in SR: ${srOnly.join(', ')}`);
  } else {
    console.log(`✓ ${page}  (${en.size} hooks match)`);
  }
}
process.exit(failed ? 1 : 0);
