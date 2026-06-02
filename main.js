/**
 * @file        main.js
 * @project     Faros Plus — Corporate Website
 * @description All client-side behaviour: sticky header, hero slider,
 *              services card slider, lightbox gallery, scroll fade-in
 *              animations, and back-to-top button.
 * @version     1.0.0
 */

/* ====== HEADER SCROLL ======
   Homepage     : transparent until 40 px scroll, then adds .scrolled (navy bg).
   Inner pages  : always .scrolled — .page-hero exists only on about / service /
                  projects / contact, so the logo stays visible over the banner.
   --------------------------------------------------------------- */
const header = document.getElementById('site-header');
if (header) {
  const isInnerPage = !!document.querySelector('.page-hero'); // .page-hero only exists on inner pages
  const updateHeader = () => {
    if (isInnerPage) {
      header.classList.add('scrolled');
    } else {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // run immediately on load — inner pages must not flash transparent
}

/* ====== MOBILE NAV TOGGLE ======
   Toggles the .open class on <nav> when the hamburger button is clicked.
   A document-level click listener closes the menu when tapping outside.
   On mobile (≤768px) the nav overlays the full screen with centered links.
   --------------------------------------------------------------- */
const navToggle = document.getElementById('nav-toggle');
const mainNav   = document.getElementById('main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    if (header) header.classList.toggle('nav-open', mainNav.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if (header && !header.contains(e.target)) {
      mainNav.classList.remove('open');
      header.classList.remove('nav-open');
    }
  });
}

/* ====== HERO SLIDER ======
   Auto-advances every 5.5 s. Supports:
     — Prev / Next arrow buttons
     — Dot indicator clicks
     — Touch swipe (threshold: 50 px horizontal delta)
   The auto-play timer resets on every manual interaction.
   --------------------------------------------------------------- */
const slides    = document.querySelectorAll('.hero-slide');
const dots      = document.querySelectorAll('.dot');
const heroPrev  = document.getElementById('hero-prev');
const heroNext  = document.getElementById('hero-next');
let current     = 0;
let heroTimer;

/** Activate the slide at [index] and sync the dot indicators. */
function showSlide(index) {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i)  => d.classList.toggle('active', i === index));
  current = index;
}

function nextSlide() {
  showSlide((current + 1) % slides.length);
}
function prevSlide() {
  showSlide((current - 1 + slides.length) % slides.length);
}

/** Start auto-play. Always stops first to prevent duplicate timers. */
function startAuto() {
  stopAuto();
  heroTimer = setInterval(nextSlide, 5500);
}
function stopAuto() { clearInterval(heroTimer); }

if (slides.length > 0) {
  if (heroNext) heroNext.addEventListener('click', () => { nextSlide(); startAuto(); });
  if (heroPrev) heroPrev.addEventListener('click', () => { prevSlide(); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startAuto(); }));

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    let touchStartX = 0;
    heroEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { // ignore accidental short swipes
        diff > 0 ? nextSlide() : prevSlide();
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
}

/* ====== SERVICES CARD SLIDER ======
   Horizontal card carousel driven by CSS transform translateX.
   Visible card count is responsive:
     ≤480px  → 1 card  |  ≤1024px → 2 cards  |  desktop → 3 cards
   Prev/Next buttons are disabled at track boundaries.
   --------------------------------------------------------------- */
const track    = document.getElementById('services-track');
const svcPrev  = document.getElementById('svc-prev');
const svcNext  = document.getElementById('svc-next');

if (track && svcPrev && svcNext) {
  let svcIndex = 0;

  /** Returns how many cards fit in the viewport at the current width. */
  function getSvcVisible() {
    if (window.innerWidth <= 480)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getSvcTotal() { return track.children.length; }

  /** Disable arrow buttons at the start/end of the track to prevent empty scroll. */
  function updateSvcButtons() {
    const visible = getSvcVisible();
    svcPrev.disabled = svcIndex === 0;
    svcNext.disabled = svcIndex >= getSvcTotal() - visible;
  }

  /** Shift the track by (card width + gap) × current index via translateX. */
  function moveSvc() {
    const card = track.children[0];
    const gap  = 24; // must match gap: 24px in .services-track CSS rule
    const w    = card.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(-${svcIndex * w}px)`;
    updateSvcButtons();
  }

  svcNext.addEventListener('click', () => {
    const visible = getSvcVisible();
    if (svcIndex < getSvcTotal() - visible) { svcIndex++; moveSvc(); }
  });
  svcPrev.addEventListener('click', () => {
    if (svcIndex > 0) { svcIndex--; moveSvc(); }
  });

  window.addEventListener('resize', () => { svcIndex = 0; moveSvc(); }, { passive: true });
  updateSvcButtons();
}

/* ====== LIGHTBOX ======
   Full-screen image viewer for project photo grids.
   Images are grouped by their parent .project-photo-grid container.
   Supports: close button, arrows, keyboard (Esc / ← / →),
             backdrop click, and touch swipe (≥40 px delta).
   Wrapped in an IIFE to keep all lightbox variables out of global scope.
   --------------------------------------------------------------- */
(function () {
  const lightbox  = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg     = document.getElementById('lb-img');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');

  let lbImages = []; // src strings for all images in the currently open group
  let lbIndex  = 0;  // index of the image currently displayed

  function openLightbox(thumbs, index) {
    lbImages = Array.from(thumbs).map(t => t.dataset.src);
    lbIndex  = index;
    showLbImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showLbImage() {
    lbImg.src = lbImages[lbIndex];
    lbImg.alt = '';
    if (lbCounter) lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
    if (lbPrev) lbPrev.style.display = lbImages.length > 1 ? '' : 'none';
    if (lbNext) lbNext.style.display = lbImages.length > 1 ? '' : 'none';
  }

  function lbShowNext() {
    lbIndex = (lbIndex + 1) % lbImages.length;
    showLbImage();
  }
  function lbShowPrev() {
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    showLbImage();
  }

  // Open on thumbnail click — group by data-group within same .project-photo-grid
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('.photo-thumb');
    if (!thumb) return;
    const grid   = thumb.closest('.project-photo-grid');
    const thumbs = grid ? grid.querySelectorAll('.photo-thumb') : [thumb];
    const idx    = Array.from(thumbs).indexOf(thumb);
    openLightbox(thumbs, idx < 0 ? 0 : idx);
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbShowPrev(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbShowNext(); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  lbShowNext();
    if (e.key === 'ArrowLeft')   lbShowPrev();
  });

  // Touch swipe in lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', (e) => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? lbShowNext() : lbShowPrev();
  }, { passive: true });
})();

/* ====== BACK TO TOP ======
   Button fades in after the user scrolls past 400 px.
   Click smoothly scrolls the page back to the top.
   --------------------------------------------------------------- */
const btt = document.getElementById('back-to-top');
if (btt) {
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btt.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ====== SCROLL FADE-IN ======
   Elements listed below fade up into view as they enter the viewport.
   Uses IntersectionObserver (10 % threshold) — no scroll event polling.
   Each element is unobserved after animating to free resources.
   Falls back gracefully when IntersectionObserver is unavailable.
   --------------------------------------------------------------- */
const fadeEls = document.querySelectorAll(
  '.service-card, .service-card-img, .project-item, .project-block, .value-card, .about-grid, .contact-detail, .mentioned-card'
);
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target); // stop watching once animation has played
      }
    });
  }, { threshold: 0.10 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });
}
