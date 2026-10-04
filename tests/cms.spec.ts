import { expect, test } from '@playwright/test';
test('draft entry fails closed without valid Studio authentication', async ({
  request,
}) => {
  const response = await request.get(
    '/api/draft-mode/enable?sanity-preview-secret=invalid',
    { maxRedirects: 0 },
  );
  expect([401, 403, 503]).toContain(response.status());
  expect(response.headers()['set-cookie'] || '').not.toContain(
    '__prerender_bypass',
  );
  expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
});
for (const width of [320, 360, 430, 768, 1440]) {
  test(`gallery keyboard, focus and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prices/baby-newborn');
    const more = page.getByRole('button', { name: 'Show more photos' });
    await expect(page.locator('.gallery-open')).toHaveCount(4);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await more.focus();
    await page.keyboard.press('Enter');
    const fewer = page.getByRole('button', { name: 'Show fewer photos' });
    await expect(fewer).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('.gallery-open').count()).toBeGreaterThan(4);
    await fewer.click();
    await expect(more).toBeFocused();
    await expect(more).toBeInViewport();
    const opener = page.locator('.gallery-open').first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Close photograph' }),
    ).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[aria-live]')).toContainText('2 /');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[aria-live]')).toContainText('5 /');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });
}

test('Sanity image crops preserve aspect ratio and focal point', async () => {
  const { resolveImages } = await import('../src/content/sanity/images');
  const image = resolveImages({
    src: 'https://cdn.sanity.io/images/example/production/photo-2000x1000.jpg',
    width: 2000,
    height: 1000,
    position: { x: 75, y: 50 },
    crop: { left: 0.25, right: 0, top: 0, bottom: 0 },
  }) as {
    src: string;
    width: number;
    height: number;
    position: { x: number; y: number };
  };
  expect(new URL(image.src).searchParams.get('rect')).toBe('500,0,1500,1000');
  expect(image.width / image.height).toBe(1.5);
  expect(image.position.x).toBeCloseTo(66.667, 2);
  expect(new URL(image.src).searchParams.get('auto')).toBe('format');
});

test('CMS queries tolerate cleared optional fields and unpublished references', async () => {
  const { parse, evaluate } = await import('groq-js');
  const { homepageQuery, settingsQuery, serviceQuery } =
    await import('../src/content/sanity/queries');
  const dataset = [
    {
      _id: 'homepage',
      _type: 'homepage',
      introduction: {},
      services: {
        items: [{ _type: 'reference', _ref: 'unpublished-service' }],
      },
      testimonials: {
        items: [{ _type: 'reference', _ref: 'unpublished-quote' }],
      },
    },
    { _id: 'site-settings', _type: 'siteSettings' },
    {
      _id: 'baby-newborn',
      _type: 'photographyService',
      slug: { current: 'baby-newborn' },
      gallery: { _type: 'reference', _ref: 'gallery-baby' },
    },
    {
      _id: 'gallery-baby',
      _type: 'gallery',
      images: [{ _type: 'photograph', _key: 'upload-not-finished' }],
    },
  ];
  const home = await (await evaluate(parse(homepageQuery), { dataset })).get();
  expect(home.services.items).toEqual([]);
  expect(home.testimonials.items).toEqual([]);
  expect(home.introduction.paragraphs).toEqual([]);
  const settings = await (
    await evaluate(parse(settingsQuery), { dataset })
  ).get();
  expect(settings.navigation).toEqual([]);
  expect(settings.socials).toEqual([]);
  const service = await (
    await evaluate(parse(serviceQuery), {
      dataset,
      params: { slug: 'baby-newborn' },
    })
  ).get();
  expect(service.gallery.images).toEqual([]);
  expect(service.packages).toEqual([]);
  expect(service.testimonials).toEqual([]);
});

test('Studio only starts visual editing when server preview is configured', async () => {
  const { createStudioConfig } = await import('../sanity.config');
  const disabled = createStudioConfig(false);
  expect(
    disabled.plugins?.some(
      (plugin) =>
        Array.isArray(plugin.tools) &&
        plugin.tools.some(
          (tool) =>
            tool.name === 'presentation' && tool.title === 'Preview website',
        ),
    ),
  ).toBe(false);
  expect(
    disabled.plugins?.some((plugin) => plugin.name === 'preview-setup'),
  ).toBe(true);
  const enabled = createStudioConfig(true);
  expect(
    enabled.plugins?.some(
      (plugin) =>
        Array.isArray(plugin.tools) &&
        plugin.tools.some(
          (tool) =>
            tool.name === 'presentation' && tool.title === 'Preview website',
        ),
    ),
  ).toBe(true);
  expect(
    enabled.plugins?.some((plugin) => plugin.name === 'preview-setup'),
  ).toBe(false);
});
