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

- Mark reports that he added his GA Administrator access on 3 October 2026; independent verification and the Search Console full-user grant remain pending.
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

## Deployment verification — 3 October 2026

Tracking deployed from commit `ed7eaba`, Cloudflare version `d88ec0ca-6e9f-442b-8d91-ab79d40798a1`. The production bundle contains the existing measurement ID. Three analytics browser tests pass against both the local Cloudflare production bundle and the live domain; the homepage/all seven services console check also passes live. The consent test explicitly awaits the preferences reload to avoid clicking the transient pre-reload UI. Lint, type checking and changed-file formatting pass. Whole-repository formatting reports a pre-existing issue in docs/launch-photo-report.json, which was not changed.

The live sitemap returns HTTP 200 and production URLs. Submission inside Search Console remains a separate check.

A diagnostic using Google's actual tag, with collection requests intercepted, confirmed `page_view` addressed to `G-76KKT28CDX`. It also exposed a legacy automatically generated `submit_content` event on an ordinary homepage visit. **Do not treat submit_content or the property's total key events as completed enquiries.** Inspect its existing rule and preserve historical data. Real arrival in GA Realtime remains to be confirmed; intercepted diagnostics do not establish ingestion.

Data Studio draft created under the business account: https://datastudio.google.com/reporting/b4aea151-1a80-4c7d-bed3-29f354bae90b/page/SBTAG/edit. Title: The Whitley Captures — Weekly Website & Search Report. This is not yet a completed or scheduled report.

The existing GA4 property and Search Console domain property's Site Impression / web source are now connected using the business account's credentials. The user approved the terms, these connections and Mark's report editing access. Report layout remains in progress; the draft's placeholder metrics and dates are not ready for business use. URL Impression data, sharing, delivery, and reconciliation remain pending.

Session's official [integration overview](https://support.usesession.com/hc/en-us/articles/46403736438803-Integrations-overview) lists Google/Apple calendars, Flodesk, Mailchimp and Meta Pixel; it does not document a reporting API or dashboard connector. [Earnings exports](https://support.usesession.com/hc/en-us/articles/46451467998483-How-to-export-earnings-reports) and [client CSV exports](https://support.usesession.com/hc/en-us/articles/46445384336659-How-to-export-a-CSV-of-your-client-list) are supported. A manual weekly summary would require earnings export plus enquiry/bookings/cancellations review and upcoming-calendar totals; estimate 10–15 minutes per week, subject to validating the actual account and export columns. No manual import workflow or unsupported automation has been built.
