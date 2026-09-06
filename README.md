# Motor Claims Department 2.0

The second Motor Claims Department front end: same company, same claims, louder brand. Next.js 15 (App Router, TypeScript) on Vercel; claims post to the shared 1.0 claims API. `CLAUDE.md` is the build brief (§0 is what differs from 1.0; the appendix carries the shared behaviours); everything in `design/` is the visual and structural spec and is reproduced, not redesigned.

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
pnpm lint:content   # appendix §10 rules over content/ (fails the build on a hit)
pnpm lint:css       # §0 rules that live in code: no uppercase, no italics, ink on the bright, no 1.0 palette, no box behind text
pnpm test           # unit tests (node --test)
pnpm test:e2e       # Playwright, against a production build (run `pnpm exec playwright install` once)
```

## Environments and staging

The Vercel project is **`mcd-new-2-0`** (team `fornya`), production at `https://mcd-new-2-0.vercel.app`. There is no custom domain, and there is no Railway service for 2.0.

| | production (`main`, `.vercel.app`) | preview (every branch and PR) |
|---|---|---|
| Custom domain | none | none |
| Deployment protection | **on** (Vercel project setting) | **on** |
| `X-Robots-Tag: noindex, nofollow`, `<meta name="robots">`, disallow-all `robots.txt` | yes | yes |
| Canonical URLs | `NEXT_PUBLIC_SITE_URL` (the `.vercel.app` URL) | same |

- **Set `NEXT_PUBLIC_SITE_URL` in Vercel** to `https://mcd-new-2-0.vercel.app` for all environments. Unset, the site falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then to `http://localhost:3000`.
- The noindex is keyed off the request host against `NEXT_PUBLIC_SITE_URL`, never off `VERCEL_ENV` (`src/lib/host.ts`). While that URL is a `.vercel.app` address, every host is staging: `src/middleware.ts` sets the header, `src/app/robots.ts` serves disallow-all, and the root layout renders the noindex meta. When a real domain is set in that one variable and attached to the project, requests from that host (with or without `www`) become live and everything else stays noindexed. `tests/unit/staging.test.ts` and `tests/e2e/staging.spec.ts` cover both sides.
- `/claim/*` carries `noindex, nofollow` on every host (`next.config.ts`).
- Deployment protection is a Vercel project setting (Settings → Deployment Protection). It sits on top of the noindex, not instead of it.
- Per-environment variables live in Vercel. No secrets in the repo; `.env.example` lists what exists.

## Project layout

```
CLAUDE.md               the build brief
design/                 signed-off 2.0 mockups, nav and font options, the logo; the 1.0 tpl-*.html template mockups and the sitemap
content/                MDX pages with frontmatter: the SEO set, utility pages, Phase 2/3 drafts
content.rules.json      content lint rules (appendix §10)
scripts/                lint-content.mjs, lint-css.mjs
src/app/                App Router routes and global CSS
src/fonts/              self-hosted Archivo Black 400 and Archivo 400/700 (WOFF2, SIL OFL)
src/lib/                site config, host and staging rules
src/styles/tokens.css   §0 design tokens as custom properties
tests/unit/             node --test
tests/e2e/              Playwright (390×844, 430×932 and desktop projects)
```

## Design tokens

`src/styles/tokens.css` holds the §0 values: ink, yellow, cream, pale, ochre, muted, line, green; the contrast pairings (`--on-yellow`, `--on-ink`, `--on-ink-button`, …); Archivo Black and Archivo; the highlight bar; radii, grid, spacing, motion and the focus ring, with the type scale, button heights, circle sizes and the mobile nav and strip heights read from the mockups in `design/`. The page body is white and the hero, nav and cards take cream, as the mockups set them. Components use tokens, never raw values. Five rules are enforced by `pnpm lint:css` rather than documented:

- sentence case everywhere: no `text-transform: uppercase`
- never italics
- ink text on yellow, pale and green, never white or cream; yellow type only on ink buttons
- no coral, marine, sky or stone: the 1.0 palette does not exist here
- the highlight is a bar under the words (`.hl` in `globals.css`), never a box behind them; the band's chip is the one exception

## Add a page

Pages are MDX files under `content/<section>/<slug>.mdx`. The route comes from the `slug` in the frontmatter, not the folder. Adding a page is "add a file, open a PR"; every PR gets a Vercel preview.

```bash
pnpm new-page --template pillar --slug /accident-recovery/ --title "Accident recovery"
```

That copies the template's lorem-ipsum skeleton from `content/_templates/` as a draft. Write the page, remove `draft: true`, open a PR. Frontmatter fields (appendix §10):

| Field | Purpose |
|---|---|
| `slug`, `template` | The route and one of `pillar`, `process`, `comparison`, `guide`, `location`, `article`, `utility` |
| `title`, `description` | `<title>` (≤60 characters) and meta description (≤155) |
| `kicker`, `h1`, `highlight`, `lead` | The hero: eyebrow, H1, the one or two words of the H1 that carry the yellow bar, and the lead, which renders as the page's H2 |
| `lastReviewed`, `author` | The meta line and Article schema |
| `breadcrumb` | Parent pages in order; Home is added |
| `photo` | `alt` and a production `note` until the real photo exists |
| `faq` | Rendered after the body and emitted as FAQPage schema from the same data |
| `related` | Slugs of related pages; drafts are dropped at build time |
| `schemaType`, `steps` | Override the template's schema; HowTo steps by heading id |
| `draft` | `true` keeps the page out of the build and the sitemap |

The templates (`src/templates/ContentPage.tsx`) come from the 1.0 `design/tpl-*.html` mockups restyled to 2.0: breadcrumb, text hero, the keeps strip (not on guide and article), the sticky "On this page" list beside the prose, the FAQ, the CTA pair, related pages, the band. In the body: H2s become the "On this page" list (ids are GitHub-style slugs of the heading text; H2s starting "Step 1." feed HowTo schema), and `<Callout>`, `<Steps>`, `<ThemUs>`, `<Figure>` and `<Muted>` are available. Links to pages that do not build yet render as plain text, in prose, the header and the footer alike, so nothing 404s.

`pnpm stubs` creates a draft file for every sitemap page that has none; drafts for Phase 2 and 3 are in place. `pnpm lint:content` runs before every build and stops it on an exclamation mark, an all-caps heading, "week(s)", or a banned phrase.

## Claim-now and the claims API

`/claim-now/` is the stub: a hero, the reg box, and the `#claim-flow` slot. The reg box posts to `/api/claim-start/` (the site's own route handler: honeypot, rate limit, reg validation), which forwards to the shared 1.0 claims API when `CLAIMS_API_URL` and `CLAIMS_API_KEY` are set, always with `source: "mcd2"`, and otherwise acknowledges with a stub reference. There is no claims service in this repo. Ollie's question flow mounts on `#claim-flow` (`data-claim-flow-mount`, with `data-ref` and `data-reg` once the reg is accepted) exactly as in 1.0; when it completes it sends the visitor to `/claim-now/thank-you/?ref=…`, which fires the conversion.

## Tracking and consent

See `docs/tracking.md`: 2.0's own GTM container loads only after consent, the banner is the 1.0 banner in 2.0 colours, the choice is one cookie (`mcd2_consent`), and every `dataLayer` event is specified there. Legal pages carry page views only.

## Add an insurer landing page

Landing pages live at `/claim/<slug>/`, one JSON file each in `src/data/landing/`, rendered by `src/templates/LandingPage.tsx` from `design/mcd-2-0-goskippy-landing*.html`. Copy `goskippy.json`, change `slug`, `insurer`, `title`, `description`, `h1` and (if needed) `h2` and `mobileSub`, and the page builds. Rules that hold in code:

- The insurer name may appear only in the H1 and the independence line (the template renders the line from `insurer`). `validateLanding` fails the build if it turns up in the description, H2, sub line or facts.
- Every `/claim/*` page is `noindex, nofollow` (header and meta), canonical to itself, off the sitemap, and disallowed in `robots.txt` on a live host.
- The independence line renders directly under the hero and strip.
- Sourced facts go in `facts[]` with `label`, `theirs`, `ours`, `source`, `sourceUrl` and `checkedOn`, rendered verbatim with the date. Leave the array empty and the section does not render.
- Proof claims (the wait row, the 90-minute card, the header chip) follow `src/data/claims.json` as everywhere else.

`tests/e2e/landing.spec.ts` covers all of it, including the fold lock at 390×844 and 430×932.

## Deploy

Push to a branch and open a PR: Vercel (`mcd-new-2-0`) builds a preview at `mcd-new-2-0-git-<branch>-fornya.vercel.app` and comments the URL on the PR. Merging to `main` deploys the production build, which stays at the `*.vercel.app` address, protected and noindexed. `pnpm build` runs the content and CSS lints first and stops on a hit.

## Go-live checklist (appendix §2a)

Do none of this until told.

1. Choose the real domain and confirm which Vercel project holds it today; remove it there.
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain and add the root domain and `www` to this project.
3. Switch DNS.
4. Remove deployment protection on production only.
5. The noindex lifts on its own once the host matches `NEXT_PUBLIC_SITE_URL`; confirm there is no `X-Robots-Tag` and no robots meta on the real domain.
6. Confirm `sitemap.xml` and `robots.txt` resolve on the real domain.
7. Submit the sitemap in Search Console.
