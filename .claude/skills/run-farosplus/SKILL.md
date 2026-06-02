---
name: run-farosplus
description: Build, serve, run, preview, and screenshot the Faros Plus static website. Use when asked to run/start/serve the site, render or screenshot any page, or verify a change in a real browser. Drives all 10 pages (EN + SR) headlessly via Playwright.
---

# Run Faros Plus

Faros Plus is a **static, dependency-free** website (vanilla HTML/CSS/ES6, no build
step). The site itself has no `package.json`. The agent path here is a self-contained
Node driver — `.claude/skills/run-farosplus/driver.mjs` — that spins up its own static
file server and drives Chromium (Playwright) to load every page, screenshot it, and
report console/page errors and any failed (4xx) requests.

> Playwright lives **only inside this skill directory**, never in the site. Do not add
> it (or any dependency) to the repo root — that would break the "dependency-free" design.

All paths below are relative to the **repo root** (`<unit>/`). The driver sits at
`.claude/skills/run-farosplus/`.

## Prerequisites

- **Node.js** (verified on v22) and **npm**.
- One-time install of the driver's local dependency + the Chromium browser binary:

```powershell
cd .claude/skills/run-farosplus
npm install
npx playwright install chromium
```

`npm install` pulls `playwright@1.60.0` (pinned to match the Chromium build the driver
expects). `npx playwright install chromium` downloads the browser (~180 MB) — needed once
per machine. Both `node_modules/` and `screenshots/` are git-ignored.

## Run (agent path) — the driver

From the skill directory:

```powershell
cd .claude/skills/run-farosplus
node driver.mjs                 # all 10 pages
node driver.mjs contact.html   # a single page (name relative to repo root)
```

What it does, per page: starts a static server on `127.0.0.1:<random-port>`, opens the
page, force-reveals fade-in elements (see Gotchas), takes a **fullPage** screenshot, and
prints `PASS`/`FAIL` with the HTTP status, `<title>`, any console errors, and any failed
requests. Exit code is `0` only if every page returns 200 with zero JS errors.

Screenshots land in `.claude/skills/run-farosplus/screenshots/<page>.png` — **open them**
to confirm real rendering (the home page should show the hero, three service cards, and a
six-image projects grid). Verified output: all 10 pages PASS, exit 0.

## Run (human path)

To click around in your own browser, serve the root statically and open it:

```powershell
python -m http.server 8137 --directory .
# then visit http://localhost:8137/index.html
```

(`npx serve .` works too.) This is fine for manual checking but useless headless — for
automated verification use the driver above.

## Gotchas

- **Fade-in sections screenshot blank.** `main.js` sets inline `opacity:0` on
  `.service-card-img`, `.project-item`, `.value-card`, etc., then fades them in via
  `IntersectionObserver` when scrolled into view. A `fullPage` shot captures below-the-fold
  elements still invisible. Scrolling to trigger them is timing-fragile; the driver instead
  injects a `!important` stylesheet that force-reveals those selectors (a stylesheet
  `!important` rule beats the JS's inline non-important `opacity`). If you add a new fade-in
  class in `main.js`, add it to the force-reveal list in `driver.mjs` too.
- **Single page arg only.** `driver.mjs` reads `process.argv[2]`; extra args are ignored
  (`node driver.mjs a.html b.html` runs only `a.html`). Run without args for the full sweep.
- **Don't import Playwright from the npx cache.** ESM `import ... from 'playwright'` against
  the global npx cache fails with `ERR_MODULE_NOT_FOUND` / "named export not found" (it's
  CJS, and the cache path isn't resolvable). That's why the skill installs Playwright
  locally via `npm install`.
- **EN/SR pages are paired.** Every page has an `-sr` twin with identical structure. The
  driver tests all 10; a structural bug usually shows up on both halves of a pair.
- **`.claude/` is served by static hosts.** Cloudflare Pages/GitHub Pages deploy the whole
  repo, so these skill files would be publicly fetchable (no secrets here, just clutter).
  Harmless, but worth knowing.

## Troubleshooting

- **`browserType.launch: Executable doesn't exist ... chrome-headless-shell`** → the
  Chromium binary isn't installed for this Playwright version. Run
  `npx playwright install chromium` in the skill dir.
- **`Cannot find package 'playwright'`** when running `node driver.mjs` → you skipped
  `npm install` in `.claude/skills/run-farosplus`. Run it there (not at repo root).
- **A page reports failed requests** → check the path in the message; a 404 on
  `images/logo.svg` means the favicon/asset is missing or renamed.
