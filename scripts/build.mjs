import { mkdir, readFile, writeFile, copyFile, readdir, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { publicLibrary } from '../site/catalog.mjs';
import { PUBLIC_ASSETS } from '../site/media.mjs';
import { renderWikiHome, renderWikiIndex, renderWikiGuide, renderWikiTools } from '../site/wiki.mjs';
import { categoriesFor, validateTranslation } from '../site/wiki-i18n.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultContent = resolve(projectRoot, 'content/library.json');
const siteFiles = ['styles.css', 'theme.css', 'app.mjs', 'catalog.mjs', 'crest.svg', 'guide.mjs', 'media.mjs', 'translation.mjs', 'guide-page.mjs', 'treasure.mjs', 'wiki.css', 'wiki-client.mjs', 'wiki-i18n.mjs', 'event-client.mjs', 'event-models.mjs', 'event-copy.mjs', 'assets/fishing-plan-es.svg', 'assets/treasure-board-es.svg', ...PUBLIC_ASSETS];

async function removeStalePages(directory, expected) {
  await mkdir(directory, { recursive: true });
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && /^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(entry.name) && !expected.has(entry.name)) await unlink(resolve(directory, entry.name));
  }
}

export async function buildSite({ contentPath = defaultContent, outputPath = resolve(projectRoot, 'dist'), translationPath = contentPath === defaultContent ? resolve(projectRoot, 'content/library.es.json') : null } = {}) {
  const content = publicLibrary(JSON.parse(await readFile(contentPath, 'utf8')));
  const translated = translationPath ? validateTranslation(content, publicLibrary(JSON.parse(await readFile(translationPath, 'utf8')))) : null;
  const libraries = new Map([['en', content], ...(translated ? [['es', translated]] : [])]);
  const modules = new Map(await Promise.all(siteFiles.filter((file) => file.endsWith('.mjs')).map(async (file) => [file, await readFile(resolve(projectRoot, 'site', file), 'utf8')])));
  const styles = await Promise.all(['styles.css', 'theme.css', 'wiki.css'].map((file) => readFile(resolve(projectRoot, 'site', file), 'utf8')));
  const version = createHash('sha256').update([...modules.values(), ...styles].join('\n')).digest('hex').slice(0, 12);
  const versionResources = (html) => html.replace(/((?:src|href)=")((?:\.{1,2}\/)+[\w-]+\.(?:mjs|css))(")/g, `$1$2?v=${version}$3`);
  await mkdir(resolve(outputPath, 'data'), { recursive: true });
  for (const file of siteFiles) {
    await mkdir(dirname(resolve(outputPath, file)), { recursive: true });
    if (modules.has(file)) {
      const module = modules.get(file).replace(/(from ['"])(\.{1,2}\/[\w-]+\.mjs)(['"])/g, `$1$2?v=${version}$3`);
      await writeFile(resolve(outputPath, file), module);
    } else await copyFile(resolve(projectRoot, 'site', file), resolve(outputPath, file));
  }
  for (const [locale, library] of libraries) {
    const root = resolve(outputPath, locale === 'en' ? '.' : locale);
    const writePage = (path, html) => writeFile(resolve(root, path), versionResources(html));
    await removeStalePages(resolve(root, 'guides'), new Set(['index.html', ...library.articles.map(({ id }) => `${id}.html`)]));
    await removeStalePages(resolve(root, 'topics'), new Set(categoriesFor(locale).map(({ id }) => `${id}.html`)));
    await writePage('index.html', renderWikiHome(library.articles, locale));
    await writePage('guides/index.html', renderWikiIndex(library.articles, locale));
    await writePage('tools.html', renderWikiTools(locale));
    for (const category of categoriesFor(locale)) await writePage(`topics/${category.id}.html`, renderWikiIndex(library.articles, locale, category.id));
    for (const article of library.articles) await writePage(`guides/${article.id}.html`, renderWikiGuide(article, library.articles, locale));
    await writeFile(resolve(outputPath, `data/library${locale === 'es' ? '.es' : ''}.json`), `${JSON.stringify(library, null, 2)}\n`);
  }
  await writeFile(resolve(outputPath, '.nojekyll'), '');
  return { outputPath, articles: content.articles.length, languages: [...libraries.keys()] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await buildSite();
    console.log(`Built ${result.articles} reviewed articles (${result.languages.join(', ')}) → ${result.outputPath}`);
  } catch (error) {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
