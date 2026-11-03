export const CATEGORIES = Object.freeze([
  { id: 'guides', label: 'Getting started', description: 'First steps, progression and answers worth keeping.', symbol: '01' },
  { id: 'builds', label: 'Builds & skills', description: 'Loadouts, skill choices and tested combinations.', symbol: '02' },
  { id: 'equipment', label: 'Gear & upgrades', description: 'Equipment decisions and resource planning.', symbol: '03' },
  { id: 'expedition', label: 'Guild & expedition', description: 'Shared strategy, roles and expedition notes.', symbol: '04' },
  { id: 'tips', label: 'Tips & discoveries', description: 'Small discoveries from the community.', symbol: '05' },
  { id: 'bugs', label: 'Bugs & workarounds', description: 'Reports, reproduction steps and known fixes.', symbol: '06' }
]);

export const STATUSES = Object.freeze({
  verified: 'Guild tested',
  community: 'Community report',
  outdated: 'Needs recheck'
});

function requiredText(value, name, maxLength) {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw new Error(`${name} must contain 1–${maxLength} characters.`);
  }
  return value.trim();
}

function validDate(value, name) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${name} must use YYYY-MM-DD.`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${name} must be a real date.`);
  }
  return value;
}

export function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function validateLibrary(input) {
  if (!input || input.schemaVersion !== 1 || !Array.isArray(input.articles)) {
    throw new Error('Library must have schemaVersion: 1 and an articles array.');
  }
  const ids = new Set();
  const articles = input.articles.map((article, index) => {
    const path = `articles[${index}]`;
    if (!article || typeof article !== 'object' || Array.isArray(article)) {
      throw new Error(`${path} must be an object.`);
    }
    const id = requiredText(article.id, `${path}.id`, 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) {
      throw new Error(`${path}.id must be a unique lowercase slug.`);
    }
    ids.add(id);
    if (!CATEGORIES.some(({ id: category }) => category === article.category)) {
      throw new Error(`${path}.category is unknown.`);
    }
    if (!Object.hasOwn(STATUSES, article.status)) throw new Error(`${path}.status is unknown.`);
    if (typeof article.published !== 'boolean') throw new Error(`${path}.published must be boolean.`);
    if (!Array.isArray(article.tags) || article.tags.length > 12) throw new Error(`${path}.tags must be an array of at most 12 items.`);
    if (!Array.isArray(article.sources) || article.sources.length === 0 || article.sources.length > 20) {
      throw new Error(`${path}.sources must contain 1–20 references.`);
    }
    const sources = article.sources.map((source) => {
      const url = safeSourceUrl(source?.url);
      if (!url) throw new Error(`${path}.sources require HTTPS URLs without credentials.`);
      return { label: requiredText(source.label, `${path}.source.label`, 160), url };
    });
    const reviewedOn = article.reviewedOn === null ? null : validDate(article.reviewedOn, `${path}.reviewedOn`);
    if (article.published && !reviewedOn) throw new Error(`${path} requires reviewedOn before publication.`);
    return {
      id,
      title: requiredText(article.title, `${path}.title`, 180),
      summary: requiredText(article.summary, `${path}.summary`, 600),
      body: requiredText(article.body, `${path}.body`, 30000),
      category: article.category,
      status: article.status,
      gameVersion: requiredText(article.gameVersion, `${path}.gameVersion`, 80),
      updatedOn: validDate(article.updatedOn, `${path}.updatedOn`),
      reviewedOn,
      published: article.published,
      tags: [...new Set(article.tags.map((tag) => requiredText(tag, `${path}.tag`, 50)))],
      sources
    };
  });
  return { schemaVersion: 1, articles };
}

export function publicLibrary(input) {
  const library = validateLibrary(input);
  return { ...library, articles: library.articles.filter((article) => article.published) };
}

function searchText(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function filterArticles(articles, { query = '', category = 'all', status = 'all' } = {}) {
  const terms = searchText(query).trim().split(/\s+/).filter(Boolean);
  return articles.filter((article) => {
    if (!article.published || (category !== 'all' && article.category !== category)) return false;
    if (status !== 'all' && article.status !== status) return false;
    const haystack = searchText([article.title, article.summary, article.body, ...article.tags].join(' '));
    return terms.every((term) => haystack.includes(term));
  }).sort((left, right) => right.updatedOn.localeCompare(left.updatedOn) || left.title.localeCompare(right.title));
}
