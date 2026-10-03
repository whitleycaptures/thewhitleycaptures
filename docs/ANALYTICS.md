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

Neither click event proves an enquiry or booking. Session's cross-origin iframe is not inspected. The legacy submit_content rule was reviewed: it creates an event on page_view where page_path equals /. It was unmarked as a key event without deleting its rule or historical data. Inactive legacy social-share rules were left unchanged.

Manual page views use send_page_view:false. In the existing stream, enhanced measurement was inspected on 3 October 2026: only page views enabled, and **Page changes based on browser history events was already unchecked**. Keep that unchecked; automatic outbound/form/search events stay off to prevent duplicate events and unwanted URL/form data.

Traffic sources based on referring domains remain available. Campaign query parameters are intentionally excluded; campaign tagging is not part of this initial setup.

## Weekly report specification and status

Business-owned Google Data Studio/Looker Studio report, shared only with the two accounts. Native GA4 and Search Console connectors; no paid connector or subscription. Schedule: Monday 09:00 Europe/London. Previous Monday–Sunday compared with the prior week. Recent Google data may be incomplete; consent and blockers mean GA totals are not a census of visitors.

Website section: active users, sessions, source/medium, page/service popularity, enquiry_click and email_click counts. Search section: impressions, clicks, CTR, average position, queries and landing pages. Do not sum query-row impressions to infer site totals. Label source, dates and freshness. First partial week includes the tracking cutover.

To change recipients once configured: open report → Share → Schedule delivery → edit schedule. Dashboard sharing and scheduled-email recipients are separate settings.

Remaining verification:

- Search Console–GA link: user confirmed submission from Rachel’s verified-owner account on 3 October 2026.
- Sitemap fetch resolved: Search Console shows Success and 15 discovered pages, verified on 4 October 2026.
- Finish visual/PDF review, reconcile website totals with GA, and confirm actual receipt in both inboxes after the first scheduled send.
- Validate Session account exports before adding any Session totals.

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

A diagnostic using Google's actual tag, with collection requests intercepted, confirmed `page_view` addressed to `G-76KKT28CDX`. It also exposed a legacy automatically generated `submit_content` event on an ordinary homepage visit. **Do not treat submit_content or the property's total key events as completed enquiries.** Inspect its existing rule and preserve historical data. Actual production ingestion was subsequently verified in GA Realtime: a consented diagnostic homepage visit produced page_view and enquiry_click in the existing property. No enquiry was submitted. The legacy submit_content event still appears but no longer counts as a key event. This diagnostic visit contributes to live traffic totals.

Data Studio draft created under the business account: https://datastudio.google.com/reporting/b4aea151-1a80-4c7d-bed3-29f354bae90b/page/SBTAG/edit. Title: The Whitley Captures — Weekly Website & Search Report. The report is scheduled; final visual/PDF verification remains pending.

The existing GA4 property and Search Console domain property's Site Impression / web source are now connected using the business account's credentials. The user approved the terms, these connections and Mark's report editing access. The report uses the previous complete Monday–Sunday with previous-period comparisons. Sharing and the Monday schedule have been verified. URL Impression data was added through Mark's approved Search Console credentials. PDF inspection and first actual delivery remain pending.

Session's official [integration overview](https://support.usesession.com/hc/en-us/articles/46403736438803-Integrations-overview) lists Google/Apple calendars, Flodesk, Mailchimp and Meta Pixel; it does not document a reporting API or dashboard connector. [Earnings exports](https://support.usesession.com/hc/en-us/articles/46451467998483-How-to-export-earnings-reports) and [client CSV exports](https://support.usesession.com/hc/en-us/articles/46445384336659-How-to-export-a-CSV-of-your-client-list) are supported. A manual weekly summary would require earnings export plus enquiry/bookings/cancellations review and upcoming-calendar totals; estimate 10–15 minutes per week, subject to validating the actual account and export columns. No manual import workflow or unsupported automation has been built.

## Google setup progress — 3 October 2026

- Report sharing verified: thewhitleycaptures@gmail.com is Owner; whitley40@gmail.com is Editor; link access remains Restricted.
- Mark's Search Console access now works for sc-domain:thewhitleycaptures.com after the user granted Full access.
- GA annotation saved for 3 October 2026: “Consent-based tracking launched on replacement website”, noting consent, click limitations and the legacy homepage key-event correction.
- Both report pages now default to the previous complete Monday–Sunday, with previous-period headline comparisons. The website page includes active users, sessions, enquiry/email filters, channels and page paths. The search page has impressions, clicks, CTR, position and queries. The search page also contains landing pages using URL Impression/web data; both search tables show numeric impressions. Search tables were stretched across the row and landing URLs wrap. Further visual/PDF review remains pending.
- Native email schedule reopened and verified for both accounts, all pages, every Monday at 09:00. The saved summary explicitly says “09:00, British Summer Time” and “GMT+00:00 United Kingdom Time”. Start date is 4 October, making the first Monday send 5 October 2026. Sent from Mark's account; report ownership remains Rachel's. PDF download was attempted, but browser control became unavailable before the downloaded file could be inspected. Actual delivery remains pending.
- Search figures reconciled against Search Console for 21–27 September 2026: 11 clicks, 549 impressions, 2% CTR, average position 17.6 (dashboard 17.63). Query totals omit anonymised terms.
- Submitted https://www.thewhitleycaptures.com/sitemap.xml successfully. Google initially said “Sitemap could not be read”; on 4 October Search Console was rechecked and shows Success with 15 discovered pages. Independent checks also return HTTP 200 and valid XML, including with a Googlebot user agent. The old HTTP sitemap entry from 2020 was preserved.
- Mark approved Data Studio terms for his account and Search Console read authorisation. Passkey verification completed; the URL Impression/web connector was added and its landing-page chart returns data. Business GA and site-level Search Console credentials remain unchanged.

The earlier pending-status paragraphs are historical rollout notes; this progress section supersedes them where explicitly verified. Do not describe the complete handover as finished until the remaining checks are recorded.

## Search visibility verification — 4 October 2026

- Production commit `32307f1`, Cloudflare version `48d9cce3-c8b7-41b8-876b-5443af406a87`: extended the existing sitemap with images already published on each page. 600 page/image associations, 589 distinct image URLs, 15 page URLs. URLs are absolute, deduplicated per page and XML-escaped. Draft sessions and preview deployments cannot produce the sitemap. No website copy, design, business profile, image descriptions or CMS content changed.
- Type checking, lint, production build and existing redirect/indexing tests passed. Both the built Worker and deployed site passed an XML/page audit: all 15 pages return HTTP 200, canonicalise to themselves and allow indexing. Their main-page text hashes match the pre-deployment baseline. Every rendered main-content image has a non-empty alt description; this checks presence, not editorial quality.
- Search Console now confirms the submitted sitemap is successful with 15 discovered pages. This observation preceded the image extension; Google processing of the new image entries is not yet verified. Images use the existing Sanity CDN; no CDN-domain ownership verification was added.
- Google's stored homepage record was last crawled on 28 September with the old apex canonical. Its live test on 4 October confirms “URL is available to Google” / “Page can be indexed”. Requested indexing successfully; the page was added to Google's priority crawl queue. This does not establish that the new www canonical is indexed yet.
- Live robots.txt allows all crawlers. Requests carrying Googlebot and OAI-SearchBot user-agent names returned HTTP 200. These probes do not authenticate actual crawler IPs or establish Cloudflare account-wide bot settings; no security settings were weakened.
- Session reporting remains deferred at the user's request. Rachel's business-profile/review/local-partnership suggestions are supplied as an email draft; no email was sent.
