import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLibrary, publicLibrary, filterArticles, safeSourceUrl } from '../site/catalog.mjs';
import { article, library } from './fixtures.mjs';

test('empty library is valid without invented articles', () => {
  assert.deepEqual(publicLibrary(library()), library());
});

test('validates records and removes unknown private fields', () => {
  const result = publicLibrary(library(article({ rawAuthor: 'private', sources: [{ label: 'Source', url: 'https://example.com', rawMessage: 'private' }] })));
  assert.equal(result.articles.length, 1);
  assert.equal(JSON.stringify(result).includes('private'), false);
});

test('unpublished drafts never enter public output or search', () => {
  const draft = article({ published: false, reviewedOn: null });
  assert.deepEqual(publicLibrary(library(draft)), library());
  assert.deepEqual(filterArticles([draft]), []);
});

test('publication requires editorial review date', () => {
  assert.throws(() => validateLibrary(library(article({ reviewedOn: null }))), /reviewedOn/);
});

for (const [field, value, expected] of [
  ['id', '../unsafe', /slug/], ['id', 'Not-A-Slug', /slug/],
  ['title', '', /title/], ['summary', ' ', /summary/], ['body', null, /body/],
  ['category', 'unknown', /category/], ['status', '__proto__', /status/],
  ['published', 'true', /boolean/], ['gameVersion', '', /gameVersion/],
  ['tags', null, /tags/], ['tags', [''], /tag/], ['tags', Array(13).fill('tag'), /tags/],
  ['sources', [], /sources/], ['sources', [null], /HTTPS/],
  ['updatedOn', '2026-02-30', /real date/], ['updatedOn', 'yesterday', /YYYY-MM-DD/],
  ['reviewedOn', '2025-02-29', /real date/]
]) {
  test(`rejects invalid ${field}: ${JSON.stringify(value)}`, () => {
    assert.throws(() => validateLibrary(library(article({ [field]: value }))), expected);
  });
}

test('rejects malformed library and duplicate identifiers', () => {
  for (const invalid of [null, [], {}, { schemaVersion: 2, articles: [] }]) assert.throws(() => validateLibrary(invalid), /schemaVersion/);
  assert.throws(() => validateLibrary(library(null)), /object/);
  assert.throws(() => validateLibrary(library(article(), article())), /unique/);
});

test('only accepts credential-free HTTPS source links', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', 'https://user:secret@example.com', '//example.com', 'not a URL', undefined]) {
    assert.equal(safeSourceUrl(value), null);
    assert.throws(() => validateLibrary(library(article({ sources: [{ label: 'Unsafe', url: value }] }))), /HTTPS/);
  }
  assert.equal(safeSourceUrl('https://discord.com/channels/123/456/789'), 'https://discord.com/channels/123/456/789');
});

test('search matches all words across title, body and tags; ignores accents and case', () => {
  const record = article({ title: 'Élite setup', tags: ['BOW'] });
  assert.deepEqual(filterArticles([record], { query: ' elite BOW ' }), [record]);
  assert.deepEqual(filterArticles([record], { query: 'elite missing' }), []);
  assert.deepEqual(filterArticles([record], { query: 'expedition' }), [record]);
});

test('category and verification filters combine; newest records first; inputs unchanged', () => {
  const old = article({ id: 'old', updatedOn: '2026-10-01', status: 'verified' });
  const recent = article({ id: 'new', status: 'verified' });
  const other = article({ id: 'gear', category: 'equipment' });
  const records = [old, recent, other];
  const original = structuredClone(records);
  assert.deepEqual(filterArticles(records, { category: 'expedition', status: 'verified' }).map(({ id }) => id), ['new', 'old']);
  assert.equal(filterArticles(records, { status: 'outdated' }).length, 0);
  assert.deepEqual(records, original);
});

test('retains markup as plain content for safe DOM text rendering', () => {
  const body = '<img src=x onerror=alert(1)>';
  assert.equal(publicLibrary(library(article({ body }))).articles[0].body, body);
});
