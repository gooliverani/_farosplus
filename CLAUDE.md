# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static, dependency-free corporate website for **Faros Plus** (a dry-construction / interior-finishing company in Belgrade). Vanilla HTML5 + CSS3 + ES6 — no framework, no build step, no package manager, no tests. Deployed via **GitHub Pages from the `master` branch**.

## Running locally

No build. Open `index.html` directly, or serve statically:

```bash
npx serve .   # http://localhost:3000
```

There is no lint, test, or compile command. "Verifying a change" means opening the affected page(s) in a browser and exercising the interaction by hand.

## Architecture

Three shared assets back every page:
- `style.css` — single global stylesheet for the whole site.
- `main.js` — all client-side behavior, loaded on every page.
- `images/` — photos (grouped in subfolders per project) and `logo.svg`.

`main.js` is defensively structured: each feature block first checks that its DOM elements exist (`if (header)`, `if (slides.length > 0)`, etc.) before binding. This is why one shared script runs safely across pages that don't all have the same components. When adding a feature, follow this guard pattern rather than splitting per-page scripts.

Key behaviors in `main.js`, all keyed off specific element IDs/classes that the HTML must provide:
- **Header scroll** — homepage header is transparent until 40px scroll, then `.scrolled` (navy). Inner pages are detected by the presence of `.page-hero` and are always `.scrolled` so the logo stays visible over the banner.
- **Hero slider** — `.hero-slide` / `.dot` elements, auto-advances 5.5s, arrows/dots/touch-swipe.
- **Services card slider** — `#services-track`, transform-based; visible card count is responsive (1 / 2 / 3). The gap constant in `moveSvc()` (`24`) must match `gap: 24px` in the `.services-track` CSS rule.
- **Lightbox** — IIFE-scoped; opens on `.photo-thumb` clicks, grouped by parent `.project-photo-grid`, reads full-size src from each thumb's `data-src`.
- **Scroll fade-in** — `IntersectionObserver` applies inline opacity/transform to a fixed selector list of element classes.
- **Contact form** — visual feedback only, no submission. To enable real email, wire up Formspree per the comment block at the bottom of `main.js`.

## Bilingual page pairing (most important convention)

Every page exists in two language variants:
- English: `index.html`, `about.html`, `service.html`, `projects.html`, `contact.html`
- Serbian: same names with `-sr` suffix (`index-sr.html`, etc.)

The EN/SR pair share identical structure, markup, classes, and IDs — only the human-readable copy and the `lang-switch` / nav `href`s differ. **Any structural or class change to one variant must be mirrored in its `-sr` counterpart**, or `main.js`/`style.css` will behave inconsistently between languages. Treat the pair as one logical page.

## Conventions

- HTML uses descriptive section comments (e.g. `HEADER`, `HERO SLIDER`) that reference the corresponding `main.js` block. Keep these in sync when editing behavior.
- 2-space indentation across HTML, CSS, and JS.
- Fonts come from Google Fonts (Barlow / Barlow Condensed) via `<link>` in each page's `<head>`.
- Git: branch is `master`; commits go straight to it and deploy on push. Don't commit/push unless asked.
