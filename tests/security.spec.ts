import { expect, test } from '@playwright/test';

test('pages, redirects, errors and draft endpoints carry browser protections', async ({
  request,
}) => {
  for (const path of [
    '/',
    '/about-us',
    '/unknown-security-review-page',
    '/api/draft-mode/enable',
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers()['referrer-policy']).toBe(
      'strict-origin-when-cross-origin',
    );
    expect(response.headers()['content-security-policy']).toContain(
      "frame-ancestors 'self'",
    );
    if (path.startsWith('/api/')) {
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.headers()['set-cookie'] || '').not.toContain(
        '__prerender_bypass',
      );
    }
  }
});
