/** Canonicalise public production hosts without changing local/preview origins. */
export function canonicalResponse(
  request: Request,
  production: boolean,
  legacy: Response | null = null,
): Response | null {
  const url = new URL(request.url);
  if (
    !production ||
    !['thewhitleycaptures.com', 'www.thewhitleycaptures.com'].includes(
      url.hostname,
    )
  )
    return null;
  if (
    url.hostname === 'www.thewhitleycaptures.com' &&
    url.protocol === 'https:'
  )
    return null;
  if (legacy?.status === 301) return legacy;
  url.hostname = 'www.thewhitleycaptures.com';
  url.protocol = 'https:';
  return Response.redirect(
    url.href,
    ['GET', 'HEAD'].includes(request.method) ? 301 : 308,
  );
}
