import { test, expect, type Page } from '@playwright/test';

test.skip(
  process.env.TEST_ANALYTICS !== '1',
  'Requires production-mode local server and GA measurement ID; Google requests are intercepted.',
);
const commands = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer || []).map((item) =>
      Array.from(item as ArrayLike<unknown>),
    ),
  );
const views = async (page: Page) =>
  (await commands(page)).filter(
    (item) => item[0] === 'event' && item[1] === 'page_view',
  );
test.beforeEach(async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await page.route('**/*google-analytics.com/**', (route) => route.abort());
  await page.route('https://embed.sessioncdn.com/**', (route) => route.abort());
});
test('no collection before consent or after decline; withdrawal removes cookies', async ({
  page,
  context,
}) => {
  let loads = 0;
  page.on('request', (r) => {
    if (r.url().includes('googletagmanager.com')) loads++;
  });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Accept analytics cookies', exact: true }),
  ).toBeVisible();
  expect(loads).toBe(0);
  await page.getByRole('button', { name: 'No thanks' }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Cookie preferences', exact: true }),
  ).toBeVisible();
  expect(loads).toBe(0);
  await Promise.all([
    page.waitForEvent('load'),
    page
      .getByRole('button', { name: 'Cookie preferences', exact: true })
      .click(),
  ]);
  await page
    .getByRole('button', { name: 'Accept analytics cookies', exact: true })
    .click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
  expect(loads).toBe(1);
  await context.addCookies([
    { name: '_ga', value: 'test', url: page.url() },
    { name: '_ga_76KKT28CDX', value: 'test', url: page.url() },
  ]);
  await Promise.all([
    page.waitForEvent('load'),
    page
      .getByRole('button', { name: 'Cookie preferences', exact: true })
      .click(),
  ]);
  await expect(
    page.getByRole('button', { name: 'Accept analytics cookies', exact: true }),
  ).toBeVisible();
  expect(
    (await context.cookies()).filter((c) => c.name.startsWith('_ga')),
  ).toHaveLength(0);
  expect(await commands(page)).toHaveLength(0);
  expect(loads).toBe(1);
});
test('one page view per route; clicks contain no email, query or fragment', async ({
  page,
}) => {
  await page.goto('/?email=private@example.com#private');
  await page
    .getByRole('button', { name: 'Accept analytics cookies', exact: true })
    .click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
  await page.locator('.header-cta').click();
  await expect
    .poll(
      async () =>
        (await commands(page)).filter((c) => c[1] === 'enquiry_click').length,
    )
    .toBe(1);
  expect(await views(page)).toHaveLength(1);
  await page.locator('a[href="/about-me"]:visible').first().click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(2);
  await page.goBack();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(3);
  // Prevent opening a mail application while preserving the captured click.
  await page
    .locator('.footer-email')
    .evaluate((el) => el.addEventListener('click', (e) => e.preventDefault()));
  await page.locator('.footer-email').click();
  await expect
    .poll(
      async () =>
        (await commands(page)).filter((c) => c[1] === 'email_click').length,
    )
    .toBe(1);
  const payload = JSON.stringify(await commands(page));
  expect(payload).not.toContain('private@example.com');
  expect(payload).not.toContain('mailto:');
  expect(payload).not.toContain('thewhitleycaptures@gmail.com');
  expect(payload).not.toContain('#private');
  expect(payload).toContain('"send_page_view":false');
});
test('storage unavailable does not break visitor choice', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('blocked');
    };
  });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics cookies', exact: true })
    .click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
});

for (const previous of ['accepted', 'declined']) {
  test(`legacy ${previous} choice migrates without silently opting in`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('analytics-consent', value),
      previous,
    );
    await page.goto('/prices/maternity');
    await expect(
      page.getByRole('button', {
        name:
          previous === 'accepted'
            ? 'Accept analytics cookies'
            : 'Cookie preferences',
        exact: true,
      }),
    ).toBeVisible();
    expect(await commands(page)).toHaveLength(0);
  });
}

test('current acceptance persists with a version and time; refusal propagates across tabs', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics cookies', exact: true })
    .click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
  const record = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('analytics-consent-record')!),
  );
  expect(record.version).toBe('2026-10-27');
  expect(record.choice).toBe('accepted');
  expect(Number.isNaN(Date.parse(record.chosenAt))).toBe(false);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Cookie preferences', exact: true }),
  ).toBeVisible();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
  const other = await context.newPage();
  await other.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await other.route('**/*google-analytics.com/**', (route) => route.abort());
  await other.goto('/');
  await Promise.all([
    other.waitForEvent('load'),
    other
      .getByRole('button', { name: 'Cookie preferences', exact: true })
      .click(),
  ]);
  await other.getByRole('button', { name: 'No thanks', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window['ga-disable-G-76KKT28CDX']))
    .toBe(true);
  await expect(
    page.getByRole('button', { name: 'Cookie preferences', exact: true }),
  ).toBeVisible();
  const before = await commands(page);
  await page.locator('.header-cta').click();
  expect(await commands(page)).toEqual(before);
});

test('banner is initially visible, balanced and clears the footer at mobile and desktop sizes', async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prices/maternity');
    const accept = page.getByRole('button', {
      name: 'Accept analytics cookies',
      exact: true,
    });
    const reject = page.getByRole('button', { name: 'No thanks', exact: true });
    await expect(accept).toBeInViewport();
    await expect(reject).toBeInViewport();
    const a = await accept.boundingBox();
    const r = await reject.boundingBox();
    expect(Math.abs(a!.width - r!.width)).toBeLessThan(2);
    expect(a!.height).toBeGreaterThanOrEqual(44);
    await page
      .locator('footer')
      .evaluate((el) => el.scrollIntoView({ block: 'end' }));
    const footer = await page.locator('footer').boundingBox();
    const banner = await page.locator('.analytics-banner').boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(banner!.y);
    expect(await commands(page)).toHaveLength(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('real Google tag emits a redacted page view to the existing property', async ({
  page,
}) => {
  test.skip(
    process.env.TEST_REAL_GA !== '1',
    'Opt-in diagnostic; collection is intercepted',
  );
  await page.unroute('https://www.googletagmanager.com/**');
  const collected: string[] = [];
  await page.route('**/*google-analytics.com/**', (route) => {
    collected.push(
      route.request().url() + '&' + (route.request().postData() || ''),
    );
    return route.fulfill({ status: 204, body: '' });
  });
  await page.goto('/?email=private@example.com#private');
  await page
    .getByRole('button', { name: 'Accept analytics cookies', exact: true })
    .click();
  await expect
    .poll(() => collected.some((url) => url.includes('en=page_view')), {
      timeout: 20000,
    })
    .toBe(true);
  const pageViews = collected.filter((url) => url.includes('en=page_view'));
  expect(pageViews).toHaveLength(1);
  expect(pageViews[0]).toContain('tid=G-76KKT28CDX');
  expect(decodeURIComponent(pageViews.join(' '))).not.toContain(
    'private@example.com',
  );
  expect(decodeURIComponent(pageViews.join(' '))).not.toContain('#private');
});
