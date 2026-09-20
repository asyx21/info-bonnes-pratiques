/* ============================================================
   Bonnes pratiques IT — slide deck (no framework)
   - Chapters listed in content/chapters.json
   - Each chapter is a Markdown file rendered into a slide
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const slidesEl = $('#slides');
const tocEl = $('#toc');
const dotsEl = $('#dots');
const deckEl = $('#deck');

let chapters = [];
let current = 0;

/* ---------- Theme (auto + toggle) ---------- */
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null(auto)
  if (saved) root.setAttribute('data-theme', saved);

  const reflect = () => {
    const mode =
      root.getAttribute('data-theme') === 'dark' ? 'dark'
      : root.getAttribute('data-theme') === 'light' ? 'light'
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-mode', mode);
  };
  reflect();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', reflect);

  document.querySelectorAll('.js-theme').forEach(btn =>
    btn.addEventListener('click', () => {
      const now = document.body.getAttribute('data-mode');
      const next = now === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      reflect();
    }));
})();

/* ---------- Load chapters ---------- */
async function load() {
  try {
    chapters = await fetch('content/chapters.json').then(r => r.json());
  } catch (e) {
    slidesEl.innerHTML = errorSlide('Impossible de charger <code>content/chapters.json</code>.');
    return;
  }

  // Fetch chapters in parallel (keep responses to read Last-Modified)
  const responses = await Promise.all(chapters.map(c => fetch(c.file).catch(() => null)));
  const bodies = await Promise.all(responses.map((r, i) =>
    r && r.ok ? r.text().then(md => marked.parse(md))
              : Promise.resolve(`<p><em>Contenu introuvable : ${chapters[i].file}</em></p>`)
  ));
  showLastUpdated(responses);

  slidesEl.innerHTML = chapters.map((c, i) =>
    `<section class="slide" id="${c.id}" data-index="${i}" aria-roledescription="slide" aria-label="${c.title}">
       <div class="slide-inner">${bodies[i]}</div>
     </section>`
  ).join('');

  tocEl.innerHTML = chapters.map((c, i) =>
    `<li><a href="#${c.id}" data-index="${i}">
       <span class="num">${String(i + 1).padStart(2, '0')}</span><span>${c.title}</span>
     </a></li>`
  ).join('');

  dotsEl.innerHTML = chapters.map((c, i) =>
    `<button data-index="${i}" aria-label="${c.title}"></button>`
  ).join('');

  wireEvents();

  // Go to hash target (or first)
  const startId = location.hash.slice(1);
  const startIdx = Math.max(0, chapters.findIndex(c => c.id === startId));
  goTo(startIdx, false);
  observe();
}

/* ---------- Navigation ---------- */
function goTo(index, updateHash = true) {
  index = Math.max(0, Math.min(chapters.length - 1, index));
  const target = slidesEl.children[index];
  if (!target) return;
  slidesEl.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  if (updateHash) history.replaceState(null, '', '#' + chapters[index].id);
  setActive(index);
  closeNav();
}

function setActive(index) {
  current = index;
  tocEl.querySelectorAll('a').forEach((a, i) =>
    a.classList.toggle('active', i === index));
  dotsEl.querySelectorAll('button').forEach((b, i) =>
    b.classList.toggle('active', i === index));
  $('#prevBtn').disabled = index === 0;
  $('#nextBtn').disabled = index === chapters.length - 1;
  $('#progressLabel').textContent = `${index + 1} / ${chapters.length} · ${chapters[index].title}`;
  const startId = location.hash.slice(1);
  if (startId !== chapters[index].id)
    history.replaceState(null, '', '#' + chapters[index].id);
}

/* Update active chapter while swiping */
function observe() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.6) {
        setActive(Number(e.target.dataset.index));
      }
    });
  }, { root: slidesEl, threshold: [0.6] });
  slidesEl.querySelectorAll('.slide').forEach(s => io.observe(s));
}

function wireEvents() {
  $('#prevBtn').addEventListener('click', () => goTo(current - 1));
  $('#nextBtn').addEventListener('click', () => goTo(current + 1));

  tocEl.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    goTo(Number(a.dataset.index));
  });

  dotsEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) goTo(Number(b.dataset.index));
  });

  // Keyboard (desktop)
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Home') goTo(0);
    if (e.key === 'End') goTo(chapters.length - 1);
    if (e.key === 'Escape') closeNav();
  });

  window.addEventListener('hashchange', () => {
    const idx = chapters.findIndex(c => c.id === location.hash.slice(1));
    if (idx >= 0 && idx !== current) goTo(idx, false);
  });

  // Mobile drawer
  $('#menuToggle').addEventListener('click', toggleNav);
  $('#backdrop').addEventListener('click', closeNav);

  // PDF export: one slide per page via the browser's print dialog
  $('#pdfBtn').addEventListener('click', () => { closeNav(); window.print(); });
  window.addEventListener('beforeprint', () => document.body.classList.add('export-mode'));
  window.addEventListener('afterprint', () => document.body.classList.remove('export-mode'));
}

/* ---------- Mobile drawer ---------- */
function toggleNav() {
  const open = document.body.classList.toggle('nav-open');
  $('#backdrop').hidden = !open;
  $('#menuToggle').setAttribute('aria-expanded', String(open));
}
function closeNav() {
  document.body.classList.remove('nav-open');
  $('#backdrop').hidden = true;
  $('#menuToggle').setAttribute('aria-expanded', 'false');
}

/* Discreet "last updated" from the most recent content file */
function showLastUpdated(responses) {
  const el = $('#updated');
  if (!el) return;
  const dates = responses
    .filter(r => r && r.ok)
    .map(r => r.headers.get('last-modified'))
    .filter(Boolean)
    .map(d => new Date(d))
    .filter(d => !isNaN(d));
  const latest = dates.length ? new Date(Math.max(...dates)) : new Date(document.lastModified);
  if (isNaN(latest)) return;
  el.textContent = 'Mis à jour le ' +
    latest.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function errorSlide(msg) {
  return `<section class="slide"><div class="slide-inner"><h1>Oups</h1><p>${msg}</p></div></section>`;
}

load();
