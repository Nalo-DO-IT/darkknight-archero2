import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { buildSite } from '../scripts/build.mjs';
import { article, library } from './fixtures.mjs';

async function fixture(t, content) {
  const root = await mkdtemp(join(tmpdir(), 'darkknight-test-'));
  t.after(async () => {
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    assert.ok(basename(root).startsWith('darkknight-test-'));
    await rm(root, { recursive: true, force: true });
  });
  const contentPath = join(root, 'input.json');
  await writeFile(contentPath, JSON.stringify(content));
  return { root, contentPath, outputPath: join(root, 'darkknight') };
}

test('build publishes reviewed records, excludes drafts and raw source fields', async (t) => {
  const paths = await fixture(t, library(article({ rawTranscript: 'NEVER_PUBLISH' }), article({ id: 'draft', published: false, reviewedOn: null, body: 'SECRET_DRAFT' })));
  const result = await buildSite(paths);
  assert.equal(result.articles, 1);
  const output = await readFile(join(paths.outputPath, 'data/library.json'), 'utf8');
  assert.equal(output.includes('NEVER_PUBLISH'), false);
  assert.equal(output.includes('SECRET_DRAFT'), false);
  assert.deepEqual((await readdir(paths.outputPath)).sort(), ['.nojekyll', 'app.mjs', 'assets', 'catalog.mjs', 'crest.svg', 'data', 'guide-page.mjs', 'guide.mjs', 'guides', 'index.html', 'media.mjs', 'styles.css', 'translation.mjs', 'treasure.mjs']);
  const page = await readFile(join(paths.outputPath, 'guides/test-guide.html'), 'utf8');
  assert.match(page, /Test content for an expedition build/);
  assert.match(page, /Translation language/);
  assert.equal(page.includes('SECRET_DRAFT'), false);
  assert.equal((await readdir(join(paths.outputPath, 'guides'))).includes('draft.html'), false);
});

test('invalid input fails before overwriting existing good build', async (t) => {
  const paths = await fixture(t, library(article()));
  await buildSite(paths);
  const before = await readFile(join(paths.outputPath, 'data/library.json'), 'utf8');
  await writeFile(paths.contentPath, JSON.stringify(library(article({ sources: [] }))));
  await assert.rejects(buildSite(paths), /sources/);
  assert.equal(await readFile(join(paths.outputPath, 'data/library.json'), 'utf8'), before);
  await writeFile(paths.contentPath, '{broken json');
  await assert.rejects(buildSite(paths), SyntaxError);
});

test('real HTTP preview serves page, modules and data under GitHub project subpath', { timeout: 15000 }, async (t) => {
  const paths = await fixture(t, library(article()));
  await buildSite(paths);
  const server = spawn(process.platform === 'win32' ? 'python' : 'python3', ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', paths.root], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const exited = new Promise((resolve) => server.once('close', resolve));
  try {
    const port = await new Promise((resolve, reject) => {
      let log = '';
      const timer = setTimeout(() => reject(new Error('Preview server failed to start.')), 5000);
      server.once('error', (error) => { clearTimeout(timer); reject(error); });
      server.once('exit', () => { clearTimeout(timer); reject(new Error('Preview server exited before readiness.')); });
      server.stdout.on('data', (chunk) => {
        log += chunk.toString();
        const match = log.match(/port (\d+)/);
        if (match) { clearTimeout(timer); resolve(Number(match[1])); }
      });
    });
    const base = `http://127.0.0.1:${port}/darkknight/`;
    const response = await fetch(base);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /DarkKnight/);
    assert.match(html, /lang="en"/);
    for (const [, relative] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) {
      if (relative.startsWith('./guides/') && relative !== './guides/index.html') continue;
      const asset = await fetch(new URL(relative, base));
      assert.equal(asset.status, 200, relative);
      await asset.arrayBuffer();
    }
    const moduleResponse = await fetch(new URL('catalog.mjs', base));
    assert.equal(moduleResponse.status, 200);
    assert.match(moduleResponse.headers.get('content-type'), /javascript/);
    await moduleResponse.arrayBuffer();
    const data = await (await fetch(new URL('data/library.json', base))).json();
    assert.equal(data.articles[0].id, 'test-guide');
    const privateResponse = await fetch(new URL('.private/sources.json', base));
    assert.equal(privateResponse.status, 404);
    await privateResponse.arrayBuffer();
    const guide = await fetch(new URL('guides/test-guide.html', base));
    assert.equal(guide.status, 200);
    assert.match(await guide.text(), /Test content for an expedition build/);
    const diagram = await fetch(new URL('assets/treasure-board.svg', base));
    assert.equal(diagram.status, 200);
    await diagram.arrayBuffer();
  } finally {
    server.kill();
    await exited;
  }
});

test('unpublishing a guide removes its previously generated page', async (t) => {
  const paths = await fixture(t, library(article()));
  await buildSite(paths);
  await writeFile(paths.contentPath, JSON.stringify(library(article({ published: false, reviewedOn: null }))));
  await buildSite(paths);
  assert.deepEqual(await readdir(join(paths.outputPath, 'guides')), ['index.html']);
});
