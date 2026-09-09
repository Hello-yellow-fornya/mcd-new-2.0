# Claims 24/7 (Motor Claims Department 2.0)

A PPC-only site: the content exists so a visitor arriving from an ad finds a full, credible site behind the landing page. It is not meant to rank and must not compete with the 1.0 site, which carries the same copy.

The second Motor Claims Department front end, trading as Claims 24/7: same company, same claims, louder brand. Next.js 15 (App Router, TypeScript) on Vercel; claims post to the shared 1.0 claims API. `CLAUDE.md` is the build brief (§0 is what differs from 1.0; the appendix carries the shared behaviours); everything in `design/` is the visual and structural spec and is reproduced, not redesigned.

## Run locally

Requires Node 22.18 or later (the unit tests rely on Node’s built-in type stripping) and pnpm 10; `corepack enable` gives you the pinned version.

```bash
pnpm install
cp .env.example .env.local   # optional; defaults are fine
pnpm dev                     # http://localhost:3000
```

Checks, all of which also run before every build:

```bash
pnpm check          # typecheck + eslint + content lint + css lint + unit tests
pnpm lint:content   # appendix §10 rules over sites/*/content/ (fails the build on a hit)
pnpm lint:css       # §0 rules that live in code: no uppercase, no italics, ink on the bright, no 1.0 palette, no box behind text
pnpm test           # unit tests (node --test)
pnpm test:e2e       # Playwright, against a production build (run `pnpm exec playwright install` once)
pnpm snapshot       # compares a running `pnpm start -p 3100` with tests/snapshots/<site>-routes.json (--write to capture)
```

## Sites

The repo builds more than one site from the same components, API client, consent, lint and tests. Each site is a folder in `sites/` holding what is its own: `site.ts` (name, legal line, phone, the `source` it posts to the claims API), `copy.ts`, `tokens.css`, `fonts.ts`, `home.tsx`, `content/` (its MDX pages, so its page list), `landing/`, `claims.json`, `reviews.json` and its icon sources.

- `NEXT_PUBLIC_SITE` selects the site (`mcd2`, Claims 24/7, is the default; `ocr` is Online Claims Report). `next.config.ts` inlines the resolved id and points `@site/*` at `sites/<id>/`; a Vercel build of an `ocr/…` branch is the OCR site when the variable is unset.
- `pnpm site:assets` (predev, prebuild) writes the site's icons: `src/app/icon.svg`, `apple-icon.png`, `favicon.ico`, `public/favicons/` and `public/logo/`. They are build output and gitignored.
- A second Vercel project from this repo builds the other site: set `NEXT_PUBLIC_SITE`, `NEXT_PUBLIC_SITE_URL` (its own `.vercel.app` URL) and `NEXT_PUBLIC_GTM_ID` there, with deployment protection on.
- `tests/snapshots/mcd2-routes.json` hashes every route's markup and stylesheet rules and every generated asset; `tests/e2e/unchanged.spec.ts` fails if a build serves anything different. Regenerate it only after a reviewed change to that site.

## Environments and staging

The Vercel project is **`mcd-new-2-0`** (team `fornya`), production at `https://mcd-new-2-0.vercel.app`. There is no custom domain, and there is no Railway service for 2.0.

| | production (`main`, `.vercel.app`) | preview (every branch and PR) |
|---|---|---|
| Custom domain | none | none |
| Deployment protection | **on** (Vercel project setting) | **on** |
| `X-Robots-Tag: noindex, nofollow`, `<meta name="robots">`, disallow-all `robots.txt` | yes, always | yes, always |
| `sitemap.xml` | none | none |
| Canonical URLs | `NEXT_PUBLIC_SITE_URL` (the 24/7 URL), never the 1.0 domain | same |

- **Set `NEXT_PUBLIC_SITE_URL` in Vercel** to `https://mcd-new-2-0.vercel.app` for all environments. Unset, the site falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then to `http://localhost:3000`.
- **Every page is `noindex, nofollow` on every host**: content, homepage, landing pages, utility. `src/middleware.ts` and `next.config.ts` set the header, the root layout renders the meta tag, `src/app/robots.ts` serves disallow-all with no sitemap line, and there is no `sitemap.xml`. Nothing is keyed off the host or `VERCEL_ENV`; attaching a domain changes canonicals only. `tests/e2e/staging.spec.ts` walks every route and checks the header, the meta, the canonical host, and that no page links to the 1.0 domain.
- Deployment protection is a Vercel project setting (Settings → Deployment Protection). It sits on top of the noindex, not instead of it.
- Per-environment variables live in Vercel. No secrets in the repo; `.env.example` lists what exists.

## Project layout

```
CLAUDE.md               the build brief
design/                 signed-off 2.0 mockups, nav and font options, the logo; the 1.0 tpl-*.html template mockups and the sitemap
sites/mcd2/             Claims 24/7: site.ts, copy.ts, tokens.css, home.tsx, content/ (MDX pages), landing/, claims.json, reviews.json
sites/ocr/              Online Claims Report, the same shape
content.rules.json      content lint rules (appendix §10)
scripts/                lint-content.mjs, lint-css.mjs, site-assets.mjs, snapshot-routes.mjs
src/app/                App Router routes and global CSS
src/fonts/              self-hosted Archivo Black 400 and Archivo 400/700 (WOFF2, SIL OFL)
src/lib/                site selection (site-id.ts), site config, staging rules
tests/unit/             node --test
tests/e2e/              Playwright (390×844, 430×932 and desktop projects)
```

## Design tokens

`sites/mcd2/tokens.css` holds the §0 values: ink, yellow, cream, pale, ochre, muted, line, green; the contrast pairings (`--on-yellow`, `--on-ink`, `--on-ink-button`, …); Archivo Black and Archivo; the highlight bar; radii, grid, spacing, motion and the focus ring, with the type scale, button heights, circle sizes and the mobile nav and strip heights read from the mockups in `design/`. The page body is white and the hero, nav and cards take cream, as the mockups set them. Components use tokens, never raw values. Five rules are enforced by `pnpm lint:css` rather than documented:

- sentence case everywhere: no `text-transform: uppercase`
- never italics
- ink text on yellow, pale and green, never white or cream; yellow type only on ink buttons
- no coral, marine, sky or stone: the 1.0 palette does not exist here
- the highlight is a bar under the words (`.hl` in `globals.css`), never a box behind them; the band's chip is the one exception

## Add a page

Pages are MDX files under `sites/<site>/content/<section>/<slug>.mdx`. The route comes from the `slug` in the frontmatter, not the folder. Adding a page is "add a file, open a PR"; every PR gets a Vercel preview.

```bash
pnpm new-page --template pillar --slug /accident-recovery/ --title "Accident recovery"
```

That copies the template's lorem-ipsum skeleton from the site's `content/_templates/` as a draft. Write the page, remove `draft: true`, open a PR. Frontmatter fields (appendix §10):

| Field | Purpose |
|---|---|
| `slug`, `template` | The route and one of `pillar`, `process`, `comparison`, `guide`, `location`, `article`, `utility` |
| `title`, `description` | `<title>` (≤60 characters) and meta description (≤155) |
| `kicker`, `h1`, `highlight`, `lead` | The hero: eyebrow, H1, the one or two words of the H1 that carry the yellow bar, and the lead, which renders as the page's H2 |
| `lastReviewed`, `author` | Optional. Nothing renders (the site is not indexed); `author` names the Article schema author, otherwise the organisation |
| `breadcrumb` | Parent pages in order; Home is added |
| `keeps` | Show the keeps strip; defaults to on for pillar, process, comparison and location |
| `faq` | Rendered after the body and emitted as FAQPage schema from the same data |
| `schemaType`, `steps` | Override the template's schema; HowTo steps by heading id |
| `draft` | `true` keeps the page out of the build |

The templates (`src/templates/ContentPage.tsx`) come from the 1.0 `design/tpl-*.html` mockups restyled to 24/7: breadcrumb, text hero (H1 in Archivo Black, the lead in Archivo, no photo slot), the keeps strip (not on guide and article), the "On this page" list beside the prose (sticky on desktop, tap-to-open on mobile, only where a page has four or more sections), the FAQ, the CTA pair, the band. The ranking furniture (reviewed/author line, related pages) is gone; the schema (Organization as Claims 24/7, BreadcrumbList, the page entity, FAQPage from the visible questions) stays. The 22 launch pages were lifted from Alex's `tpl-*.html` files by `scripts/alex-to-mdx.py` (kept for reference; the MDX is now the source). In the body: H2s become the "On this page" list (ids are GitHub-style slugs of the heading text; H2s starting "Step 1." feed HowTo schema), and `<Callout>`, `<Steps>`, `<ThemUs>`, `<Figure>` and `<Muted>` are available. Links to pages that do not build yet render as plain text, in prose, the header and the footer alike, so nothing 404s.

`pnpm stubs` creates a draft file for every page in the approved sitemap (`design/motorclaimsdepartment_sitemap.html`) that has none; drafts for Phase 2 and 3 are in place. `pnpm lint:content` runs before every build and stops it on an exclamation mark, an all-caps heading, "week(s)", or a banned phrase.

## Claim-now and the claims API

`/claim-now/` is the stub: a hero, the reg box, and the `#claim-flow` slot. The reg box posts to `/api/claim-start/` (the site's own route handler: honeypot, rate limit, reg validation), which forwards to the shared 1.0 claims API when `CLAIMS_API_URL` and `CLAIMS_API_KEY` are set, always with `source: "mcd2"`, and otherwise acknowledges with a stub reference. There is no claims service in this repo. Ollie's question flow mounts on `#claim-flow` (`data-claim-flow-mount`, with `data-ref` and `data-reg` once the reg is accepted) exactly as in 1.0; when it completes it sends the visitor to `/claim-now/thank-you/?ref=…`, which fires the conversion.

## Tracking and consent

See `docs/tracking.md`: 2.0's own GTM container loads only after consent, the banner is the 1.0 banner in 2.0 colours, the choice is one cookie (`mcd2_consent`), and every `dataLayer` event is specified there. Legal pages carry page views only.

## Add an insurer landing page

Landing pages live at `/claim/<slug>/`, one JSON file each in `sites/<site>/landing/`, rendered by `src/templates/LandingPage.tsx` from `design/mcd-2-0-goskippy-landing*.html`. Copy `goskippy.json`, change `slug`, `insurer`, `title`, `description`, `h1` and (if needed) `h2` and `mobileSub`, and the page builds. Rules that hold in code:

- The insurer name may appear only in the H1 and the independence line (the template renders the line from `insurer`). `validateLanding` fails the build if it turns up in the description, H2, sub line or facts.
- Every `/claim/*` page, like every other page, is `noindex, nofollow` (header and meta) and canonical to itself.
- The independence line renders directly under the hero and strip.
- Sourced facts go in `facts[]` with `label`, `theirs`, `ours`, `source`, `sourceUrl` and `checkedOn`, rendered verbatim with the date. Leave the array empty and the section does not render.
- Proof claims (the wait row, the 90-minute card, the header chip) follow the site's `claims.json` as everywhere else.

`tests/e2e/landing.spec.ts` covers all of it, including the fold lock at 390×844 and 430×932.

## The logo, icons, manifest and the Open Graph image

`design/logo/` is the Claims 24/7 suite v2 as delivered: a wordmark, "Claims" in Archivo Black with "247" set small and high beside it in the accent colour. Seven lockups (`claims247-logo-on-light`, `-on-light-yellow`, `-on-cream`, `-on-yellow`, `-on-ink`, `-mono-ink`, `-mono-white`), nine squares in `square/` (`247`, `c247`, `stacked` × yellow / ink / white) and the favicon set in `favicons/` (`favicon-source.svg`, `favicon-16-source.svg`, PNGs at 16 to 1024 plus "247"-only 16 and 32). The words are `<text>` in those files on purpose. `pnpm logo` (prebuild) outlines every word with the self-hosted Archivo Black into `public/logo/`, `public/favicons/` and `src/components/Logo/lockup.generated.tsx`, copies the favicon PNGs, writes `src/app/icon.svg` and `src/app/apple-icon.png`, and packs `src/app/favicon.ico` from the two "247" tiles; `src/app/manifest.ts` lists the 192, 512 and 1024 icons. `pnpm logo:png` (Chromium, local) cuts the social avatar, the stacked square on yellow, to `public/logo/square/claims247-square-stacked-on-yellow.png`. `<Logo surface="…">` picks the variant: "Claims" takes the wordmark colour, "247" the accent (the brand yellow on light, cream and ink; ink on yellow). `src/app/opengraph-image.tsx` renders the default share card for every route from the self-hosted fonts and the on-light-yellow lockup.

## Audit

With a production build running on port 3100 (`pnpm build && pnpm start -p 3100`), `pnpm audit:lh` runs Lighthouse mobile on the six representative pages and fails under the appendix §9 targets: Performance ≥ 90, Accessibility 100, SEO 100, Best practices ≥ 90. The two crawlability audits fail by design (the site is never indexable), so they are set aside; the SEO number Lighthouse prints stays at 66 for that reason and the script treats the rest of the category as the target.

## Deploy

Push to a branch and open a PR: Vercel (`mcd-new-2-0`) builds a preview at `mcd-new-2-0-git-<branch>-fornya.vercel.app` and comments the URL on the PR. Merging to `main` deploys the production build, which stays at the `*.vercel.app` address, protected and noindexed. `pnpm build` runs the content and CSS lints first and stops on a hit.

## Go-live checklist (appendix §2a)

Do none of this until told.

1. Choose the real domain and confirm which Vercel project holds it today; remove it there.
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain and add the root domain and `www` to this project.
3. Switch DNS.
4. Remove deployment protection on production only.
5. The noindex does **not** lift: Claims 24/7 stays `noindex, nofollow` on the real domain too (it is a PPC-only site and must not compete with 1.0). Confirm the header, the meta and the disallow-all `robots.txt` on the real domain, and that canonicals carry it.
