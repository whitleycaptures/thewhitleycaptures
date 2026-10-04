# Production launch checklist — 3 October 2026

Rachel has approved the current copy/photos. User confirmed a Session enquiry was received successfully on 3 October. Rachel approved the expanded galleries for launch on 3 October.

## Protection and rollback

- Squarespace remains the registrar. DNS management can move to Cloudflare after the full Squarespace record inventory is verified.
- Keep Webflow active for the full 24 hours after actual cutover. The user confirmed cancellation can follow that window rather than a fixed hour on 4 October.
- Before cancellation, rollback can remove Worker custom-domain bindings and restore captured Webflow website DNS records in Cloudflare. Preserve mail and verification records.
- After cancellation, use Cloudflare deployment rollback and Sanity backups. The Webflow archive is content/source recovery, not a runnable CMS replacement.
- No domain or nameserver changes are included in preparation deployments.

## Backups

Private local archives live in `.wrangler/launch-backups/` (ignored by Git). `sanity-prelaunch.tar.gz` contains all 38 documents and 114 assets before import, including drafts. `webflow/` contains 34 published HTML pages, the sitemap, original referenced assets and a SHA-256 manifest. This is a published-site archive, not an export of private Webflow account settings, form submissions or unpublished CMS items.

Verify archives before cancellation, copy them to business-controlled backup storage, and keep the original files. GitHub contains the optimized local website assets, not these private backups.

## Search and old addresses

The authoritative executable map is `src/content/legacy-urls.json` plus the portfolio query mapping. All ten retired articles receive 410: their topics are not fully replaced by the four retained articles. Retired service pages and known category queries receive 410; unknown addresses remain 404. Server-side 301 redirects preserve useful query parameters, remove the obsolete tab selector and are tested without following redirects. Retain redirects indefinitely.

Search Console access has not been verified. Before cutover, review any available indexed URL/export reports and retain verification records. After launch submit `/sitemap.xml`; the domain does not change, so do not use Change of Address.

## Privacy

`/privacy-policy` preserves the existing published policy text, with a factual section listing Cloudflare, Sanity and Session. No legal promises, retention periods or consent claims were invented. Rachel should confirm the retained business/address details and review the older legal wording before launch. This migration is not a legal compliance certification.

## Final gates

- [x] Rachel approves newly expanded masonry galleries.
- [x] Full Squarespace DNS inventory and registry DNSSEC checked; four records preserved, no DS delegation.
- [x] Production secret and exact Sanity CORS origin configured; authenticated production draft preview and anonymous isolation verified.
- [x] Production build, redirects, TLS, canonical www host, sitemap/indexing and mobile checks pass.
- [x] Cancellation will be scheduled 24 hours after the actual verified cutover.
- [x] User approved nameserver change, website cutover and explicit removal/replacement of the two Webflow website DNS records.
- [ ] Search Console sitemap submitted after cutover.

Monitor server errors and missing paths immediately, later on launch day and before cancellation, then daily for one week and weekly for a month. No automatic monitoring is installed by this checklist.

## Completed preparation

- Published-site archive verified: 34 HTML pages and 815 assets. Original Sanity archive verified before import.
- Append-only import verified against all 37 original non-system documents: existing content, drafts and the complete original gallery prefixes are unchanged. Added 478 photographs; skipped 58 source photographs already represented. See `docs/launch-photo-report.json`.
- Maternity has only three suitable photographs on the old service page and no separate old portfolio collection; all three are now represented.
- Local gallery snapshots preserve the expanded published galleries and use local optimized images. Never run the old seed against Rachel's dataset.
- The full Squarespace DNS records screen has four records: apex Webflow A, www Webflow CNAME, Google verification CNAME, Squarespace Domain Connect CNAME. Exact records/TTLs are in the private backup `dns/squarespace-before.json`. No MX records are configured.
- User clarified cancellation can happen at any time after the actual 24-hour overlap; no fixed hour tomorrow is required.
- Automated live Session loading and repeated navigation passed without submitting a form. User separately confirmed receipt of Rachel's test enquiry.

## Release state before domain activation

GitHub commit `ecba2ab` is pushed. Preview checks: 29 hosted checks passed, followed by all 3 launch checks including the capitalised old `/Portfolio` link. Production build and local production indexing/redirect checks passed. The separate production Worker has no routes or public workers.dev URL; version `d3330f1c-a8ba-42ab-b6d2-0507b7c66b44` is the prepared release. The existing server-only Viewer secret is installed and `https://www.thewhitleycaptures.com` is allowed in Sanity CORS. Positive authenticated draft preview on the final domain remains a post-attachment check.

Cloudflare Free ($0) was selected for domain DNS. No paid plan was selected and domain registration/renewal remains at Squarespace. The user explicitly approved copying the four existing DNS records to Cloudflare; nameservers were changed with explicit approval at 14:24 BST on 3 October. Squarespace and the .com registry confirm `asa.ns.cloudflare.com` and `garret.ns.cloudflare.com`. All four records were verified directly against Cloudflare authoritative DNS; Webflow still returns HTTP 200. Cloudflare activation is pending; website cutover has not happened and the 24-hour overlap clock has not started.

A second Sanity archive, `sanity-after-photo-import.tar.gz`, contains the expanded galleries and 38 documents; tar verification found 595 entries. The pre-import archive remains unchanged.

## Cutover progress

Cloudflare subsequently confirmed the zone is active. User authorised website cutover ("lets go"). The production custom-domain changeset contains only www and apex. Attachment returned 409 because existing Webflow DNS records must first be removed; no Worker domains were attached (verified via API), and the Webflow website still returns 200. Browser dashboard currently loads blank; awaiting user opening DNS Records before coordinating removal and immediate attachment. The production config now declares the two intended custom domains but this config change is not yet committed/deployed. The fallback window has not started.

## Verified live launch — 3 October 2026, 14:39 BST

Both custom domains are attached to `thewhitleycaptures-production`, serving prepared version `d3330f1c-a8ba-42ab-b6d2-0507b7c66b44`. The apex redirects to canonical www, preserving paths/query strings. The Google verification and Squarespace Domain Connect records remain unchanged. Cloudflare Free is active; registration/renewal remains Squarespace.

Routing was attached to the existing approved release, not a new code deployment. Both domains are now recorded in `wrangler.production.json` for subsequent deliberate promotions.

All 15 live checks passed after propagation, including seven service pages, 320–1440px galleries/lightbox, all legacy mappings, 404/410, production indexing/sitemap, Studio and real Session repeat navigation. One early request showed a temporary load error during the switch; its targeted retry and the full repeated suite passed. Session iframe heights remained 832px on repeated mobile navigation; no enquiry was submitted. A temporary authenticated Sanity preview session issued a draft cookie, rendered the draft banner with noindex, and anonymous access rendered no draft banner. The test session was removed without changing Rachel’s content. Preview remains noindex/nofollow.

**Keep Webflow hosting active until at least Sunday 4 October 2026 at 14:39 BST**, then perform final checks and obtain approval before cancellation. No Webflow cancellation has occurred. Public resolvers may retain old DNS during propagation. The known-good production version and private DNS backup remain available for rollback.

Remaining handover tasks: submit sitemap in Search Console once its account access is confirmed; copy private backup archives to business-controlled backup storage; final availability/enquiry/gallery checks before cancelling Webflow. No automatic future monitoring or cancellation has been configured.

## Availability monitoring — 4 October 2026

Business-owned Checkly monitoring is configured for the homepage and Baby & Newborn service page every five minutes, plus an hourly real-browser enquiry-form journey. Failures are retried once before alerting, with failure and recovery emails to both owners' nominated inboxes. Both test emails were received. The browser check declines analytics and never submits an enquiry. Configuration, free-plan limits and operating instructions are in `monitoring/README.md`; the reusable browser script is stored alongside it. The account confirms automatic transition to the free Hobby plan when its initial trial ends. Monitoring does not prove that a submitted enquiry reaches Rachel: occasional agreed manual delivery testing remains useful.
