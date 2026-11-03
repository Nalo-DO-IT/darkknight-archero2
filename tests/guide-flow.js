// Run through the connected Playwright browser after building the production library.
async (page) => {
  const base = 'http://127.0.0.1:4173/';
  let passed = 0;
  const check = (condition, label) => { if (!condition) throw new Error(label); passed++; };
  await page.goto(base);
  await page.locator('.article-card').first().waitFor();
  check(await page.locator('.article-card').count() === 67, '67 published guides');
  check(await page.locator('.featured-card').count() === 4, 'four featured guides');
  await page.locator('#current-tile').fill('8');
  await page.locator('#held-dice').fill('100');
  check((await page.locator('#roll-advice').textContent()).includes('×10'), 'high tile recommends x10');
  await page.locator('#held-dice').fill('99');
  check((await page.locator('#roll-advice').textContent()).includes('×5'), 'held dice cap applies');
  await page.locator('#current-tile').fill('7');
  check((await page.locator('#roll-advice').textContent()).includes('×1'), 'other tiles stay x1');
  await page.locator('#current-tile').fill('');
  check(await page.locator('#roll-advice').getAttribute('data-state') === 'error', 'empty tile rejected');
  await page.locator('#current-tile').fill('24');
  check(await page.locator('#roll-advice').getAttribute('data-state') === 'error', 'invalid tile rejected');
  await page.locator('#current-tile').fill('8');
  await page.locator('#held-dice').fill('0');
  check((await page.locator('#roll-advice').textContent()).includes('No dice'), 'zero dice handled');
  await page.locator('#search').fill('x10');
  check(await page.locator('.article-card').count() > 0, 'x10 search works');
  await page.getByRole('button', { name: 'Read Treasure Island: when to roll ×1 or ×10', exact: true }).click();
  check(await page.locator('.article-body h3').count() > 3, 'guide has readable sections');
  await page.getByRole('link', { name: 'Full guide / translate' }).click();
  check(page.url().endsWith('/guides/treasure-island-x10-tile-guide.html'), 'stable guide URL');
  check(await page.locator('h1').count() === 1, 'full guide heading');
  await page.locator('#translate-language').selectOption('more');
  check((await page.locator('#translate-note').textContent()).includes('Local preview'), 'local translation fallback');
  await page.goto(new URL('guides/fishing-event-playbook.html', base).href);
  check((await page.locator('.article-body').textContent()).includes('prioritize golden tickets'), 'fishing routes present');
  const images = page.locator('.guide-figure img');
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (img) => { if (!img.complete) await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }); });
  }
  check(await images.evaluateAll((images) => images.length === 4 && images.every((image) => image.naturalWidth > 0)), 'fishing diagram and screenshots load');
  check(await page.getByRole('link', { name: /Fishing Companion/ }).count() >= 1, 'fishing tool reference');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `guide fits ${width}px`);
    await page.goto(base);
    await page.locator('.featured-card').first().waitFor();
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `homepage fits ${width}px`);
    await page.goto(new URL('guides/fishing-event-playbook.html', base).href);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  return { passed };
}
