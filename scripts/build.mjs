import { mkdir, readFile, writeFile, copyFile, readdir, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { publicLibrary } from '../site/catalog.mjs';
import { escapeHtml, pageShell, renderGuidePage } from '../site/guide.mjs';
import { PUBLIC_ASSETS } from '../site/media.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteFiles = ['index.html', 'styles.css', 'app.mjs', 'catalog.mjs', 'crest.svg', 'guide.mjs', 'media.mjs', 'translation.mjs', 'guide-page.mjs', 'treasure.mjs', ...PUBLIC_ASSETS];

export async function buildSite({ contentPath = resolve(projectRoot, 'content/library.json'), outputPath = resolve(projectRoot, 'dist') } = {}) {
  // Validate before changing any existing build output. Only explicitly named assets are copied.
  const content = publicLibrary(JSON.parse(await readFile(contentPath, 'utf8')));
  await mkdir(resolve(outputPath, 'data'), { recursive: true });
  for (const file of siteFiles) {
    await mkdir(dirname(resolve(outputPath, file)), { recursive: true });
    await copyFile(resolve(projectRoot, 'site', file), resolve(outputPath, file));
  }
  await mkdir(resolve(outputPath, 'guides'), { recursive: true });
  const expectedPages = new Set(['index.html', ...content.articles.map(({ id }) => `${id}.html`)]);
  for (const entry of await readdir(resolve(outputPath, 'guides'), { withFileTypes: true })) {
    if (entry.isFile() && /^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(entry.name) && !expectedPages.has(entry.name)) {
      await unlink(resolve(outputPath, 'guides', entry.name));
    }
  }
  for (const article of content.articles) {
    await writeFile(resolve(outputPath, 'guides', `${article.id}.html`), renderGuidePage(article, content.articles));
  }
  const index = `<p class="eyebrow">DARKKNIGHT FIELD GUIDES</p><h1 class="reading-title">Find your next advantage.</h1><p class="guide-summary">Practical guides, strategies and references. Choose a language above to translate this index and its guide pages.</p><div class="reading-index">${content.articles.map((article) => `<a href="./${article.id}.html"><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.summary)}</p></a>`).join('')}</div>`;
  await writeFile(resolve(outputPath, 'guides/index.html'), pageShell('All guides', index));
  await writeFile(resolve(outputPath, 'data/library.json'), `${JSON.stringify(content, null, 2)}\n`);
  await writeFile(resolve(outputPath, '.nojekyll'), '');
  return { outputPath, articles: content.articles.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await buildSite();
    console.log(`Built ${result.articles} reviewed articles → ${result.outputPath}`);
  } catch (error) {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
