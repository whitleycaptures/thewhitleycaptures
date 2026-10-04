import { test, expect } from '@playwright/test';

test.use({ actionTimeout: 10000 });

// Read-only production journey: never fills or submits an enquiry.
// One browser check per hour with round-robin scheduling uses at most 744 scheduled monthly runs.
test('Homepage, service page and Session enquiry form load', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  const home = await page.goto('https://www.thewhitleycaptures.com/', {
    waitUntil: 'domcontentloaded',
  });
  expect(home?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Little moments',
  );
  // Decline analytics so monitoring does not inflate visitor/enquiry counts.
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await page.locator('.service-grid a[href="/prices/baby-newborn"]').click();
  await expect(
    page.getByRole('heading', { name: 'Baby & Newborn', level: 1 }),
  ).toBeVisible();
  await page.locator('.service-hero-copy .button').click();
  const frame = page.frameLocator('#session-embed-0Ll72MoGY iframe');
  await expect(
    frame.getByRole('button', { name: /^submit enquiry$/i }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#session-embed-0Ll72MoGY iframe')).toHaveCount(1);
  await expect(page.locator('.session-form')).toHaveAttribute(
    'data-state',
    'ready',
  );
});
