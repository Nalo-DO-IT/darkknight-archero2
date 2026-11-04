import { escapeHtml as e, parseGuide, readMinutes } from './guide.mjs';
import { GUIDE_MEDIA, CATEGORY_ART, FEATURED_ART } from './media.mjs';
import { UI, categoriesFor, statusesFor, localizedPath } from './wiki-i18n.mjs';
import { SITE_URL, LANGUAGES } from './translation.mjs';
import { renderEventTools } from './event-view.mjs';
import { EVENT_COPY } from './event-copy.mjs';
import { COMBAT_GUIDES, combatCopy, renderCombatVisual } from './combat-guides.mjs';

const FEATURED = Object.keys(FEATURED_ART);
const MEDIA_ES = {
  'assets/fishing-plan.svg': ['Plan de pesca: elige una ruta, comprueba el evento y registra las capturas.', 'Planifica la ruta y registra por separado los bancos normales y especiales.'],
  'assets/fishing-lake1-1.png': ['Lakehouse, caña final: primer ejemplo de tensión inicial.', 'Ejemplo 1 · Comparación histórica de tensión con la caña final de Lakehouse.'],
  'assets/fishing-lake1-2.png': ['Lakehouse, caña final: segundo ejemplo de tensión inicial.', 'Ejemplo 2 · Mismo lago y caña. Compara la tensión inicial.'],
  'assets/fishing-lake1-3.png': ['Lakehouse, caña final: pequeño segmento amarillo de tensión inicial.', 'Ejemplo 3 · No apliques estos umbrales a otra caña ni a otro lago.'],
  'assets/treasure-board.svg': ['Mapa de casillas de salida: 8, 9, 20, 21 y 22 usan el multiplicador alto del modelo.', 'Modelo de referencia con numeración desde cero. Lee tu casilla ACTUAL antes de tirar. La casilla 0 es la salida; comprueba el tablero del evento.'],
  'assets/farming-comparison.png': ['Tabla histórica: capítulo 47 frente a caza rápida, con 145 de energía al día durante 30 días.', 'Octubre de 2025: 1740 frente a 1066 piezas; 1679 frente a 1066 runas. La diferencia impresa de runas es 612, aunque la resta da 613. Los tiempos no representan todo el tiempo de juego mensual.'],
  'assets/farming-full-table.png': ['Cálculos históricos de HM5, capítulo 47 y caza rápida para 145 y 165 de energía.', 'Requiere los talentos registrados de obtención de objetos. Mantén separados los escenarios de 145 y 165 de energía. Los resultados actuales no están verificados.']
};

function context(locale, path) {
  const fullPath = localizedPath(locale, path);
  const prefix = '../'.repeat(fullPath.split('/').length - 1) || './';
  return { locale, path, prefix, t: UI[locale], categories: categoriesFor(locale), statuses: statusesFor(locale),
    url: (target, language = locale) => `${prefix}${localizedPath(language, target)}`,
    asset: (target) => `${prefix}${target}` };
}
function badge(article, c) { return `<span class="badge ${article.status}">${e(c.statuses[article.status])}</span>`; }
function navLink(c, path, label, icon = '', active = false) {
  return `<a href="${c.url(path)}"${active ? ' aria-current="page"' : ''}>${icon}<span>${e(label)}</span></a>`;
}
function breadcrumbs(c, items) {
  return `<nav class="breadcrumbs" aria-label="${c.locale === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}"><ol><li><a href="${c.url('index.html')}">${c.t.home}</a></li>${items.map(({ label, path }) => `<li>${path ? `<a href="${c.url(path)}">${e(label)}</a>` : `<span aria-current="page">${e(label)}</span>`}</li>`).join('')}</ol></nav>`;
}
function shell(c, title, description, body, { category, crumbs = [] } = {}) {
  const { t } = c;
  const canonical = new URL(localizedPath(c.locale, c.path), SITE_URL).href;
  const nav = `${navLink(c, 'index.html', t.home, '<span class="nav-symbol">⌂</span>', c.path === 'index.html')}${navLink(c, 'guides/index.html', t.all, '<span class="nav-symbol">▤</span>', c.path === 'guides/index.html')}<p class="nav-label">${t.topics}</p>${c.categories.map((item) => navLink(c, `topics/${item.id}.html`, item.label, `<img src="${c.asset(CATEGORY_ART[item.id])}" alt="" width="28" height="28">`, category === item.id)).join('')}<p class="nav-label">${t.shortcuts}</p>${navLink(c, 'guides/fishing-event-playbook.html', t.fishing, '<span class="nav-symbol">≈</span>', c.path === 'guides/fishing-event-playbook.html')}${navLink(c, 'guides/treasure-island-x10-tile-guide.html', t.treasure, '<span class="nav-symbol">⚄</span>', c.path === 'guides/treasure-island-x10-tile-guide.html')}${navLink(c, 'tools.html', t.tools, '<span class="nav-symbol">◇</span>', c.path === 'tools.html')}`;
  return `<!doctype html><html lang="${c.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${e(description)}"><meta name="theme-color" content="#151620"><meta name="darkknight-original-url" content="${e(new URL(c.path, SITE_URL).href)}"><title>${e(title)} · DarkKnight Wiki</title><link rel="canonical" href="${canonical}">${['en', 'es'].map((lang) => `<link rel="alternate" hreflang="${lang}" href="${new URL(localizedPath(lang, c.path), SITE_URL).href}">`).join('')}<link rel="icon" href="${c.asset('crest.svg')}"><link rel="stylesheet" href="${c.asset('wiki.css')}"><script type="module" src="${c.asset('wiki-client.mjs')}"></script></head><body data-page="${e(c.path)}">
  <a class="skip-link" href="#main">${t.skip}</a><header class="wiki-header"><button class="menu-button" id="menu-toggle" aria-expanded="false" aria-controls="wiki-sidebar" aria-label="${t.menu}" type="button">☰</button><a class="brand" href="${c.url('index.html')}"><img src="${c.asset('crest.svg')}" alt="" width="34" height="40"><span>DarkKnight<small>ARCHERO 2 WIKI</small></span></a><form class="header-search" action="${c.url('guides/index.html')}" role="search"><label class="sr-only" for="global-search">${t.search}</label><span aria-hidden="true">⌕</span><input id="global-search" name="q" type="search" placeholder="${t.searchHint}" maxlength="200"><button aria-label="${t.search}" type="submit">↵</button></form><nav class="language-switch" aria-label="${t.language}">${[['en', 'English'], ['es', 'Español']].map(([lang, label]) => `<a data-language="${lang}" href="${c.url(c.path, lang)}" lang="${lang}" hreflang="${lang}"${c.locale === lang ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav></header>
  <div class="wiki-layout"><aside class="wiki-sidebar" id="wiki-sidebar"><nav aria-label="${t.navigation}">${nav}</nav><div class="sidebar-foot"><img src="${c.asset('assets/archero-logo.png')}" alt="Archero 2" width="110" height="60"><span>DARKKNIGHT GUILD</span></div></aside><button class="menu-backdrop" id="menu-backdrop" aria-label="${t.close}" hidden></button><div class="page-column"><main id="main" tabindex="-1">${breadcrumbs(c, crumbs)}${body}</main><footer><p>${t.footer}</p><a href="#main">${t.top} ↑</a><details class="more-languages"><summary>${t.moreLanguages}</summary><p>${t.autoTranslation}</p><form id="other-language-form"><label class="sr-only" for="other-language">${t.language}</label><select id="other-language">${LANGUAGES.filter(([lang]) => !['en', 'es', 'more'].includes(lang)).map(([lang, label]) => `<option value="${lang}">${label}</option>`).join('')}</select><button type="submit">${t.translate} ↗</button></form><p id="translation-status" role="status"></p></details></footer></div></div></body></html>`;
}
function row(article, c) {
  const category = c.categories.find(({ id }) => id === article.category);
  return `<li class="guide-row" data-id="${article.id}" data-category="${article.category}" data-status="${article.status}"><a href="${c.url(`guides/${article.id}.html`)}"><div class="row-copy"><span class="row-topic">${e(category.label)}</span><h2>${e(article.title)}</h2><p>${e(article.summary)}</p></div><div class="row-meta">${badge(article, c)}<span>${readMinutes(article)} ${c.t.minutes}</span><time datetime="${article.updatedOn}">${article.updatedOn}</time></div><span class="row-arrow" aria-hidden="true">↗</span></a></li>`;
}
function topicCards(articles, c) {
  return `<div class="topic-grid">${c.categories.map((category) => `<a class="topic-card" href="${c.url(`topics/${category.id}.html`)}"><img src="${c.asset(CATEGORY_ART[category.id])}" alt="" width="54" height="54" loading="lazy"><div><h3>${e(category.label)}</h3><p>${e(category.description)}</p><span>${articles.filter((a) => a.category === category.id).length} ${c.t.guides} <b aria-hidden="true">→</b></span></div></a>`).join('')}</div>`;
}
function legend(c) {
  return `<aside class="review-note"><strong>${c.t.legendTitle}</strong><p>${c.t.legendText}</p><div>${Object.entries(c.statuses).map(([id, label]) => `<span class="badge ${id}">${label}</span>`).join('')}</div></aside>`;
}
export function renderWikiHome(articles, locale = 'en') {
  const c = context(locale, 'index.html'); const { t } = c;
  const featured = FEATURED.map((id) => articles.find((article) => article.id === id)).filter(Boolean);
  const cards = featured.map((article) => `<a class="feature-card ${FEATURED_ART[article.id].theme}" href="${c.url(`guides/${article.id}.html`)}"><div class="feature-art"><img src="${c.asset(FEATURED_ART[article.id].image)}" alt="" loading="lazy"></div><div class="feature-copy"><span class="row-topic">${e(c.categories.find(({ id }) => id === article.category).label)}</span><h3>${e(article.title)}</h3><span>${readMinutes(article)} ${t.minutes} <b aria-hidden="true">→</b></span></div></a>`).join('');
  const body = `<section class="wiki-hero"><div><p class="eyebrow">DARKKNIGHT · ARCHERO 2</p><h1>${t.intro}</h1><p>${t.introText}</p><a class="button" href="${c.url('guides/index.html')}">${t.browse} <span aria-hidden="true">→</span></a></div><img class="hero-character" src="${c.asset('assets/hero-alex.png')}" alt="Alex · Archero 2" width="506" height="856" fetchpriority="high"></section><div class="wiki-stats"><span><strong>${articles.length}</strong> ${t.guides}</span><span><strong>${c.categories.length}</strong> ${t.topics.toLowerCase()}</span><span><strong>EN / ES</strong> ${t.languages}</span></div><section class="wiki-section"><div class="section-title"><h2>${t.topics}</h2><span>01 — 06</span></div>${topicCards(articles, c)}</section><section class="wiki-section"><div class="section-title"><div><h2>${t.featured}</h2><p>${t.featuredText}</p></div><a href="${c.url('guides/index.html')}">${t.all} →</a></div><div class="featured-grid">${cards}</div></section><a class="start-banner" href="${c.url('topics/guides.html')}"><img src="${c.asset('assets/gear-crossbow.png')}" width="68" height="68" alt=""><div><h2>${t.start}</h2><p>${t.startText}</p></div><strong>${t.startAction} →</strong></a>${legend(c)}`;
  const practical = articles.filter(({ id }) => ['gems-spending-plan','upgrade-priority-roadmap','build-planner-by-mode','daily-weekly-progression-checklist','event-spending-decision-guide'].includes(id));
  const ec = EVENT_COPY[locale];
  const plan = `<section class="wiki-section"><div class="section-title"><div><h2>${ec.progressTitle}</h2><p>${ec.practical}</p></div></div><div class="practical-grid">${practical.map((article,index)=>`<a href="${c.url(`guides/${article.id}.html`)}"><span>0${index+1}</span><h3>${e(article.title)}</h3><b aria-hidden="true">→</b></a>`).join('')}</div><a class="simulator-cta" href="${c.url('tools.html')}"><span aria-hidden="true">⚄ ≈</span><strong>${ec.toolsCta}</strong><span aria-hidden="true">→</span></a></section>`;
  const combat=COMBAT_GUIDES.map(id=>articles.find(article=>article.id===id)).filter(Boolean);
  const cc=combatCopy(locale);
  const combatSection=combat.length?`<section class="wiki-section combat-hub"><div class="section-title"><div><h2>${cc.hub}</h2><p>${cc.hubText}</p></div></div><ul class="guide-list">${combat.map(article=>row(article,c)).join('')}</ul></section>`:'';
  return shell(c, t.home, t.introText, body.replace('<section class="wiki-section">', `${plan}${combatSection}<section class="wiki-section">`));
}
export function renderWikiIndex(articles, locale = 'en', categoryId = null) {
  const c = context(locale, categoryId ? `topics/${categoryId}.html` : 'guides/index.html');
  const category = c.categories.find(({ id }) => id === categoryId); const { t } = c;
  const list = articles.filter((article) => !categoryId || article.category === categoryId).sort((a, b) => b.updatedOn.localeCompare(a.updatedOn) || a.title.localeCompare(b.title, locale));
  const title = category?.label ?? t.all; const description = category?.description ?? t.indexIntro;
  const body = `<header class="page-heading"><p class="eyebrow">DARKKNIGHT WIKI</p><h1>${e(title)}</h1><p>${e(description)}</p></header><section class="catalog" data-catalog data-topic="${categoryId ?? 'all'}"><form id="wiki-search-form" class="catalog-controls" role="search"><label class="catalog-search"><span class="sr-only">${t.search}</span><input id="wiki-search" name="q" type="search" placeholder="${t.searchHint}" maxlength="200"></label><label><span class="sr-only">${t.topics}</span><select id="topic-filter" name="topic">${categoryId ? '' : `<option value="all">${t.allTopics}</option>`}${c.categories.filter((item) => !categoryId || item.id === categoryId).map((item) => `<option value="${item.id}">${e(item.label)}</option>`).join('')}</select></label><label><span class="sr-only">${t.status}</span><select id="review-filter" name="status"><option value="all">${t.allStatuses}</option>${Object.entries(c.statuses).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select></label><button type="button" id="reset-search">${t.reset}</button></form><p class="result-count" id="result-count" role="status">${list.length} ${t.results}</p><p id="search-warning" class="notice" role="status" hidden></p><ul class="guide-list" id="guide-list">${list.map((article) => row(article, c)).join('')}</ul><div class="empty-state" id="no-results" hidden><h2>${t.empty}</h2><p>${t.emptyText}</p></div></section>${legend(c)}`;
  return shell(c, title, description, body, { category: categoryId, crumbs: [{ label: title }] });
}
function guideBody(article) {
  let index = 0;
  return parseGuide(article.body).map((block) => {
    if (block.type === 'heading') return `<h2 id="section-${++index}">${e(block.text)}</h2>`;
    if (block.type === 'paragraph') return `<p>${e(block.text)}</p>`;
    return `<${block.type}>${block.items.map((item) => `<li>${e(item)}</li>`).join('')}</${block.type}>`;
  }).join('\n');
}
export function renderWikiGuide(article, articles, locale = 'en') {
  const c = context(locale, `guides/${article.id}.html`); const { t } = c;
  const category = c.categories.find(({ id }) => id === article.category);
  const headings = parseGuide(article.body).filter(({ type }) => type === 'heading');
  const combat=renderCombatVisual(article.id,locale);
  const toc = `<aside class="contents"><details open><summary>${t.contents}</summary><nav aria-label="${t.contents}">${combat?`<a href="#combat-plan">${combatCopy(locale).title}</a>`:''}${headings.map(({ text }, index) => `<a href="#section-${index + 1}">${e(text)}</a>`).join('')}<a href="#references">${t.sources}</a><a href="#related">${t.related}</a></nav></details></aside>`;
  const media = (GUIDE_MEDIA[article.id] ?? []).map((item) => {
    const [alt, caption] = locale === 'es' ? MEDIA_ES[item.path] : [item.alt, item.caption];
    const path = locale === 'es' && item.path.endsWith('.svg') ? item.path.replace('.svg', '-es.svg') : item.path;
    return `<figure class="guide-figure${item.portrait ? ' portrait' : ''}"><a href="${c.asset(path)}" target="_blank" rel="noopener"><img src="${c.asset(path)}" alt="${e(alt)}" loading="lazy"></a><figcaption>${e(caption)}${locale === 'es' && !item.path.endsWith('.svg') ? ` ${t.screenshot}` : ''}</figcaption></figure>`;
  });
  const external = article.sources.filter(({ url }) => new URL(url).hostname !== 'discord.com');
  const discussions = article.sources.filter(({ url }) => new URL(url).hostname === 'discord.com');
  const source = (item) => `<li><a href="${e(item.url)}" target="_blank" rel="noopener noreferrer">${e(item.label)} ↗</a></li>`;
  const related = articles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 3);
  const body = `<div class="reader-layout"><article class="wiki-article"><header class="article-heading">${badge(article, c)}<h1>${e(article.title)}</h1><p class="article-summary">${e(article.summary)}</p><div class="article-meta"><span>${readMinutes(article)} ${t.minutes}</span><span>${t.updated} <time datetime="${article.updatedOn}">${article.updatedOn}</time></span></div></header><p class="evidence-note ${article.status}">${article.status === 'outdated' ? t.outdatedNote : t.communityNote}</p><div class="mobile-contents"></div><div class="article-body">${guideBody(article)}</div>${media.length ? `<div class="guide-media">${media.join('')}</div>` : ''}<section class="references" id="references"><h2>${t.sources}</h2>${external.length ? `<ul>${external.map(source).join('')}</ul>` : ''}${discussions.length ? `<details><summary>${t.discussions} (${discussions.length})</summary><p>${t.membership}</p><ul>${discussions.map(source).join('')}</ul></details>` : ''}<p class="review-meta">${t.version}: ${e(article.gameVersion)}<br>${t.reviewed}: ${article.reviewedOn}</p></section><section class="related" id="related"><h2>${t.related}</h2>${related.map((item) => `<a href="${c.url(`guides/${item.id}.html`)}">${e(item.title)} <span aria-hidden="true">→</span></a>`).join('')}<a class="back-topic" href="${c.url(`topics/${article.category}.html`)}">← ${t.backTopic}: ${e(category.label)}</a></section></article>${toc}</div>`;
  const eventAnchor = article.id === 'treasure-island-x10-tile-guide' ? 'treasure-simulator' : article.id === 'fishing-event-playbook' ? 'fishing-planner' : null;
  const eventLink = eventAnchor ? `<a class="simulator-cta" href="${c.url('tools.html')}#${eventAnchor}">${EVENT_COPY[locale][eventAnchor === 'treasure-simulator' ? 'estimateLink' : 'fishingLink']} →</a>` : '';
  const html=shell(c, article.title, article.summary, body.replace('<div class="article-body">', `${eventLink}${combat}<div class="article-body">`), { category: article.category, crumbs: [{ label: category.label, path: `topics/${article.category}.html` }, { label: article.title }] });
  return combat?html.replace('</head>',`<link rel="stylesheet" href="${c.asset('combat.css')}"></head>`):html;
}
export function renderWikiTools(locale = 'en') {
  const c = context(locale, 'tools.html'); const { t } = c;
  const body = `<header class="page-heading"><p class="eyebrow">DARKKNIGHT WIKI</p><h1>${t.tools}</h1><p>${t.toolsIntro}</p></header><div class="tools-grid"><section class="tool-panel"><span class="badge outdated">${t.model}</span><h2>${t.multiplier}</h2><p>${t.tileHelp}</p><form id="treasure-form"><label for="current-tile">${t.tile}<input id="current-tile" type="number" min="0" max="23" step="1" value="8" required></label><label for="held-dice">${t.dice}<input id="held-dice" type="number" min="0" max="100000" step="1" value="100" required></label><button class="button" type="submit">${t.check} →</button></form><output id="roll-advice" aria-live="polite"></output><p class="tool-caveat">${t.toolCaveat}</p><a href="${c.url('guides/treasure-island-x10-tile-guide.html')}">${t.map} →</a></section><section class="tool-links"><h2>${t.external}</h2><a href="https://ksun4176.github.io/archero2-dice-companion/" target="_blank" rel="noopener noreferrer"><img src="${c.asset('assets/gold.png')}" width="48" height="48" alt=""><div><h3>Dice Companion ↗</h3><p>${t.diceText}</p></div></a><a href="https://jgdevalpha.github.io/archero-fish-companion/" target="_blank" rel="noopener noreferrer"><span class="tool-symbol" aria-hidden="true">≈</span><div><h3>Fishing Companion ↗</h3><p>${t.fishText}</p></div></a><a href="${c.url('guides/fishing-event-playbook.html')}"><span class="tool-symbol" aria-hidden="true">↗</span><div><h3>${t.fishing}</h3><p>${t.fishText}</p></div></a></section></div>`;
  const content = body.replace('<div class="tools-grid">', `${renderEventTools(locale,c.prefix)}<details class="quick-tools"><summary>${t.multiplier} · ${t.external}</summary><div class="tools-grid">`) + '</details>';
  return shell(c, t.tools, t.toolsIntro, content, { crumbs: [{ label: t.tools }] }).replace('</head>', `<link rel="stylesheet" href="${c.asset('island.css')}"></head>`);
}
