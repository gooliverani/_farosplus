/**
 * driver.mjs — launch + drive the Faros Plus static site headlessly.
 *
 * Self-contained: starts its own static file server (Node built-ins, no
 * python/extra deps), then drives Chromium via Playwright to load every
 * page, screenshot it, and report console/page errors and failed requests
 * (e.g. a 404 favicon). Exits non-zero if any page logs a JS error.
 *
 *   node driver.mjs              # all 10 pages
 *   node driver.mjs contact.html # just one page (path relative to repo root)
 *
 * Screenshots land in ./screenshots/ next to this file.
 * Paths assume the skill lives at <repo>/.claude/skills/run-farosplus/.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const shotsDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(shotsDir, { recursive: true });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.xml': 'application/xml',
  '.txt': 'text/plain', '.ico': 'image/x-icon', '.webp': 'image/webp',
};

// --- tiny static server rooted at the repo ---
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = path.join(repoRoot, path.normalize(rel));
  if (!file.startsWith(repoRoot)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

const PAGES = [
  '/index.html', '/about.html', '/service.html', '/projects.html', '/contact.html',
  '/index-sr.html', '/about-sr.html', '/service-sr.html', '/projects-sr.html', '/contact-sr.html',
];

const only = process.argv[2];
const targets = only ? [only.startsWith('/') ? only : '/' + only] : PAGES;

const port = await new Promise((resolve) => {
  server.listen(0, '127.0.0.1', () => resolve(server.address().port));
});
const base = `http://127.0.0.1:${port}`;
console.log(`serving ${repoRoot} at ${base}\n`);

const browser = await chromium.launch();
let failed = 0;

for (const p of targets) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const badRequests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => badRequests.push(r.url()));
  page.on('response', (r) => { if (r.status() >= 400) badRequests.push(`${r.status()} ${r.url()}`); });

  const resp = await page.goto(base + p, { waitUntil: 'networkidle' });

  // The site fades elements in via IntersectionObserver, setting inline
  // opacity:0 until each scrolls into view. A fullPage screenshot would
  // capture below-the-fold sections still invisible. Inject a !important
  // rule (beats the JS's inline non-important opacity) to force every
  // fade-in element visible before shooting.
  await page.addStyleTag({ content: `
    .service-card, .service-card-img, .project-item, .project-block,
    .value-card, .about-grid, .contact-detail, .mentioned-card {
      opacity: 1 !important; transform: none !important;
    }` });
  await page.waitForTimeout(200);

  const title = await page.title();
  const name = p.replace(/^\//, '').replace(/\.html$/, '');
  const shot = path.join(shotsDir, `${name}.png`);
  await page.screenshot({ path: shot, fullPage: true });

  const status = resp.status();
  const ok = status === 200 && errors.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${p}  [${status}]  "${title}"`);
  if (errors.length) console.log('      console errors: ' + JSON.stringify(errors));
  if (badRequests.length) console.log('      failed requests: ' + JSON.stringify(badRequests));
  console.log(`      screenshot: ${path.relative(repoRoot, shot)}`);

  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${failed === 0 ? 'ALL PASS' : failed + ' FAILED'}`);
process.exit(failed === 0 ? 0 : 1);
