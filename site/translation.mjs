export const LANGUAGES = Object.freeze([
  ['es', 'Español'], ['en', 'English · original'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['pt', 'Português'], ['it', 'Italiano'], ['pl', 'Polski'], ['nl', 'Nederlands'],
  ['tr', 'Türkçe'], ['uk', 'Українська'], ['ru', 'Русский'], ['ar', 'العربية'],
  ['hi', 'हिन्दी'], ['id', 'Bahasa Indonesia'], ['vi', 'Tiếng Việt'], ['th', 'ไทย'],
  ['ja', '日本語'], ['ko', '한국어'], ['zh-CN', '简体中文'], ['zh-TW', '繁體中文'],
  ['more', 'More languages…']
]);

export const SITE_URL = 'https://nalo-do-it.github.io/darkknight-archero2/';

export function translationUrl(pageUrl, language, originalUrl) {
  if (!LANGUAGES.some(([code]) => code === language)) return null;
  try {
    let url = new URL(pageUrl);
    if (url.hostname.endsWith('.translate.goog')) {
      if (!originalUrl) return null;
      url = new URL(originalUrl);
      if (url.hostname.endsWith('.translate.goog')) return null;
    }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (language === 'en') return url.href;
    if (url.hostname === 'localhost' || url.hostname === '[::1]' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)) return null;
    const translate = new URL('https://translate.google.com/translate');
    translate.search = new URLSearchParams({ sl: 'en', tl: language === 'more' ? 'es' : language, u: url.href }).toString();
    return translate.href;
  } catch { return null; }
}

export function setupTranslation(getPageUrl = () => location.href) {
  const select = document.getElementById('translate-language');
  const link = document.getElementById('translate-link');
  const note = document.getElementById('translate-note');
  if (!select || !link || !note) return;
  for (const [code, label] of LANGUAGES) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    select.append(option);
  }
  try { select.value = localStorage.getItem('darkknight-language') || 'es'; } catch { select.value = 'es'; }
  if (!select.value) select.value = 'es';
  const update = () => {
    const original = document.querySelector('meta[name="darkknight-original-url"]')?.content;
    const url = translationUrl(getPageUrl(), select.value, original);
    link.href = url ?? 'https://support.google.com/chrome/answer/173424';
    link.textContent = select.value === 'en' ? 'Read original ↗' : url ? 'Translate ↗' : 'Browser translation ↗';
    note.textContent = !url ? 'Local preview: use your browser’s Translate option.' : select.value === 'more' ? 'Choose any supported language in the translation toolbar.' : select.value === 'en' ? 'English original' : 'Opens Google Translate · game terms may vary';
    try { localStorage.setItem('darkknight-language', select.value); } catch { /* Preference storage is optional. */ }
  };
  select.addEventListener('change', update);
  update();
}
