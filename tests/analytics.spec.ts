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
    page.getByRole('button', { name: 'Accept', exact: true }),
  ).toBeVisible();
  expect(loads).toBe(0);
  await page.getByRole('button', { name: 'No thanks' }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Cookie preferences', exact: true }),
  ).toBeVisible();
  expect(loads).toBe(0);
  await page
    .getByRole('button', { name: 'Cookie preferences', exact: true })
    .click();
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
  expect(loads).toBe(1);
  await context.addCookies([
    { name: '_ga', value: 'test', url: page.url() },
    { name: '_ga_76KKT28CDX', value: 'test', url: page.url() },
  ]);
  await page
    .getByRole('button', { name: 'Cookie preferences', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Accept', exact: true }),
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
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
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
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect.poll(() => views(page).then((v) => v.length)).toBe(1);
});
