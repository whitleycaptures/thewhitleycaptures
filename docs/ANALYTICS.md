# Analytics and weekly reporting

## Ownership and identifiers

Business account: thewhitleycaptures@gmail.com. Intended additional administrator/report editor: whitley40@gmail.com.

- Analytics account: 156444894; property: 373210253 (The Whitley Captures - GA4).
- Existing web stream: 5142879545, https://www.thewhitleycaptures.com.
- Measurement ID: G-76KKT28CDX (public identifier, not a secret).
- Existing Search Console property: sc-domain:thewhitleycaptures.com.

Keep the existing property to preserve history. Access grants, Search Console linking, report creation and delivery verification are tracked below; these are not implied by deploying the website.

## Website collection

Production configuration provides NEXT_PUBLIC_GA_MEASUREMENT_ID at build time. Rebuild with npm run build:production and promote the clean committed build with npm run deploy:production:built -- <commit>. Preview builds and draft pages never mount Analytics; Studio is outside the website layout.

No Google script loads until Accept. No thanks persists the decline. Cookie preferences disables collection, clears first-party _ga/_ga_* cookies and reloads to offer a fresh choice. Storage failures retain the choice only in memory. Other tabs observe changes through the storage event.

Only known published routes are measured. Page locations omit query strings and fragments; external referrers retain only their origin. Titles come from published content. Link tracking sends no link URL, email address, label, or form contents. Advertising storage and personalization remain denied.

| Event         | Meaning                                          |
| ------------- | ------------------------------------------------ |
| page_view     | One initial accepted page or pathname navigation |
| enquiry_click | Click on a link to /#enquire                     |
| email_click   | Click on a mailto link, without its destination  |

Neither click event proves an enquiry or booking. Session's cross-origin iframe is not inspected. Existing GA conversion rules need separate review before using them in the new dashboard.

Manual page views use send_page_view:false. In the existing stream, enhanced measurement was inspected on 3 October 2026: only page views enabled, and **Page changes based on browser history events was already unchecked**. Keep that unchecked; automatic outbound/form/search events stay off to prevent duplicate events and unwanted URL/form data.

Traffic sources based on referring domains remain available. Campaign query parameters are intentionally excluded; campaign tagging is not part of this initial setup.

## Weekly report specification and status

Business-owned Google Data Studio/Looker Studio report, shared only with the two accounts. Native GA4 and Search Console connectors; no paid connector or subscription. Schedule: Monday 09:00 Europe/London. Previous Monday–Sunday compared with the prior week. Recent Google data may be incomplete; consent and blockers mean GA totals are not a census of visitors.

Website section: active users, sessions, source/medium, page/service popularity, enquiry_click and email_click counts. Search section: impressions, clicks, CTR, average position, queries and landing pages. Do not sum query-row impressions to infer site totals. Label source, dates and freshness. First partial week includes the tracking cutover.

To change recipients once configured: open report → Share → Schedule delivery → edit schedule. Dashboard sharing and scheduled-email recipients are separate settings.

Pending external setup:

- Mark's GA administrator and Search Console full-user grants.
- Search Console link and sitemap submission verification.
- Existing conversion-definition review.
- Dashboard URL, report editor grant and Monday schedule.
- PDF inspection, source reconciliation and actual receipt in both inboxes.
- GA annotation recording the tracking deployment date and any gap after site migration.

## Session follow-up

Target weekly totals: enquiries, new bookings, cancellations, payments received and upcoming seven-day shoots, without client details. Keep these separate from GA-attributed conversions. Session documentation confirms client CSV and earnings exports; it does not establish an automated reporting API or that a client export contains all required dates/statuses.

Inspect the signed-in Session account's integrations and available exports before choosing an automated connection. If unsupported, provide the export workflow and estimated weekly effort for review; do not silently substitute incomplete or stale data in the automated Google report.

## Verification

Production-mode local server, intercepted Google requests:

```sh
SITE_MODE=production CONTENT_SOURCE=local NEXT_PUBLIC_GA_MEASUREMENT_ID=G-76KKT28CDX npm run dev -- --port 3012
PLAYWRIGHT_BASE_URL=http://localhost:3012 TEST_ANALYTICS=1 npx playwright test tests/analytics.spec.ts
```

Tests verify no collection before consent/after decline, consent persistence and withdrawal/cookie removal, one event per pathname including back navigation, enquiry/email clicks, redacted queries and storage-blocked fallback. They never submit an enquiry or send fabricated events to Google. Live verification must separately confirm the production bundle and real collection.
