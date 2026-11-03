import { CATEGORIES, STATUSES, safeSourceUrl } from './catalog.mjs';
import { GUIDE_MEDIA } from './media.mjs';
import { SITE_URL } from './translation.mjs';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

// A deliberately small text format: headings, paragraphs, ordered/unordered lists.
// Imported markup and Markdown links never become executable HTML.
export function parseGuide(body) {
  const blocks = [];
  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { blocks.push({ type: 'break' }); continue; }
    const heading = line.match(/^##\s+(.+)$/);
    const list = line.match(/^(-|\d+\.)\s+(.+)$/);
    if (heading) blocks.push({ type: 'heading', text: heading[1] });
    else if (list) {
      const type = list[1] === '-' ? 'ul' : 'ol';
      const previous = blocks.at(-1);
      if (previous?.type === type) previous.items.push(list[2]);
      else blocks.push({ type, items: [list[2]] });
    } else {
      const previous = blocks.at(-1);
      if (previous?.type === 'paragraph') previous.text += ` ${line}`;
      else blocks.push({ type: 'paragraph', text: line });
    }
  }
  return blocks.filter((block) => block.type !== 'break');
}

export function renderBody(body) {
  return parseGuide(body).map((block) => {
    if (block.type === 'heading') return `<h3>${escapeHtml(block.text)}</h3>`;
    if (block.type === 'paragraph') return `<p>${escapeHtml(block.text)}</p>`;
    return `<${block.type}>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${block.type}>`;
  }).join('\n');
}

export function readMinutes(article) {
  return Math.max(1, Math.ceil(article.body.split(/\s+/).length / 200));
}

export function articleMarkup(article, prefix = './') {
  const category = CATEGORIES.find(({ id }) => id === article.category)?.label ?? article.category;
  const sourceLink = (source) => `<a href="${escapeHtml(safeSourceUrl(source.url) ?? '#')}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} <span aria-hidden="true">↗</span></a>`;
  const discussions = article.sources.filter(({ url }) => new URL(url).hostname === 'discord.com');
  const references = article.sources.filter(({ url }) => new URL(url).hostname !== 'discord.com');
  const media = GUIDE_MEDIA[article.id] ?? [];
  const figure = (media) => `<figure class="guide-figure${media.portrait ? ' portrait' : ''}"><a href="${prefix}${media.path}" target="_blank" rel="noopener"><img src="${prefix}${media.path}" alt="${escapeHtml(media.alt)}" loading="lazy"></a><figcaption>${escapeHtml(media.caption)}</figcaption></figure>`;
  const diagrams = media.filter(({ path }) => path.endsWith('.svg')).map(figure).join('');
  const evidence = media.filter(({ path }) => !path.endsWith('.svg')).map(figure).join('');
  return `<span class="badge ${article.status}">${STATUSES[article.status]}</span>
    <h2 id="article-title">${escapeHtml(article.title)}</h2>
    <p class="detail-meta">${escapeHtml(category)} · ${readMinutes(article)} min read · Updated ${article.updatedOn}</p>
    <p class="guide-summary">${escapeHtml(article.summary)}</p>
    ${diagrams}
    <div class="article-body">${renderBody(article.body)}</div>
    ${evidence ? `<div class="guide-media">${evidence}</div>` : ''}
    <div class="source-list"><h3>Links &amp; references</h3>${references.map(sourceLink).join('')}
      ${discussions.length ? `<details><summary>Discussion references (${discussions.length})</summary><p class="detail-meta">Discord links may require server membership.</p>${discussions.map(sourceLink).join('')}</details>` : ''}
    </div>
    <p class="detail-meta guide-review">Game version: ${escapeHtml(article.gameVersion)} · Content reviewed ${article.reviewedOn}</p>`;
}

export function pageShell(title, content, prefix = '../', originalPath = 'guides/index.html') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#17152c"><meta name="darkknight-original-url" content="${escapeHtml(new URL(originalPath, SITE_URL).href)}"><title>${escapeHtml(title)} · DarkKnight</title><link rel="icon" href="${prefix}crest.svg"><link rel="stylesheet" href="${prefix}styles.css"><link rel="stylesheet" href="${prefix}theme.css"><script type="module" src="${prefix}guide-page.mjs"></script></head><body>
  <header class="header shell"><a class="brand notranslate" translate="no" href="${prefix}index.html"><img src="${prefix}crest.svg" width="37" height="42" alt=""><span>DarkKnight<small>ARCHERO 2 · FIELD GUIDES</small></span></a><nav aria-label="Main navigation"><a href="${prefix}index.html#library">Library</a><a href="./index.html">All guides</a></nav></header>
  <main class="reading-shell"><div class="reader-tools"><a class="text-link" href="${prefix}index.html#library">← Back to library</a>${translationControls()}</div>${content}</main>
  <footer class="footer shell"><p>DarkKnight · Unofficial Archero 2 guild library.</p><a href="#">Back to top ↑</a></footer></body></html>`;
}

export function translationControls() {
  return `<div class="translation-controls"><label class="sr-only" for="translate-language">Translation language</label><select id="translate-language" aria-label="Translation language"></select><a id="translate-link" class="text-link" target="_blank" rel="noopener noreferrer">Translate ↗</a><span id="translate-note" class="translation-note" role="status">Automatic translation</span></div>`;
}

export function renderGuidePage(article, articles) {
  const related = articles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 3);
  const relatedHtml = related.length ? `<aside class="related-guides"><h2>Keep exploring</h2>${related.map((item) => `<a href="./${item.id}.html">${escapeHtml(item.title)} →</a>`).join('')}</aside>` : '';
  const html = articleMarkup(article, '../').replace('<h2 id="article-title">', '<h1 id="article-title">').replace('</h2>', '</h1>');
  return pageShell(article.title, `<article class="full-guide">${html}</article>${relatedHtml}`, '../', `guides/${article.id}.html`);
}
