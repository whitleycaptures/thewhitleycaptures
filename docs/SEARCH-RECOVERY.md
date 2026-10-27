# Search and measurement recovery — 27 October 2026

## Baseline

The report's temporary custom range was 12–29 October (including future dates).
For the complete week 19–25 October, the saved weekly report shows 3 active
users (-50%), 7 sessions (-12.5%), 12 Google search clicks (unchanged), and
994 search impressions (+45.1%). GA4 consent began on 3 October. Older visitor
counts cannot be treated as directly comparable. The historical submit_content
rule counted homepage views; it is not evidence of a completed enquiry.

The indexing overview dated 23 October reported 20 missing URLs, 18 redirects,
2 duplicates without a declared canonical, 2 canonical alternatives, 3 discovered
and 3 crawled-but-unindexed URLs. The 20 missing examples are intentionally
retired pages and malformed URLs. The three crawled examples are old privacy,
baby-guide and testimonials addresses. These are not 48 broken current pages.

URL Inspection is more recent: the HTTPS www homepage was indexed following
the 26 October 23:46 crawl, but its user-declared canonical was N/A. HTTP www
still returned 200. Canonicals existed in streamed browser HTML outside the
initial head. Requests using crawler user-agent names did receive head metadata;
these probes are not proof of Google's actual crawler response.

## Changes

- Visible, equally weighted analytics consent banner; old declines retained,
  old acceptances refreshed once for notice version 2026-10-27.
- Choice/version/time retained locally; two-year rolling GA cookie expiry is
  explicitly configured. No analytics before acceptance. Withdrawal disables
  collection and clears GA cookies; cross-tab withdrawals also disable collection.
- Canonical HTTPS www routing and obsolete guide-pagination redirects.
- Blocking initial-head metadata and a single business suffix in titles.
- Explicit responsive Sanity image candidates for the production runtime.
- Relevant guide-to-service links supplement existing service-to-guide links.
- Report explanation now identifies consenting users, equivalent comparison
  periods and the tracking-change date, keeping clicks distinct from enquiries.

Service-copy proposals are in `search-copy-proposals.json`. These are prepared
for editorial review, not silently published over Rachel's CMS copy. They preserve
all later introductory paragraphs, including safety and capacity details.
The awards correction is a separate revision-guarded operation, backed up locally;
it refuses to overwrite a changed sentence or an unpublished homepage draft.

## Four-week review (manual; no automation created)

Use complete Monday–Sunday comparisons and rolling 28-day periods. Annotate the
banner release so a rise in measured visitors is not mistaken for new demand.
Compare search clicks, impressions and landing pages across all host/protocol
variants as Google consolidates them. Check the declared/selected canonical and
index status of the homepage and all current service pages. Prioritise the printing
guide, baby posing-backdrop library and awards article if still unindexed.

Keep actual enquiries/bookings separate from click events; obtain aggregate counts
from the business's existing records rather than treating GA events as submissions.
Do not redirect intentionally retired or meaningless paths to the homepage to
reduce Search Console's exclusion count. Do not request indexing repeatedly while
Google processes an already submitted request.

## Validation and release

Run lint and type checking, then the production Cloudflare build. Against its
local preview, run analytics, recovery, launch, console and live Session tests
with TEST_PRODUCTION=1 and TEST_ANALYTICS=1. Google collection is intercepted;
no fabricated enquiries are submitted. Check the banner visually at desktop and
mobile sizes, plus zoom, keyboard navigation, gallery controls and footer clearance.

Production promotion uses the existing clean-commit build guard. Record the
commit and deployment version after successful release, then repeat focused
live checks and the Search Console inspections. Only successful checks count as
completed validation; see the appended execution results for actual outcomes.

## Execution results

- GA4 Home, last complete Monday–Sunday (19–25 October), independently confirms
  3 active users (-50%) and 7 sessions (-12.5%), matching the Looker report.
- Updated the saved Looker report explanation; its default complete-week range
  remains unchanged. Visual check confirms the longer explanation fits.
- Pure redirect regression test passes for HTTP/apex host variants, one-hop legacy
  destinations, method preservation, useful queries and local/preview exceptions.
- Formatting and whitespace checks pass for all changed files.
- Initial validation was delayed by macOS offloading dependencies to iCloud.
  The exact locked dependencies and unchanged public assets were restored locally;
  no dependency versions or image source files changed.
- Lint and type checking now pass after installing the unchanged lockfile locally.
  An earlier parallel build/typegen run conflicted in generated route types;
  the successful type check ran separately from the production build.
- Published awards copy corrected with the existing Sanity login; only awards.copy
  changed, guarded by its prior revision and an exact-text check. Backup retained
  under the ignored `.wrangler/recovery-backups/` directory.
- Pre-release production rollback version: `d6f35b1d-ec22-46d0-b410-f6c30e6ac479`.

- Production Cloudflare build passes. All 17 selected checks pass (16 in the
  main run and the smooth-scroll footer check on its corrected rerun).
- Consent coverage includes first visit, rejection, legacy choices, persistence,
  unavailable storage, withdrawal and cross-tab changes. Real Google tag diagnostic
  confirms one redacted page view; collection requests were intercepted.
- All 15 sitemap pages return successful responses and exactly one canonical in
  the initial head, index instructions and non-duplicated titles.
- Mobile/desktop screenshots reviewed; 320/390/1440px layout, footer clearance,
  keyboard choices and enlarged text checked. No horizontal overflow.
- All seven services render without application console errors. Responsive
  photographs, gallery layout and the external enquiry form pass; no enquiries
  were submitted. Preview/private/draft indexing protections remain covered.
- Local Wrangler preview must use `--local-upstream localhost`: its default
  production-host simulation otherwise loops through the intentional HTTPS redirect.

## Live release and Google follow-up

- Initial release commit `101153c`, Cloudflare version
  `c561b504-abeb-4286-a6de-47fc660909b6`, published 27 October 2026.
- Live host/protocol checks pass: GET redirects permanently, POST preserves its
  method with 308, useful query parameters survive, and legacy pagination is removed.
- All 15 live sitemap pages pass canonical/head/title checks. Galleries pass
  keyboard/focus checks at 320, 360, 430, 768 and 1440px. Draft authentication fails
  closed; Studio is noindex; malformed paths remain 404 and retired pages remain 410.
- Two immediate post-deployment consent tests initially missed early clicks; both
  passed on rerun. A readiness guard additionally prevents clicks before browser
  event handlers are attached, addressing the loading race directly.
- Search Console inspections: homepage indexed; printing and baby-backdrop guides
  unknown to Google; awards article discovered but not indexed. These are Google
  index observations, not live-site failures.
- Duplicate-without-canonical validation successfully started on 27 October.
- Printing-guide indexing submission failed with Google’s verification-service
  connection error. No manual indexing submission is claimed successful. Retry
  the three article requests when Google’s service is available; do not repeatedly
  submit a URL after a request succeeds.

## Prepared service copy — not yet published

These changes are ready for editorial review. Each introduction replaces only the
first paragraph; the remaining practical and safety information stays in place.

### baby-newborn

**Search title:** Baby & Newborn Photography in Durham

**Search description:** Gentle baby and newborn photo shoots in Sherburn Hill, Durham, with time for feeding, settling and cuddles. Explore photographs, packages and prices.

**Opening paragraph:** From newborn days until your baby is sitting unaided, my baby and newborn photo shoots in Sherburn Hill, Durham follow your little one’s pace. I use wraps, outfits and props for a mix of styles, with plenty of time for settling, feeding and cuddles.

### maternity

**Search title:** Maternity Photoshoots in Durham

**Search description:** Celebrate your pregnancy with a maternity photoshoot in Durham. Partners and family are welcome. Browse photographs, prices and advice on when to book.

**Opening paragraph:** A little time to celebrate your pregnancy with a maternity photo shoot in my Durham studio, with your comfort and preferences at its heart. Partners and family are welcome at no extra cost, and you can choose two of my backdrops.

### family-portraits

**Search title:** Family Photography in Durham

**Search description:** Relaxed family photography in Durham, in the studio or on location. Explore posed and playful portraits, package prices and options for larger families.

**Opening paragraph:** Bring your favourite people together for a family photo shoot in Durham: a mix of posed portraits and relaxed, playful photographs, in the studio or on location. Individual portraits and two backdrop setups are included.

### portraits

**Search title:** Portrait Photography in Durham

**Search description:** Studio and location portrait photo shoots in Durham for up to two people, or two plus a baby. Browse photographs, backdrop choices and package prices.

**Opening paragraph:** A versatile portrait photo shoot in Durham, in the studio or on location, for up to two people or two plus a baby—from birthdays to simply spending time together. I combine a few posed portraits with natural moments, using two backdrop designs and props chosen around you.

### on-location

**Search title:** Outdoor & Location Photography in Durham

**Search description:** Photography at home or outdoors in Durham and the North East. Explore location options, travel information and which photo-shoot packages are suitable.

**Opening paragraph:** Your home, a favourite place or a seasonal beauty spot in Durham and the North East—I can help you choose a setting for most of my photography packages. Editing is included, so the weather doesn’t need to be perfect. Location shoots aren’t suitable for baby or cake smash packages.

### cake-smash-bath

**Search title:** Cake Smash Photoshoots in Durham

**Search description:** Celebrate a birthday with a cake smash photoshoot in Durham, with a styled backdrop and cake included. Explore prices and the optional milk bath splash.

**Opening paragraph:** A birthday, a little mess and lots of personality: a cake smash photo shoot in my Durham studio. Recommended up to age four, with a backdrop styled around your ideas and an 8-inch cake in your chosen colour; the remaining cake is yours to take home. A 6-inch cake reduces the price by £10.

### sitter

**Search title:** Baby Sitter Photoshoots in Durham

**Search description:** Celebrate your baby’s sitting milestone with a sitter photoshoot in Durham. Two themes, props and outfits are included. Browse photographs and prices.

**Opening paragraph:** For little ones who can sit or stand with help but aren’t yet walking, my Sitter photo shoots in Durham celebrate their growing personality. Two themes are included, with props and outfits to choose from—or bring your own favourites.
