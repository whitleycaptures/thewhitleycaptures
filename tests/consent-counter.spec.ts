import { test, expect } from '@playwright/test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import {
  consentResponse,
  londonDay,
  type ConsentEnv,
} from '../cloudflare/consent';

function environment() {
  const db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(
      new URL('../cloudflare/migrations/0001_consent.sql', import.meta.url),
      'utf8',
    ),
  );
  const env: ConsentEnv = {
    SITE_MODE: 'production',
    CONSENT_COUNTS_SINCE: londonDay(),
    CONSENT_REPORT_KEY: 'test-only-report-key-at-least-32-characters',
    CONSENT_COUNTS: {
      prepare(sql) {
        let values: (string | number)[] = [];
        return {
          bind(...args) {
            values = args;
            return this;
          },
          async run() {
            return db.prepare(sql).run(...values);
          },
          async all<T>() {
            return { results: db.prepare(sql).all(...values) as T[] };
          },
        };
      },
    },
  };
  return { db, env };
}
const request = (body = 'accepted', headers: Record<string, string> = {}) =>
  new Request('https://www.thewhitleycaptures.com/api/consent-count', {
    method: 'POST',
    body,
    headers: {
      origin: 'https://www.thewhitleycaptures.com',
      'sec-fetch-site': 'same-origin',
      'content-type': 'text/plain;charset=UTF-8',
      ...headers,
    },
  });
test('only daily totals are stored; report requires authentication and excludes dates before collection', async () => {
  const { db, env } = environment();
  try {
    for (const choice of ['accepted', 'declined', 'accepted'])
      expect((await consentResponse(request(choice), env))?.status).toBe(204);
    const rows = db.prepare('SELECT * FROM consent_daily').all();
    expect(rows).toEqual([{ day: londonDay(), accepted: 2, declined: 1 }]);
    const url = `https://www.thewhitleycaptures.com/api/consent-summary?start=2026-01-01&end=${londonDay()}`;
    expect((await consentResponse(new Request(url), env))?.status).toBe(401);
    const report = await consentResponse(
      new Request(url, {
        headers: { authorization: `Bearer ${env.CONSENT_REPORT_KEY}` },
      }),
      env,
    );
    expect(report?.headers.get('cache-control')).toBe('private, no-store');
    expect((await report?.json()).rows).toEqual(rows);
  } finally {
    db.close();
  }
});
test('counter rejects foreign origins, excess data, invalid choices and preview writes', async () => {
  const { db, env } = environment();
  try {
    expect(
      (
        await consentResponse(
          request('accepted', { origin: 'https://example.com' }),
          env,
        )
      )?.status,
    ).toBe(403);
    expect(
      (
        await consentResponse(
          request('accepted', { 'sec-fetch-site': 'cross-site' }),
          env,
        )
      )?.status,
    ).toBe(403);
    expect(
      (
        await consentResponse(
          request('accepted', { 'content-type': 'application/json' }),
          env,
        )
      )?.status,
    ).toBe(415);
    expect((await consentResponse(request('a'.repeat(100)), env))?.status).toBe(
      413,
    );
    expect((await consentResponse(request('unset'), env))?.status).toBe(400);
    expect(
      (await consentResponse(request(), { ...env, SITE_MODE: 'preview' }))
        ?.status,
    ).toBe(503);
    expect(db.prepare('SELECT * FROM consent_daily').all()).toEqual([]);
  } finally {
    db.close();
  }
});
test('UK dates follow daylight saving boundaries', () => {
  expect(londonDay(new Date('2026-06-01T23:30:00Z'))).toBe('2026-06-02');
  expect(londonDay(new Date('2026-12-01T23:30:00Z'))).toBe('2026-12-01');
});
