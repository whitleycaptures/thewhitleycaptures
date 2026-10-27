import { test, expect } from '@playwright/test';
import { canonicalResponse } from '../src/lib/canonical';
import { legacyResponse } from '../src/lib/legacy';

test('canonical redirects combine legacy paths and preserve methods and useful queries', () => {
  for (const origin of [
    'http://thewhitleycaptures.com',
    'http://www.thewhitleycaptures.com',
    'https://thewhitleycaptures.com',
  ]) {
    for (const method of ['GET', 'HEAD', 'POST']) {
      const request = new Request(
        `${origin}/prices/maternity?utm_source=example`,
        { method },
      );
      const response = canonicalResponse(request, true);
      expect(response?.status).toBe(method === 'POST' ? 308 : 301);
      expect(response?.headers.get('Location')).toBe(
        'https://www.thewhitleycaptures.com/prices/maternity?utm_source=example',
      );
    }
    const request = new Request(
      `${origin}/blog?6315db0d_page=2&utm_source=example`,
    );
    const response = canonicalResponse(
      request,
      true,
      legacyResponse(request, true),
    );
    expect(response?.headers.get('Location')).toBe(
      'https://www.thewhitleycaptures.com/client-guides?utm_source=example',
    );
  }
  expect(
    canonicalResponse(new Request('http://localhost:3012/'), true),
  ).toBeNull();
  expect(
    canonicalResponse(new Request('http://www.thewhitleycaptures.com/'), false),
  ).toBeNull();
  expect(
    canonicalResponse(new Request('https://www.thewhitleycaptures.com/'), true),
  ).toBeNull();
});

test('obsolete guide pagination redirects but unrelated parameters do not', async ({
  request,
}) => {
  const response = await request.get(
    '/client-guides?6315db0d_page=3&utm_source=example',
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(301);
  const target = new URL(response.headers().location, response.url());
  expect(target.pathname).toBe('/client-guides');
  expect(target.search).toBe('?utm_source=example');
  expect(
    legacyResponse(
      new Request(
        'https://www.thewhitleycaptures.com/client-guides?utm_source=example',
      ),
      true,
    ),
  ).toBeNull();
});

test('all published pages deliver canonical metadata in their initial head', async ({
  request,
}) => {
  test.skip(process.env.TEST_PRODUCTION !== '1', 'Production sitemap required');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls).toHaveLength(15);
  for (const url of urls) {
    const response = await request.get(new URL(url).pathname);
    expect(response.status(), url).toBe(200);
    expect(response.headers()['x-robots-tag'] || '', url).not.toContain(
      'noindex',
    );
    const html = await response.text();
    const head = html.split('</head>')[0];
    const canonicals = [
      ...head.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g),
    ];
    expect(canonicals, url).toHaveLength(1);
    expect(new URL(canonicals[0][1]).href).toBe(new URL(url).href);
    expect(head).toMatch(/name="robots" content="index, follow"/);
    const title = head.match(/<title>(.*?)<\/title>/)?.[1] || '';
    expect(title.match(/The Whitley Captures/g), url).toHaveLength(1);
  }
});

test('production Sanity photographs offer responsive sizes and retain image semantics', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/prices/baby-newborn');
  const photo = page.locator('.service-hero-photo img');
  test.skip(
    !(await photo.getAttribute('src'))?.includes('cdn.sanity.io'),
    'Sanity content required',
  );
  await expect(photo).toHaveAttribute('srcset', /640w/);
  await expect(photo).toHaveAttribute('sizes', /100vw/);
  await expect(photo).toHaveAttribute('loading', 'eager');
  await expect(photo).toHaveAttribute('fetchpriority', 'high');
  await expect(photo).toHaveAttribute('alt', /.+/);
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  const width = await photo.evaluate((img: HTMLImageElement) =>
    Number(new URL(img.currentSrc).searchParams.get('w')),
  );
  expect(width).toBeLessThan(2000);
  await expect(page.locator('.service-gallery img').first()).toHaveAttribute(
    'loading',
    'lazy',
  );
});
