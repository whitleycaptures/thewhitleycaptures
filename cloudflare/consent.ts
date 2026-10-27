// Only aggregate counters are persisted. No request headers, identifiers,
// page URLs, event timestamps or individual choices are stored.
type Statement = {
  bind(...values: (string | number)[]): Statement;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
};
export type ConsentEnv = {
  SITE_MODE?: string;
  CONSENT_COUNTS?: { prepare(sql: string): Statement };
  CONSENT_REPORT_KEY?: string;
  CONSENT_COUNTS_SINCE?: string;
};
const origin = 'https://www.thewhitleycaptures.com';
export function londonDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
async function authorised(request: Request, key: string | undefined) {
  if (!key || key.length < 32) return false;
  const supplied = request.headers.get('authorization') || '';
  const hash = (value: string) =>
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const [a, b] = await Promise.all([hash(supplied), hash(`Bearer ${key}`)]);
  const aa = new Uint8Array(a),
    bb = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < aa.length; i++) difference |= aa[i] ^ bb[i];
  return difference === 0;
}
export async function consentResponse(
  request: Request,
  env: ConsentEnv,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!['/api/consent-count', '/api/consent-summary'].includes(url.pathname))
    return null;
  const respond = (status: number, body: string | null = null) =>
    new Response(body, {
      status,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  if (env.SITE_MODE !== 'production' || !env.CONSENT_COUNTS)
    return respond(503);
  if (url.pathname === '/api/consent-count') {
    if (request.method !== 'POST') return respond(405);
    if (
      request.headers.get('origin') !== origin ||
      request.headers.get('sec-fetch-site') !== 'same-origin'
    )
      return respond(403);
    if (request.headers.get('content-type') !== 'text/plain;charset=UTF-8')
      return respond(415);
    // A hard streaming limit also covers chunked requests without Content-Length.
    if (Number(request.headers.get('content-length') || 0) > 8)
      return respond(413);
    const reader = request.body?.getReader();
    if (!reader) return respond(400);
    const chunks: number[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (chunks.length + value.length > 8) {
        await reader.cancel();
        return respond(413);
      }
      chunks.push(...value);
    }
    const choice = new TextDecoder().decode(new Uint8Array(chunks));
    if (choice !== 'accepted' && choice !== 'declined') return respond(400);
    await env.CONSENT_COUNTS.prepare(
      'INSERT INTO consent_daily (day, accepted, declined) VALUES (?, ?, ?) ON CONFLICT(day) DO UPDATE SET accepted = accepted + excluded.accepted, declined = declined + excluded.declined',
    )
      .bind(
        londonDay(),
        choice === 'accepted' ? 1 : 0,
        choice === 'declined' ? 1 : 0,
      )
      .run();
    return respond(204);
  }
  if (request.method !== 'GET') return respond(405);
  if (!(await authorised(request, env.CONSENT_REPORT_KEY))) return respond(401);
  const start = url.searchParams.get('start'),
    end = url.searchParams.get('end');
  const validDay = (day: string | null): day is string =>
    Boolean(
      day &&
      /^\d{4}-\d{2}-\d{2}$/.test(day) &&
      !isNaN(Date.parse(day)) &&
      new Date(day).toISOString().slice(0, 10) === day,
    );
  if (
    !validDay(start) ||
    !validDay(end) ||
    start > end ||
    Date.parse(end) - Date.parse(start) > 366 * 86400000
  )
    return respond(400);
  const { results } = await env.CONSENT_COUNTS.prepare(
    'SELECT day, accepted, declined FROM consent_daily WHERE day >= ? AND day <= ? ORDER BY day',
  )
    .bind(start, end)
    .all<{ day: string; accepted: number; declined: number }>();
  const rows = [];
  const since = env.CONSENT_COUNTS_SINCE;
  if (!validDay(since || null)) return respond(503);
  const finalDay = end < londonDay() ? end : londonDay();
  for (
    let day = start > since! ? start : since!;
    day <= finalDay;
    day = new Date(Date.parse(day) + 86400000).toISOString().slice(0, 10)
  ) {
    rows.push(
      results.find((row) => row.day === day) || {
        day,
        accepted: 0,
        declined: 0,
      },
    );
  }
  const response = respond(
    200,
    JSON.stringify({ rows, collectingSince: since, timeZone: 'Europe/London' }),
  );
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}
