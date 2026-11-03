import { CATEGORIES, STATUSES, publicLibrary, filterArticles } from './catalog.mjs';
import { articleMarkup, readMinutes } from './guide.mjs';
import { setupTranslation } from './translation.mjs';
import { setupTreasureTool } from './treasure.mjs';
import { CATEGORY_ART, FEATURED_ART } from './media.mjs';

const element = (id) => document.getElementById(id);
const state = { articles: [], category: 'all', loaded: false };
const dialog = element('article-dialog');

function node(tag, text, className) {
  const result = document.createElement(tag);
  if (text !== undefined) result.textContent = text;
  if (className) result.className = className;
  return result;
}

function categoryLabel(id) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

function selectCategory(category) {
  state.category = category;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });
  if (state.loaded) renderArticles();
}

function renderCategories() {
  const cards = CATEGORIES.map((category) => {
    const button = node('button', undefined, 'category-card');
    button.type = 'button';
    button.setAttribute('aria-label', `Browse ${category.label}`);
    const icon = node('img', undefined, 'category-icon');
    icon.src = `./${CATEGORY_ART[category.id]}`;
    icon.alt = '';
    icon.loading = 'lazy';
    const count = state.articles.filter((article) => article.category === category.id).length;
    button.append(icon, node('span', `PATH ${category.symbol}`, 'category-number'), node('span', '↗', 'category-arrow'), node('h3', category.label), node('p', category.description), node('span', state.loaded ? `${count} ${count === 1 ? 'article' : 'articles'}` : 'Awaiting library', 'category-total'));
    button.addEventListener('click', () => {
      selectCategory(category.id);
      element('library').scrollIntoView({ block: 'start' });
      element('search').focus({ preventScroll: true });
    });
    return button;
  });
  element('category-grid').replaceChildren(...cards);
}

function renderFilters() {
  const filters = [{ id: 'all', label: 'All knowledge' }, ...CATEGORIES];
  element('category-filters').replaceChildren(...filters.map((category) => {
    const button = node('button', category.label, 'filter');
    button.type = 'button';
    button.dataset.filter = category.id;
    button.setAttribute('aria-pressed', String(category.id === state.category));
    button.addEventListener('click', () => selectCategory(category.id));
    return button;
  }));
}

function openArticle(article) {
  const detail = element('article-detail');
  // Only our renderer creates markup; every imported string is escaped.
  detail.innerHTML = articleMarkup(article);
  const actions = node('div', undefined, 'guide-actions');
  const fullPage = node('a', 'Full guide / translate ↗', 'button secondary');
  fullPage.href = `./guides/${article.id}.html`;
  actions.append(fullPage);
  detail.prepend(actions);
  dialog.showModal();
  dialog.scrollTop = 0;
}

function renderFeatured() {
  const featured = [
    ['treasure-island-x10-tile-guide', 'EVENT PLAYBOOK', 'assets/treasure-board.svg'],
    ['fishing-event-playbook', 'FISHING STRATEGY', 'assets/fishing-lake1-3.png'],
    ['beginner-gear-plan-november-2026', 'BUILD YOUR FOUNDATION', 'crest.svg'],
    ['farming-quick-hunt-hm5-ch47-2025', 'SPEND ENERGY WISELY', 'assets/farming-comparison.png']
  ];
  element('featured-grid').replaceChildren(...featured.flatMap(([id, label, image]) => {
    const article = state.articles.find((item) => item.id === id);
    if (!article) return [];
    const card = node('a', undefined, 'featured-card');
    card.href = `./guides/${id}.html`;
    const art = FEATURED_ART[id];
    card.dataset.theme = art?.theme ?? 'gear';
    const visual = node('div', undefined, 'featured-visual');
    const picture = node('img');
    picture.src = `./${art?.image ?? image}`;
    picture.alt = '';
    picture.loading = 'lazy';
    const copy = node('div', undefined, 'featured-copy');
    copy.append(node('span', label, 'eyebrow'), node('h3', article.title), node('p', article.summary), node('span', `${readMinutes(article)} min read · Open guide →`, 'featured-read'));
    visual.append(picture, node('span', art?.label ?? label, 'cover-label'));
    card.append(visual, copy);
    return [card];
  }));
  element('featured').hidden = element('featured-grid').childElementCount === 0;
}

function renderArticles() {
  const results = filterArticles(state.articles, { query: element('search').value, category: state.category, status: element('status').value });
  const cards = results.map((article) => {
    const button = node('button', undefined, 'article-card');
    button.type = 'button';
    button.setAttribute('aria-label', `Read ${article.title}`);
    button.dataset.category = article.category;
    button.append(node('span', STATUSES[article.status], `badge ${article.status}`), node('h3', article.title), node('p', article.summary), node('span', `${categoryLabel(article.category)} · ${article.updatedOn}`, 'card-meta'));
    button.addEventListener('click', () => openArticle(article));
    return button;
  });
  element('article-grid').replaceChildren(...cards);
  element('article-grid').hidden = results.length === 0;
  element('empty-state').hidden = results.length > 0;
  const isEmptyLibrary = state.articles.length === 0;
  element('empty-title').textContent = isEmptyLibrary ? 'Every codex starts with a discovery.' : 'No matching discoveries yet.';
  element('empty-description').textContent = isEmptyLibrary ? 'Our first guides are waiting for their sources. Share a useful post and help build the DarkKnight library.' : 'Try a different search or reset your category and review filters.';
  element('empty-link').hidden = !isEmptyLibrary;
  element('result-count').textContent = `${results.length} ${results.length === 1 ? 'article' : 'articles'}${isEmptyLibrary ? ' · Awaiting first sourced contribution' : ' · Latest updates first'}`;
}

async function loadLibrary() {
  state.loaded = false;
  element('load-error').hidden = true;
  element('empty-state').hidden = true;
  element('article-grid').hidden = true;
  element('article-grid').setAttribute('aria-busy', 'true');
  element('retry').disabled = true;
  element('result-count').textContent = 'Loading library…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(new URL('./data/library.json', import.meta.url), { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error(`Library request failed (${response.status}).`);
    state.articles = publicLibrary(await response.json()).articles;
    state.loaded = true;
    element('article-count').textContent = String(state.articles.length).padStart(2, '0');
    element('verified-count').textContent = String(state.articles.filter((article) => article.status === 'verified').length).padStart(2, '0');
    renderCategories();
    renderArticles();
    renderFeatured();
    element('reference-count').textContent = String(new Set(state.articles.flatMap((article) => article.sources.map(({ url }) => url))).size);
  } catch {
    element('load-error').hidden = false;
    element('result-count').textContent = 'Could not load the library.';
    element('article-count').textContent = '—';
    element('verified-count').textContent = '—';
  } finally {
    clearTimeout(timeout);
    element('article-grid').setAttribute('aria-busy', 'false');
    element('retry').disabled = false;
  }
}

element('search-form').addEventListener('submit', (event) => event.preventDefault());
element('search').addEventListener('input', () => { if (state.loaded) renderArticles(); });
element('status').addEventListener('change', () => { if (state.loaded) renderArticles(); });
element('reset-filters').addEventListener('click', () => {
  element('search').value = '';
  element('status').value = 'all';
  selectCategory('all');
});
element('close-article').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
element('retry').addEventListener('click', loadLibrary);
renderFilters();
renderCategories();
setupTranslation(() => new URL('./guides/index.html', location.href).href);
setupTreasureTool();
void loadLibrary();
