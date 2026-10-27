import { expect, test } from '@playwright/test';
import articles from '../src/content/local/articles.json' with { type: 'json' };
import sources from '../docs/review-source-articles.json' with { type: 'json' };
import { services } from '../src/content/local/services';
import { portfolioHref } from '../src/content/navigation';

test('migrated guides retain every source image and meaningful text', () => {
  for (const article of articles) {
    const source = sources.find((s) => s.id === article.id)!;
    const imageIds = (a: typeof article) =>
      a.blocks.flatMap((b) =>
        'images' in b ? b.images?.map((i) => i.id) || [] : [],
      );
    expect(imageIds(article)).toEqual(imageIds(source));
    expect(article.blocks.filter((b) => b.kind !== 'gallery').length).toBe(
      source.blocks.filter((b) => b.kind !== 'gallery').length,
    );
  }
});
test('hero rotates, supports manual controls and pauses for focus', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const region = page.getByRole('region', { name: 'Featured photography' });
  const first = region.getByRole('button', { name: /Show photograph 1:/ });
  const second = region.getByRole('button', { name: /Show photograph 2:/ });
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(second).toHaveAttribute('aria-pressed', 'true', {
    timeout: 10000,
  });
  await first.focus();
  await page.waitForTimeout(6500);
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await first.click();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(
    region.getByRole('button', { name: 'Play slideshow' }),
  ).toBeVisible();
});
test('reduced motion keeps the hero still with manual access', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const r = page.getByRole('region', { name: 'Featured photography' });
  await page.waitForTimeout(6500);
  await expect(
    r.getByRole('button', { name: /Show photograph 1:/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(r.getByRole('button', { name: 'Pause slideshow' })).toHaveCount(
    0,
  );
  await r.getByRole('button', { name: /Show photograph 3:/ }).click();
  await expect(
    r.getByRole('button', { name: /Show photograph 3:/ }),
  ).toHaveAttribute('aria-pressed', 'true');
});
test('prices precede compact galleries and services link within the page', async ({
  page,
}) => {
  for (const s of services) {
    await page.goto(`/prices/${s.slug}`);
    await expect(page.locator('.service-story')).toHaveCount(0);
    const count = Number(
      (await page.locator('.gallery-count').innerText()).match(/\d+/)?.[0],
    );
    await expect(page.locator('.service-gallery .gallery-open')).toHaveCount(
      Math.min(6, count),
    );
    const more = page.getByRole('button', { name: 'Show more photos' });
    if (count > 6) {
      const firstSix = await page
        .locator('.service-gallery .gallery-open')
        .evaluateAll((buttons) =>
          buttons.map((button) => button.getAttribute('aria-label')),
        );
      await more.click();
      await expect(page.locator('.service-gallery .gallery-open')).toHaveCount(
        count,
      );
      expect(
        (
          await page
            .locator('.service-gallery .gallery-open')
            .evaluateAll((buttons) =>
              buttons.map((button) => button.getAttribute('aria-label')),
            )
        ).slice(0, 6),
      ).toEqual(firstSix);
      await page.getByRole('button', { name: 'Show fewer photos' }).click();
      await expect(page.locator('.service-gallery .gallery-open')).toHaveCount(
        6,
      );
      await expect(more).toBeInViewport();
      await expect(more).toBeFocused();
    } else {
      await expect(more).toHaveCount(0);
    }
    expect(count).toBeGreaterThan(0);
    await expect(page.locator('.portfolio-cta')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'View portfolio', exact: false }),
    ).toHaveAttribute('href', '#gallery');
    expect(
      await page
        .locator('#prices')
        .evaluate((el) =>
          Boolean(
            el.compareDocumentPosition(
              document.querySelector('.service-gallery')!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        ),
    ).toBe(true);
  }
});
test('portfolio category links, nested refresh, unsupported categories and new pages', async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const s of services) {
    await page.goto(portfolioHref(s.slug));
    await expect(page).toHaveURL(new RegExp(`/prices/${s.slug}#gallery$`));
    await expect(page.locator('h1')).toHaveText(s.title);
    await expect(page.locator('.gallery-open').first()).toBeVisible();
  }
  await page.reload();
  await expect(page.locator('h1')).toHaveText(
    services[services.length - 1].title,
  );
  await page.goto('/portfolio');
  await expect(page).toHaveURL(/\/#photography$/);
  for (const tab of ['unknown']) {
    await page.goto(`/portfolio?tab=${tab}`);
    await expect(
      page.getByText('This collection isn’t available in the preview yet.'),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`tab=${tab}$`));
  }
  for (const path of [
    '/about-me',
    '/client-guides',
    ...articles.map((a) => `/post/${a.slug}`),
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
    await expect(page.locator('h1')).toHaveCount(1);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect((await request.get('/post/missing-guide')).status()).toBe(404);
  expect(errors).toEqual([]);
});

test('portfolio supports swipe and restores focus when closed', async ({
  page,
}) => {
  await page.goto('/portfolio?tab=baby');
  const opener = page.locator('.gallery-open').first();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('.lightbox-content').dispatchEvent('touchstart', {
    touches: [{ identifier: 1, clientX: 280, clientY: 300 }],
  });
  await dialog.locator('.lightbox-content').dispatchEvent('touchend', {
    changedTouches: [{ identifier: 1, clientX: 100, clientY: 305 }],
  });
  await expect(dialog.locator('[aria-live]')).toContainText('2 /');
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('homepage puts enquiry after services and links to editable About page', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.featured-section')).toHaveCount(0);
  await expect(page.locator('a[href="/portfolio"]')).toHaveCount(0);
  expect(
    await page
      .locator('#photography')
      .evaluate((el) =>
        Boolean(
          el.compareDocumentPosition(document.querySelector('#enquire')!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
  ).toBe(true);
  await page.getByRole('link', { name: 'More about me' }).click();
  await expect(page).toHaveURL(/about-me$/);
  await expect(page.locator('h1')).toHaveText('A little about me');
  // Rachel can edit this heading in Sanity without changing the page structure.
  await expect(page.locator('.article-end h2')).toBeVisible();
  await expect(page.locator('.article-end h2')).not.toBeEmpty();
});

for (const width of [320, 390, 600, 601, 768, 1000, 1001, 1440]) {
  test(`service previews fill responsive columns at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    for (const service of services) {
      await page.goto(`/prices/${service.slug}`);
      const section = page.locator('.service-gallery');
      await expect(section.locator('.eyebrow')).toHaveCount(0);
      await expect(section.locator('h2')).not.toBeEmpty();
      const gallery = section.locator('.gallery');
      const total = Number(
        (await section.locator('.gallery-count').innerText()).match(/\d+/)?.[0],
      );
      await expect(gallery.locator('figure')).toHaveCount(Math.min(6, total));
      const columns = width <= 600 ? 1 : width <= 1000 ? 2 : 3;
      const positions = await gallery
        .locator('figure')
        .evaluateAll((figures) =>
          figures.map((figure) =>
            Math.round(figure.getBoundingClientRect().left),
          ),
        );
      expect(new Set(positions).size, service.slug).toBe(
        Math.min(columns, total),
      );
      const dimensions = await gallery.locator('img').evaluateAll((images) =>
        images.map((image) => ({
          actual:
            image.getBoundingClientRect().width /
            image.getBoundingClientRect().height,
          natural:
            Number(image.getAttribute('width')) /
            Number(image.getAttribute('height')),
        })),
      );
      for (const image of dimensions)
        expect(image.actual).toBeCloseTo(image.natural, 1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
