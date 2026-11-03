export function article(overrides = {}) {
  return {
    id: 'test-guide',
    title: 'Test guide',
    summary: 'Synthetic fixture; not game advice.',
    body: 'Test content for an expedition build.',
    category: 'expedition',
    status: 'community',
    gameVersion: 'Unknown — test fixture',
    updatedOn: '2026-11-03',
    reviewedOn: '2026-11-03',
    published: true,
    tags: ['expedition'],
    sources: [{ label: 'Test source', url: 'https://example.com/test-source' }],
    ...overrides
  };
}

export const library = (...articles) => ({ schemaVersion: 1, articles });
