import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGuide, renderBody, renderGuidePage, articleMarkup } from '../site/guide.mjs';
import { translationUrl } from '../site/translation.mjs';
import { treasureAdvice, HIGH_MULTIPLIER_TILES } from '../site/treasure.mjs';
import { article } from './fixtures.mjs';

test('guide parser groups steps and preserves paragraph boundaries', () => {
  const body = '## Plan\n\nFirst line\nsecond line.\n\n1. Check\n2. Roll\n\n- Watch\n- Repeat';
  assert.deepEqual(parseGuide(body), [
    { type: 'heading', text: 'Plan' }, { type: 'paragraph', text: 'First line second line.' },
    { type: 'ol', items: ['Check', 'Roll'] }, { type: 'ul', items: ['Watch', 'Repeat'] }
  ]);
});

test('article text, titles and references cannot inject markup', () => {
  const attack = '<img src=x onerror=alert(1)>';
  const record = article({ title: attack, summary: attack, body: `## ${attack}\n\n- ${attack}`, sources: [{ label: attack, url: 'https://example.com/?q=" onclick="alert(1)' }] });
  const html = renderGuidePage(record, [record]);
  assert.equal(html.includes(attack), false);
  assert.match(html, /&lt;img/);
  assert.equal(renderBody('[bad](javascript:alert(1))').includes('<a'), false);
});

test('discussion references stay behind disclosure; external tools remain visible', () => {
  const html = articleMarkup(article({ sources: [
    { label: 'Discussion', url: 'https://discord.com/channels/1/2/3' },
    { label: 'Calculator', url: 'https://example.com/tool' }
  ] }));
  assert.ok(html.indexOf('Calculator') < html.indexOf('<details>'));
  assert.ok(html.indexOf('>Discussion <') > html.indexOf('<details>'));
});

test('translation uses fully rendered guide URLs and encodes query values', () => {
  const source = 'https://nalo-do-it.github.io/darkknight-archero2/guides/example.html?x=1&y=2';
  const translated = new URL(translationUrl(source, 'es'));
  assert.equal(translated.origin, 'https://translate.google.com');
  assert.equal(translated.searchParams.get('u'), source);
  assert.equal(translated.searchParams.get('tl'), 'es');
  assert.equal(translationUrl(source, 'en'), source);
  assert.equal(new URL(translationUrl(source, 'more')).searchParams.get('tl'), 'es');
});

test('translation rejects malformed, private and credential-bearing destinations', () => {
  for (const url of ['bad', 'javascript:alert(1)', 'https://user:secret@example.com', 'http://localhost:4173', 'http://127.0.0.1:4173', 'http://[::1]:4173', 'http://192.168.0.2', 'http://10.0.0.2', 'http://172.16.0.1']) {
    assert.equal(translationUrl(url, 'es'), null, url);
  }
  assert.equal(translationUrl('https://example.com', '__proto__'), null);
});

test('treasure uses departure tiles, all other tiles recommend x1', () => {
  for (let tile = 0; tile < 24; tile++) {
    assert.equal(treasureAdvice(tile, 100).multiplier, HIGH_MULTIPLIER_TILES.includes(tile) ? 10 : 1, `tile ${tile}`);
  }
});

test('treasure caps high multipliers at every dice boundary', () => {
  for (const [dice, expected] of [[0,0],[1,1],[19,1],[20,2],[29,2],[30,3],[49,3],[50,5],[99,5],[100,10],[100000,10]]) {
    assert.equal(treasureAdvice(8, dice).multiplier, expected, `${dice} dice`);
  }
});

test('treasure rejects fractional, missing and out-of-range input', () => {
  for (const tile of [undefined, NaN, Infinity, -1, 24, 2.5, '8']) assert.throws(() => treasureAdvice(tile, 100));
  for (const dice of [undefined, NaN, Infinity, -1, 100001, 1.5, '100']) assert.throws(() => treasureAdvice(8, dice));
});
