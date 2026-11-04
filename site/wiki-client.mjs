import { filterArticles, publicLibrary } from './catalog.mjs';
import { UI, localeCode } from './wiki-i18n.mjs';
import { setupTreasureTool } from './treasure.mjs';
import { translationUrl } from './translation.mjs';
import { setupEventTools } from './event-client.mjs';
import { setupSkillImages } from './skill-images-client.mjs';

const locale = localeCode(document.documentElement.lang);
const t = UI[locale];

function setupNavigation() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('wiki-sidebar');
  const backdrop = document.getElementById('menu-backdrop');
  const setMenu = (open, restore = false) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? t.close : t.menu);
    backdrop.hidden = !open;
    if (open) sidebar.querySelector('a')?.focus();
    else if (restore) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  backdrop.addEventListener('click', () => setMenu(false, true));
  document.addEventListener('keydown', (event) => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') setMenu(false, true);
    if (event.key === 'Tab') {
      const links = [...sidebar.querySelectorAll('a')];
      if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); toggle.focus(); }
      else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); toggle.focus(); }
      else if (document.activeElement === toggle) { event.preventDefault(); (event.shiftKey ? links.at(-1) : links[0]).focus(); }
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });
  for (const link of document.querySelectorAll('[data-language]')) {
    // Preserve search and section position while keeping a direct, no-JavaScript link.
    const url = new URL(link.href);
    url.search = location.search;
    url.hash = location.hash;
    link.href = url.href;
    link.addEventListener('click', () => {
      const current = new URL(link.href); current.search = location.search; current.hash = location.hash; link.href = current.href;
      try { localStorage.setItem('darkknight-language', link.dataset.language); } catch { /* Private browsing: links still work. */ }
    });
  }
  // Only remember a landing-page preference. Deep links always retain their explicit language.
  if (document.body.dataset.page === 'index.html' && locale === 'en') {
    try {
      if (localStorage.getItem('darkknight-language') === 'es') location.replace(document.querySelector('[data-language="es"]').href);
    } catch { /* Storage is optional. */ }
  }
  document.getElementById('other-language-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const original = document.querySelector('meta[name="darkknight-original-url"]').content;
    const target = translationUrl(original, document.getElementById('other-language').value, original);
    if (target) location.assign(target);
    else document.getElementById('translation-status').textContent = t.autoTranslation;
  });
}

async function setupSearch() {
  const catalog = document.querySelector('[data-catalog]');
  if (!catalog) return;
  const query = document.getElementById('wiki-search');
  const topic = document.getElementById('topic-filter');
  const status = document.getElementById('review-filter');
  const rows = [...document.querySelectorAll('.guide-row')];
  let articles = rows.map((row) => ({ id: row.dataset.id, category: row.dataset.category, status: row.dataset.status, published: true,
    title: row.querySelector('h2').textContent, summary: row.querySelector('p').textContent, body: '', tags: [], updatedOn: row.querySelector('time').dateTime }));
  const params = new URLSearchParams(location.search);
  query.value = (params.get('q') ?? '').slice(0, 200);
  if ([...topic.options].some((option) => option.value === params.get('topic'))) topic.value = params.get('topic');
  if ([...status.options].some((option) => option.value === params.get('status'))) status.value = params.get('status');
  const update = () => {
    const matches = new Set(filterArticles(articles, { query: query.value, category: topic.value, status: status.value }).map(({ id }) => id));
    for (const row of rows) row.hidden = !matches.has(row.dataset.id);
    document.getElementById('result-count').textContent = `${matches.size} ${t.results}`;
    document.getElementById('no-results').hidden = matches.size !== 0;
    const url = new URL(location.href);
    for (const [key, value] of [['q', query.value.trim()], ['topic', topic.value], ['status', status.value]]) {
      if (value && value !== 'all') url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    history.replaceState(null, '', url);
    for (const link of document.querySelectorAll('[data-language]')) {
      const target = new URL(link.href); target.search = url.search; link.href = target.href;
    }
  };
  query.addEventListener('input', update);
  topic.addEventListener('change', update);
  status.addEventListener('change', update);
  document.getElementById('wiki-search-form').addEventListener('submit', (event) => { event.preventDefault(); update(); });
  document.getElementById('reset-search').addEventListener('click', () => {
    query.value = ''; topic.value = catalog.dataset.topic; status.value = 'all'; update(); query.focus();
  });
  update();
  try {
    const response = await fetch(new URL(`./data/library${locale === 'es' ? '.es' : ''}.json`, import.meta.url), { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`Library HTTP ${response.status}`);
    const data = publicLibrary(await response.json());
    const ids = new Set(rows.map((row) => row.dataset.id));
    articles = data.articles.filter((article) => ids.has(article.id));
    update();
  } catch {
    const warning = document.getElementById('search-warning');
    warning.textContent = t.searchError; warning.hidden = false;
  }
}

setupNavigation();
setupTreasureTool(locale);
setupEventTools(locale);
setupSkillImages();
void setupSearch();
