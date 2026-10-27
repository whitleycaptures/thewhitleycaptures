import { canonicalResponse } from '../src/lib/canonical';
import { legacyResponse } from '../src/lib/legacy';
import { securityHeaders } from '../src/lib/security';
import { consentResponse, type ConsentEnv } from './consent';
import handler from 'vinext/server/fetch-handler';
export * from 'vinext/server/fetch-handler';

const worker = {
  ...handler,
  async fetch(request: Request, env: ConsentEnv, context: unknown) {
    const production = env.SITE_MODE === 'production';
    const legacy = legacyResponse(request, production);
    const canonical = canonicalResponse(request, production, legacy);
    const response =
      canonical ||
      legacy ||
      (await consentResponse(request, env)) ||
      (await handler.fetch(request, env, context));
    const headers = new Headers(response.headers);
    for (const { key, value } of securityHeaders) headers.set(key, value);
    const path = new URL(request.url).pathname;
    const preview = env.SITE_MODE !== 'production';
    const privateRoute = /^\/(studio|api)(\/|$)/.test(path);
    const draftSession = /(?:^|;\s*)__prerender_bypass=/.test(
      request.headers.get('cookie') || '',
    );
    if (preview || privateRoute || draftSession) {
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      headers.set('Cache-Control', 'private, no-store');
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
