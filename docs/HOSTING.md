# Cloudflare hosting

## Current preview

- Website: https://thewhitleycaptures-preview.thewhitleycaptures.workers.dev
- Sanity Studio: https://thewhitleycaptures-preview.thewhitleycaptures.workers.dev/studio
- Worker: `thewhitleycaptures-preview`, in Thewhitleycaptures@gmail.com's Account.
- This is a public, unindexed review site. No Webflow, DNS, nameserver or custom-domain changes have been made.

Rachel can open the website from any network on her phone or laptop. Studio requires a Sanity account with access to project `4d7wgp7e`. Public visitors receive published content; authenticated draft preview uses a separate cookie and server-only Viewer token. Search directives are not access control. Cloudflare Access could restrict the preview to approved emails later, but is deliberately optional for this milestone.

## Architecture and compatibility

The application uses Next.js 16.3.6, React 19.3 and the App Router. Ordinary local development still uses Next.js. Cloudflare deployment uses Vite with vinext and `@vinext/cloudflare`, following Cloudflare's current [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

The installed vinext compatibility check reported no blocking unsupported features (97% compatibility after setup). The adapter is beta: retain the lockfile, test upgrades, and repeat hosted checks before production approval. No Vercel hosting is used; transitive packages with Vercel names are tooling dependencies. There is no middleware. Both draft route handlers run on Workers.

Studio loads in the browser because server-rendering its editing dependencies failed in Workers. The website remains server-rendered. `cloudflare/worker.ts` explicitly applies indexing and cache headers because the adapter did not consistently apply Next's configured headers to HTML responses.

Sanity remains the content and image service. Images retain CDN width/quality transformations, responsive sizes, reserved dimensions, crop settings, eager hero loading and lazy loading below the fold. No Cloudflare Images, KV, database or extra cache backend is configured. Local fixture images work but do not gain a separate Cloudflare image-optimisation service.

## Local development

Use Node 24 (verified with 24.14.1), then:

```sh
npm ci
npm run dev
```

The ordinary Next site uses http://localhost:3000. No environment file is required for local fixtures. Copy `.env.example` to `.env.local` to use Sanity and configure a Viewer token for drafts. Keep this file out of Git.

For the Cloudflare runtime:

```sh
npm run dev:cloudflare
# Or build and serve the actual Worker locally:
npm run build:cloudflare
npm run preview:cloudflare -- --port 3002
```

The Cloudflare development command uses port 3002. Local Studio sign-in on another port needs that exact origin added to Sanity CORS with credentials; localhost:3000 is already configured. A local phone review needs the same Wi-Fi and a running development server; the hosted preview has neither restriction.

## Build and deploy

```sh
npm run build:cloudflare
npm run deploy:cloudflare:built
```

Alternatively `npm run deploy:cloudflare` builds and deploys in one step. Wrangler login is needed for manual deployment. The built deployment command uses `dist/server/wrangler.json`; do not use plain `wrangler deploy` against the source entry without building.

Generated `dist`, `.wrangler` and `.vinext` folders are ignored. The Cloudflare Vite plugin can copy local secrets into an ignored `dist/server/.dev.vars` for local emulation. Never commit or publish this folder as a separate static-site upload. Wrangler uploads the Worker modules and client assets, not that local environment file. Built bundles were checked for the local Viewer token; it was absent.

## CLOUDFLARE SETTINGS TO ENTER

These are the settings for connecting the **existing preview Worker** to `whitleycaptures/thewhitleycaptures` under Settings → Builds. GitHub was originally connected on 28 September 2026 with Node 24 and branch preview builds disabled.

### Business repository ownership — 4 October 2026

- Repository transferred from `mwhit82/thewhitleycaptures` to https://github.com/whitleycaptures/thewhitleycaptures, preserving public visibility and history.
- Organisation owners verified: `mwhit82` and `thewhitleycaptures`; Rachel's invitation has been accepted.
- All four outstanding commits were pushed before transfer. Remote `main` verified at `9475dbcc27ff839040d52bb0e7584457c6376cc0`; local origin updated to `git@github.com:whitleycaptures/thewhitleycaptures.git` and SSH read access verified.
- Cloudflare preview Builds reconnected to `whitleycaptures/thewhitleycaptures` after the owner authorised the Cloudflare GitHub App for this repository only. Restored `main`, the build/deploy commands below, Node 24, and disabled branch preview builds. The existing build token is retained; build caching is off. Automatic build and deployment succeeded for commit `812d0bc` (build `168fd934-0481-433a-b1f3-adc8726a0e22`, 2m 18s). Production and preview homepage HEAD requests returned HTTP 200 afterwards; preview retains `X-Robots-Tag: noindex, nofollow`.
- Production remains on the separate reviewed, manual deployment workflow below.

| Setting                                 | Value                                                             |
| --------------------------------------- | ----------------------------------------------------------------- |
| Project / Worker name                   | `thewhitleycaptures-preview`                                      |
| Build command                           | `npm run build:cloudflare`                                        |
| Deploy command                          | `npm run deploy:cloudflare:built`                                 |
| Preview command, if the UI requires one | `npx wrangler versions upload --config dist/server/wrangler.json` |
| Production branch                       | `main`                                                            |
| Root directory                          | `/` (repository root)                                             |
| Enable Preview Builds                   | **OFF**                                                           |
| Build environment                       | `NODE_VERSION=24`                                                 |
| Compatibility date                      | `2026-09-27`                                                      |
| Compatibility flag                      | `nodejs_compat`                                                   |
| Custom domain / routes                  | None                                                              |

The dashboard's “production branch” means the branch deploying this temporary Worker, not the Webflow site. A push to main triggers a build and updates this Worker. Check Deployments in Cloudflare for build results. Branch builds remain disabled; Sanity provides Rachel's content-preview workflow. `preview_urls` is also false in Wrangler; the preview command is only a dormant dashboard setting.

### Variables and secrets

The following non-secret values are committed in `wrangler.json` and applied on deployment. Vite reads them for the build, including the public Studio configuration; keep that file as their source of truth instead of creating conflicting dashboard overrides.

| Variable                        | Value                                                               | Scope                                     |
| ------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| `SITE_MODE`                     | `preview`                                                           | Normal build/runtime variable             |
| `CONTENT_SOURCE`                | `sanity`                                                            | Normal build/runtime variable             |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `4d7wgp7e`                                                          | Public build/runtime variable             |
| `NEXT_PUBLIC_SANITY_DATASET`    | `production`                                                        | Public build/runtime variable             |
| `SANITY_API_VERSION`            | `2026-09-27`                                                        | Normal build/runtime variable             |
| `SITE_URL`                      | `https://thewhitleycaptures-preview.thewhitleycaptures.workers.dev` | Normal build/runtime variable             |
| `SANITY_API_READ_TOKEN`         | Existing Sanity Viewer token; never paste into Git                  | **Encrypted runtime secret, server-only** |

The Viewer token has already been installed on this Worker. For replacement, use Workers → this Worker → Settings → Variables and Secrets → Add → Secret, or run:

```sh
npx wrangler secret put SANITY_API_READ_TOKEN --config wrangler.json
```

Paste only at the private prompt. Never prefix it with `NEXT_PUBLIC_`, include it in a command argument, or commit its value. A Viewer token is not required as a build variable. Do not deploy an Editor/write token. Cloudflare's Git build authentication is managed by Cloudflare; no personal token belongs in this repository.

`NEXT_PUBLIC_SANITY_PREVIEW_URL` is optional: leave unset to use the current Studio origin, so localhost and hosted Studio both work. If a separately hosted Studio is introduced, set its preview target explicitly at build time. Analytics stays unset for this preview.

## Rachel's editing workflow

1. Open the hosted `/studio` and sign in using her existing Sanity project membership.
2. Edit content; Sanity saves an unpublished draft.
3. Choose **Preview website**. Authenticated Studio generates a short-lived preview secret; the server validates it before enabling the draft cookie.
4. Use **Refresh preview** after saving to see the latest draft. Navigate between the homepage and service pages as usual.
5. Publish in Studio only when happy. Exit preview to return to published content.

CORS origin `https://thewhitleycaptures-preview.thewhitleycaptures.workers.dev` was added to Sanity project `4d7wgp7e` with credentials enabled. Existing local origins remain. No wildcard is needed. Studio sign-in and draft rendering on the hosted homepage and Baby & Newborn page have been verified. No content was edited or published for these checks.

## Indexing and caching

`SITE_MODE=preview` is the default. HTML metadata and response headers emit `noindex, nofollow`, robots disallows crawling, and the sitemap route returns 404. The Worker explicitly sets `X-Robots-Tag` and `Cache-Control: private, no-store` in preview mode, and always for Studio/API/draft-cookie requests. Anonymous requests cannot enable draft mode without a valid preview secret.

Do not interpret the workers.dev address or robots directives as authentication. Anyone with the address can view the published review site.

## Verification (28 September 2026)

The hosted suite passed all 20 tests, including all seven services, metadata/noindex, 404 behaviour, 320/390/768/1440px layouts, navigation, gallery controls, Studio and nested Studio loads, translation-hook regression and the real Session embed across navigation. No Session enquiry was submitted. Hosted Studio login and authenticated homepage/service draft preview were checked separately in the signed-in browser. The Viewer secret is installed server-side. Rachel should still review on her own devices and perform any authorised enquiry submission.

Lint, type checking, formatting and the Next.js production build using `npx next build --webpack` also passed. The final default Turbopack build was blocked by this execution environment denying its CSS worker a local port (`Operation not permitted`); the default local scripts remain unchanged. The Cloudflare build and deployed runtime checks passed independently. The dependency audit reported zero production vulnerabilities, and no Viewer token was found in files eligible for Git.

Run the hosted suite without changing content:

```sh
PLAYWRIGHT_BASE_URL=https://thewhitleycaptures-preview.thewhitleycaptures.workers.dev LIVE_SESSION=1 npm test
```

## Eventual production launch — separate approval

Cloudflare is the intended production host, but this milestone does not perform cutover. Complete the URL/redirect/legal/pricing review in `MIGRATION.md`, approve the canonical host, snapshot DNS including mail records and agree rollback before changing anything. Update `SITE_URL` and deliberately change `SITE_MODE=production` in the configuration, run `npm run check:launch`, rebuild, and verify indexing/sitemap/canonicals on the approved host. Add its exact Sanity CORS origin. Obtain explicit approval before attaching the domain or changing DNS. Keep Webflow available throughout the rollback window.

## Separate production promotion

The temporary preview continues to deploy from `main` using `wrangler.json`. The new production Worker uses `wrangler.production.json`, canonical `https://www.thewhitleycaptures.com`, and production indexing. Its workers.dev address and version preview URLs are disabled. No domain routes are attached in this preparation commit.

After review, from a clean checkout of the approved commit:

```sh
npm ci
npm run lint
npm run typecheck
npm run build:production
npm run deploy:production:built -- <reviewed-commit-hash>
```

The promotion command refuses a dirty checkout, the wrong Worker configuration, or an artifact built from a different/dirty commit. Do not connect production to automatic preview-branch builds. Add the existing server-only Viewer secret to the production Worker and allow the exact production origin in Sanity CORS before signed-in preview verification. Attach both domain names only at the separately agreed cutover. Save the resulting Cloudflare deployment version for rollback.

See `docs/launch/READINESS.md` for the 24-hour Webflow overlap and cancellation gates. After Webflow cancellation, rollback means restoring a known-good Cloudflare deployment, not pointing DNS back to Webflow.
