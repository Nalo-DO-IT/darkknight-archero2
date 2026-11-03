import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATEGORIES } from '../site/catalog.mjs';
import { CATEGORY_ART, FEATURED_ART, THEME_ASSETS, PUBLIC_ASSETS } from '../site/media.mjs';

test('every category and featured cover references a shipped image', async () => {
  for (const category of CATEGORIES) assert.ok(CATEGORY_ART[category.id], category.id);
  for (const path of [...Object.values(CATEGORY_ART), ...Object.values(FEATURED_ART).map(({ image }) => image)]) {
    assert.ok(PUBLIC_ASSETS.includes(path), path);
    const data = await readFile(new URL(`../site/${path}`, import.meta.url));
    assert.ok(data.length > 100, `${path} must contain image data`);
  }
});

test('game artwork is locally packaged with valid PNG data and a bounded download size', async () => {
  let totalBytes = 0;
  for (const path of THEME_ASSETS) {
    assert.match(path, /^assets\/[a-z0-9-]+\.png$/);
    const data = await readFile(new URL(`../site/${path}`, import.meta.url));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', path);
    totalBytes += data.length;
  }
  assert.ok(totalBytes < 2500000, 'decorative art should stay under 2.5 MB');
});
