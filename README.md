# Faros Plus — Corporate Website

> **Dry Construction. Executed with Precision.**

[![Website](https://img.shields.io/badge/Live%20Site-farosplus.com-blue?style=flat-square)](https://gooliverani.github.io/_farosplus)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML-72.9%25-orange?style=flat-square)]()
[![CSS](https://img.shields.io/badge/CSS-20.1%25-blue?style=flat-square)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-7%25-yellow?style=flat-square)]()

---

## Overview

This repository contains the official corporate website for **Faros Plus**, a professional construction finishing company based in Belgrade, Serbia. The site is a fully static, bilingual (English / Serbian) multi-page website built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

## Features

- 🌐 **Bilingual** — full English (`*.html`) and Serbian (`*-sr.html`) versions of every page
- 🎠 **Hero Slider** — 5-slide full-viewport image carousel with auto-advance, arrows, dots, and touch-swipe support
- 🃏 **Services Card Slider** — responsive horizontal card track (3 / 2 / 1 columns)
- 🖼️ **Projects Portfolio** — filterable grid with hover overlays and a lightbox image viewer
- 📱 **Fully Responsive** — mobile-first design with a hamburger navigation
- 🔝 **Sticky Header** — transparent on load, navy background after 40 px scroll
- 📨 **Direct Contact** — the contact page uses a direct **email button** (`mailto:`), no form backend to maintain
- 🔍 **SEO & Social Ready** — per-page canonical + EN/SR `hreflang` tags, Open Graph cards, favicon, plus `sitemap.xml` and `robots.txt`
- ⚡ **No Dependencies** — pure HTML5, CSS3 and vanilla ES6 JavaScript

---

## Pages

| Page | English | Serbian |
|------|---------|----------|
| Home | `index.html` | `index-sr.html` |
| About Us | `about.html` | `about-sr.html` |
| Services | `service.html` | `service-sr.html` |
| Projects | `projects.html` | `projects-sr.html` |
| Contact | `contact.html` | `contact-sr.html` |

---

## Project Structure

```
_farosplus/
├── index.html            # Home page (EN)
├── index-sr.html         # Home page (SR)
├── about.html            # About Us (EN)
├── about-sr.html         # About Us (SR)
├── service.html          # Services (EN)
├── service-sr.html       # Services (SR)
├── projects.html         # Projects / Portfolio (EN)
├── projects-sr.html      # Projects / Portfolio (SR)
├── contact.html          # Contact (EN)
├── contact-sr.html       # Contact (SR)
├── style.css             # Global stylesheet
├── main.js               # All interactive behaviour
├── images/               # Project photos and logo
├── robots.txt            # Crawler directives
├── sitemap.xml           # Sitemap (all 10 pages, EN/SR paired)
├── wrangler.jsonc        # Cloudflare deployment config (static assets)
├── CLAUDE.md             # Guidance for Claude Code
└── .claude/skills/run-farosplus/   # Local preview + screenshot driver
```

---

## Services Covered

- **Soundproofing** — acoustic insulation systems for cinemas, offices and residential buildings
- **Plasterboard Installation** — metal stud framing, gypsum board partitions, suspended ceilings, fire-rated configurations
- **Renovations** — full interior fit-out from bare shell to handover
- **Painting Works** — interior & exterior, including premium decorative finishes (Oikos Travertino Romano)
- **Plaster Works** — machine and hand-applied gypsum, cement and decorative plasters

---

## Notable Projects

| Project | Scope |
|---------|-------|
| Cineplexx Beo Shopping | Cinema fit-out · for Studio M |
| Cineplexx Galerija | 20 installers · ~80% cinema works · for Studio M |
| Bosch Airport City | 2 full floors · for Studio M |
| HTEC, Milutina Milankovića | 7th & 8th floor · 16 workers · for Studio M |
| Sidek Business Premises | Drywall & decorative painting |
| Soljica Caffe | Interior fit-out & finishing |

---

## Getting Started

No build step is required. Simply clone the repository and open `index.html` in a browser:

```bash
git clone https://github.com/gooliverani/_farosplus.git
cd _farosplus
open index.html   # macOS
# or
start index.html  # Windows
```

Or serve it locally with any static file server:

```bash
npx serve .
# then visit http://localhost:3000
```

### Preview & screenshot every page (headless)

A small Playwright driver lives in `.claude/skills/run-farosplus/`. It serves the
site, loads all 10 pages (EN + SR), screenshots each, and reports any console errors —
handy for verifying a change without opening ten tabs by hand.

```bash
cd .claude/skills/run-farosplus
npm install                  # one-time
npx playwright install chromium   # one-time, downloads the browser
node driver.mjs              # all pages → ./screenshots/
node driver.mjs contact.html # a single page
```

> Playwright is dev-only tooling scoped to that folder — the website itself stays
> dependency-free.

---

## Deployment

The site deploys on **Cloudflare** (Workers with static assets) and rebuilds
automatically on every push to the `master` branch. Configuration lives in
[`wrangler.jsonc`](wrangler.jsonc) — `"assets": { "directory": "." }` serves the repo
root as-is, with no build step.

**Custom domain:** `farosplus.com` (registered at GoDaddy). DNS is being migrated to
Cloudflare nameservers; once propagated, the domain is attached to the project and SSL
is provisioned automatically.

**Contact email:** the contact page links to `office@farosplus.com`. Receiving mail at
that address is handled separately (e.g. Cloudflare Email Routing) and is independent
of the site code.

> The site was previously hosted on GitHub Pages from `master`; the markup is
> host-agnostic (all links relative), so it runs unchanged on Cloudflare.

---

## Contact

| | |
|---|---|
| 📞 Phone | [+381 63 362 778](tel:+381633627780) |
| 📧 Email | [office@farosplus.com](mailto:office@farosplus.com) |
| 📍 Address | Takovska 45, Belgrade, Serbia |
| 🏢 Reg. No | 21357308 |
| 🧾 VAT | 110507554 |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> © 2026 Faros Plus. All rights reserved.
