import mapping from '@/content/legacy-urls.json' with { type: 'json' };
import { portfolioTabs } from '@/content/navigation';
export function legacyResponse(
  request: Request,
  production = false,
): Response | null {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const url = new URL(request.url);
  const requestedPath = url.pathname.replace(/\/+$/, '') || '/';
  // The old site's navigation also linked to this capitalised spelling.
  const path = requestedPath === '/Portfolio' ? '/portfolio' : requestedPath;
  let target = (mapping.redirects as Record<string, string>)[path];
  let gone = mapping.retired.includes(path);
  const oldPagination =
    (path === '/client-guides' || path === '/blog') &&
    url.searchParams.has('6315db0d_page');
  if (oldPagination) target = '/client-guides';
  if (path === '/portfolio') {
    const tab = url.searchParams.get('tab');
    const slug = Object.keys(portfolioTabs).find(
      (slug) => portfolioTabs[slug] === tab || slug === tab,
    );
    if (!tab) target = '/#photography';
    else if (slug) target = `/prices/${slug}#gallery`;
    else gone = ['corporate', 'landscape', 'mini-shoots'].includes(tab);
  }
  if (target) {
    const destination = new URL(
      target,
      production ? 'https://www.thewhitleycaptures.com' : url.origin,
    );
    for (const [key, value] of url.searchParams)
      if (
        key !== 'tab' &&
        !key.startsWith('sanity-') &&
        !(oldPagination && key === '6315db0d_page')
      )
        destination.searchParams.append(key, value);
    return new Response(null, {
      status: 301,
      headers: {
        Location: destination.href,
        'Cache-Control': 'public, max-age=300',
        ...(!production ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
      },
    });
  }
  if (!gone) return null;
  const service = path.startsWith('/prices/') || path === '/portfolio';
  const heading = service
    ? 'This photography service has been retired.'
    : 'This page is no longer available.';
  return new Response(
    request.method === 'HEAD'
      ? null
      : `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page retired | The Whitley Captures</title><style>body{margin:0;background:#faf8f4;color:#30352b;font:18px/1.7 system-ui}main{max-width:700px;margin:auto;padding:12vh 24px}h1{font:clamp(2.5rem,6vw,4rem)/1.15 Georgia}a{color:inherit;text-underline-offset:5px}nav{display:flex;flex-wrap:wrap;gap:24px}a:focus-visible{outline:2px solid;outline-offset:6px}</style></head><body><main><a href="/">The Whitley Captures</a><h1>${heading}</h1><p>You may have followed an older search result or saved link. You can explore my current photography sessions, browse client guides, or get in touch.</p><nav aria-label="Find another page"><a href="/#photography">Photography sessions</a><a href="/client-guides">Client guides</a><a href="/#enquire">Contact Rachel</a></nav></main></body></html>`,
    {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': production ? 'noindex, follow' : 'noindex, nofollow',
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
}
