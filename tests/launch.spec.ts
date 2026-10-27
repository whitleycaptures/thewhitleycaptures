import { expect, test } from '@playwright/test';
import mapping from '../src/content/legacy-urls.json' with { type: 'json' };
import { portfolioTabs } from '../src/content/navigation';
const production = process.env.TEST_PRODUCTION === '1';
test('legacy URLs return direct permanent redirects or intentional gone responses', async ({
  request,
}) => {
  for (const [from, to] of Object.entries(mapping.redirects)) {
    const r = await request.get(from, { maxRedirects: 0 });
    expect(r.status()).toBe(301);
    expect(
      new URL(r.headers().location, r.url()).pathname +
        new URL(r.headers().location, r.url()).hash,
    ).toBe(to);
  }
  for (const [slug, tab] of Object.entries(portfolioTabs))
    for (const value of [slug, tab]) {
      const r = await request.get(`/portfolio?tab=${value}&utm_source=test`, {
        maxRedirects: 0,
      });
      expect(r.status()).toBe(301);
      const u = new URL(r.headers().location, r.url());
      expect(u.pathname + u.hash).toBe(`/prices/${slug}#gallery`);
      expect(u.searchParams.get('utm_source')).toBe('test');
      expect(u.searchParams.has('tab')).toBe(false);
    }
  const capitalised = await request.get('/Portfolio?tab=baby', {
    maxRedirects: 0,
  });
  expect(capitalised.status()).toBe(301);
  expect(
    new URL(capitalised.headers().location, capitalised.url()).pathname,
  ).toBe('/prices/baby-newborn');
  for (const path of [
    ...mapping.retired,
    ...['corporate', 'landscape', 'mini-shoots'].map(
      (t) => `/portfolio?tab=${t}`,
    ),
  ]) {
    const r = await request.get(path, { maxRedirects: 0 });
    expect(r.status()).toBe(410);
    expect(await r.text()).toContain('Contact Rachel');
  }
  expect((await request.get('/unknown-old-url')).status()).toBe(404);
});
test('masonry uses natural images and responsive columns; signature has balanced spacing', async ({
  page,
}) => {
  for (const [width, columns] of [
    [390, '1'],
    [768, '2'],
    [1440, '3'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prices/baby-newborn');
    const gallery = page.locator('.service-gallery .gallery');
    await expect(gallery).toHaveCSS('column-count', columns);
    await expect(gallery.locator('figure').first()).toHaveCSS(
      'break-inside',
      'avoid',
    );
    await expect(gallery.locator('img').first()).toHaveAttribute(
      'loading',
      'lazy',
    );
    // A lazy image must reserve space even before its bytes have arrived.
    const bounds = await gallery.locator('.gallery-open').first().boundingBox();
    expect(bounds?.height).toBeGreaterThan(100);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto('/');
  await expect(page.locator('.signature')).toHaveCSS('margin-top', '32px');
  await expect(page.locator('.signature')).toHaveCSS('margin-bottom', '32px');
});
test('privacy and indexing match the deployment mode', async ({ request }) => {
  const r = await request.get('/privacy-policy');
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain('Services used by this website');
  if (production) {
    expect(r.headers()['x-robots-tag'] || '').not.toContain('noindex');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(
      'https://www.thewhitleycaptures.com/privacy-policy',
    );
    expect(await (await request.get('/robots.txt')).text()).not.toContain(
      'Disallow: /',
    );
  } else {
    expect(r.headers()['x-robots-tag']).toBe('noindex, nofollow');
    expect((await request.get('/sitemap.xml')).status()).toBe(404);
  }
});
