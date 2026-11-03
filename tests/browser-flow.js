// Run this function with a Playwright page against `npm run preview`.
// Network fixtures stay in browser memory; no synthetic content is written to the site.
async (page) => {
  const base = 'http://127.0.0.1:4173/';
  const failures = [];
  const check = (condition, label) => { if (!condition) failures.push(label); };
  const entry = {
    id: 'browser-fixture',
    title: 'Expedition browser fixture',
    summary: 'Synthetic browser test, not game advice.',
    body: '<img src=x onerror=alert(1)>\n\nTesting browser text rendering.',
    category: 'expedition',
    status: 'verified',
    gameVersion: 'Test only',
    updatedOn: '2026-11-03',
    reviewedOn: '2026-11-03',
    published: true,
    tags: ['bow'],
    sources: [{ label: 'Fixture reference', url: 'https://example.com/reference' }]
  };
  const pattern = '**/data/library.json';
  const emptyLibrary = (route) => route.fulfill({ json: { schemaVersion: 1, articles: [] } });
  try {
    await page.route(pattern, emptyLibrary);
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('#article-count').textContent === '00');
    check(await page.locator('#empty-state').isVisible(), 'empty library state');
    await page.getByRole('button', { name: 'Browse Gear & upgrades' }).click();
    check(await page.locator('[data-filter="equipment"]').getAttribute('aria-pressed') === 'true', 'category navigation');
    await page.getByRole('button', { name: 'Reset filters' }).click();
    check(await page.locator('[data-filter="all"]').getAttribute('aria-pressed') === 'true', 'filter reset');

    await page.unroute(pattern);
    await page.route(pattern, (route) => route.fulfill({ json: { schemaVersion: 1, articles: [entry] } }));
    await page.reload();
    await page.getByRole('button', { name: 'Read Expedition browser fixture' }).waitFor();
    await page.getByRole('searchbox', { name: 'Search guild library' }).fill('bow expedition');
    check(await page.locator('.article-card').count() === 1, 'multiword search');
    await page.locator('#status').selectOption('community');
    check(await page.locator('#empty-title').textContent() === 'No matching discoveries yet.', 'status filter');
    await page.locator('#reset-filters').click();
    await page.getByRole('button', { name: 'Read Expedition browser fixture' }).click();
    check(await page.locator('#article-dialog').isVisible(), 'article opens');
    check(await page.locator('#article-detail img').count() === 0, 'HTML remains inert text');
    check((await page.locator('.article-body').textContent()).includes('<img'), 'plain text preserved');
    check(await page.getByRole('link', { name: 'Fixture reference' }).getAttribute('href') === 'https://example.com/reference', 'source link');
    await page.keyboard.press('Escape');
    check(!(await page.locator('#article-dialog').isVisible()), 'keyboard dismiss');

    await page.unroute(pattern);
    await page.route(pattern, (route) => route.fulfill({ status: 503, body: 'Temporary test failure' }));
    await page.reload();
    await page.locator('#load-error').waitFor();
    check(await page.locator('#empty-state').isHidden(), 'error differs from empty library');
    await page.unroute(pattern);
    await page.route(pattern, emptyLibrary);
    await page.getByRole('button', { name: 'Retry loading' }).click();
    await page.waitForFunction(() => document.querySelector('#article-count').textContent === '00');
    check(await page.locator('#load-error').isHidden(), 'retry recovers');

    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}px`);
    }
    if (failures.length) throw new Error(failures.join('; '));
    return { passed: 16, failures };
  } finally {
    await page.unroute(pattern);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base);
  }
}
