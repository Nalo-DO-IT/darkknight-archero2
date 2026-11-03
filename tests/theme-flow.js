// Production visual usage checks; run with a connected Playwright page after build.
async (page) => {
  const base = 'http://127.0.0.1:4173/';
  let passed = 0;
  const check = (value, message) => { if (!value) throw new Error(message); passed++; };
  await page.goto(base);
  await page.locator('.featured-card').first().waitFor();
  check(await page.getByRole('img', { name: 'Alex from Archero 2', exact: true }).count() === 1, 'recognizable hero artwork');
  check(await page.getByRole('img', { name: 'Archero 2', exact: true }).count() === 1, 'game logo');
  check(await page.locator('.category-icon').count() === 6, 'game icons in all categories');
  check(await page.locator('.featured-visual').count() === 4, 'four illustrated guide covers');
  check(await page.locator('.article-card[data-category]').count() === 67, 'all articles keep category accents');
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `homepage fits ${width}px`);
    check(await page.locator('.featured-card').evaluateAll((cards) => cards.every((card) => card.scrollWidth <= card.clientWidth + 2)), `cover text fits ${width}px`);
    check(await page.locator('.hero-actions a').evaluateAll((links) => links.every((link) => { const r = link.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth; })), `hero actions usable at ${width}px`);
  }
  for (const image of await page.locator('img').all()) {
    if (!(await image.isVisible())) continue;
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((image) => image.decode());
  }
  check(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), 'all homepage images load');
  await page.getByRole('button', { name: 'Browse Gear & upgrades' }).click();
  check(await page.locator('[data-filter="equipment"]').getAttribute('aria-pressed') === 'true', 'inventory category remains functional');
  await page.goto(new URL('guides/fishing-event-playbook.html', base).href);
  check(await page.locator('link[href*="theme.css?v="]').count() === 1, 'reading pages receive versioned theme');
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `reader fits ${width}px`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base);
  await page.getByRole('link', { name: 'Enter the codex' }).hover();
  check(await page.getByRole('link', { name: 'Enter the codex' }).evaluate((link) => getComputedStyle(link).transform === 'none'), 'reduced motion respected');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  return { passed };
}
