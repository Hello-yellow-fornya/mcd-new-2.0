# Handover: Claims 24/7 (claims247.co.uk)

For the session that builds and hosts the site on its own domain. Repo: `Hello-yellow-fornya/mcd-new-2.0`, branch `main`. Everything below is merged; the last commit at handover is the one this file lands in.

## What this repo is

One Next.js 15 repo, three brands, two of them built here:

| Site id | Brand | Folder | Status |
|---|---|---|---|
| `mcd2` | **Claims 24/7** (legal name J&R MARKETING LIMITED trading as Claims247.co.uk) | `sites/mcd2/` | Complete: 32 pages, the GoSkippy landing page, claim-now, legal set. **This is the site going live.** |
| `ocr` | Claims Report Line (claimsreportline.co.uk) | `sites/ocr/` | Built, previewed, not going live yet |

`NEXT_PUBLIC_SITE` selects the site at build time (default `mcd2`). `next.config.ts` inlines the id and points `@site/*` at the site's folder. Components, the API client, consent, lint and tests are shared under `src/` and read the site through `@site`. Do not import one site's folder from another.

Design sources are in `design/`: the signed-off Claims 24/7 page files (`mcd-2-0-homepage-concept.html`, `mcd-2-0-homepage-mobile-v2.html`, `mcd-2-0-goskippy-landing*.html`, `claims247-third-party-insurance-claim*.html`), the layout rulebook `MCD-layout-rules.md`, the logo suite in `design/logo/`, and Perry's `claims247-proof-points.pdf`. `CLAUDE.md` is the original build brief; where it says "Motor Claims Department" read Claims 24/7.

## Run, check, test

```bash
pnpm install --frozen-lockfile
pnpm dev                    # predev writes the icon set; http://localhost:3000
pnpm check                  # site assets + typecheck (both tsconfigs) + eslint + content lint + css lint + unit tests
pnpm build && pnpm start -p 3100
pnpm test:e2e               # Playwright against the build on :3100 (set PLAYWRIGHT_CHROMIUM_EXECUTABLE if Chromium is elsewhere)
pnpm snapshot               # compares the running build with tests/snapshots/mcd2-routes.json; --write to regenerate after a reviewed change
pnpm audit:lh               # Lighthouse
```

The build runs `prebuild`: the icon set (`scripts/site-assets.mjs`), then the content and CSS lints, which fail the build on a hit. Node 22.18+ and pnpm 10.

## Hosting today, and going live

- Vercel project `mcd-new-2-0` (team `fornya`), production `https://mcd-new-2-0.vercel.app`, previews per branch. Deployment protection is **off on production** (the site loads without login); branch previews sit behind Vercel SSO.
- Variables the site reads (`.env.example`): `NEXT_PUBLIC_SITE_URL` (canonical and Open Graph origin; currently the `.vercel.app` URL), `NEXT_PUBLIC_GTM_ID` (nothing loads without it), `CLAIMS_API_URL` and `CLAIMS_API_KEY` (the shared claims API; claim-now posts with `source: "mcd2"`; unset, the endpoint acknowledges with a stub reference so a visitor is never stuck). No secrets in the repo.
- Going live on the domain (the go-live checklist in `README.md` and `CLAUDE.md` §2a): add the root domain and `www` to the Vercel project, switch DNS, set `NEXT_PUBLIC_SITE_URL=https://<domain>` for production, redeploy. Canonicals, Open Graph URLs and the e2e route walk all key off that one variable. Confirm the exact domain with the client first: the legal line says **Claims247.co.uk**.
- **Indexing is off on every page by design** and does not lift on the domain: `X-Robots-Tag: noindex, nofollow` from `src/middleware.ts` and `next.config.ts`, the robots meta from the root layout, a disallow-all `robots.txt`, no sitemap, canonicals to self, no links to motorclaimsdepartment.co.uk. The site is PPC-only and must not compete with the 1.0 site that carries the same copy. Lifting noindex is a decision for the client, not a go-live step.
- Tracking: `docs/tracking.md`. One GTM container, consent mode v2, the `mcd2_consent` cookie, the `dataLayer` events (`page_view`, `phone_click`, `reg_submit`, `claim_start`, `claim_submitted`). Legal pages fire page views only.

## The rules the code enforces

- **Copy lint** (`content.rules.json`, `scripts/lint-content.mjs`): no exclamation marks, sentence-case headings, no "week(s)", no premium promises, no repair timescales, the banned-phrase list. Fails the build.
- **CSS lint** (`scripts/lint-css.mjs`): no uppercase, no italics, ink text on the bright colours, none of the 1.0 palette, no box behind highlighted text.
- **Substantiation gating** (`sites/mcd2/claims.json`): a claim renders on production (`VERCEL_ENV=production`) only when `substantiated: true` with an evidence line; on previews everything renders with `data-unsubstantiated`. Currently gated and therefore **absent on production**: lines open 24/7, avg wait 1 min, fastest way to claim, the reviews score, and the six from the proof-points document (recovery within 90 minutes, answered within 1 minute, lifetime guarantee on repairs, BS 10125 and new parts, updates your way, no cut of the settlement). Flip a flag only with evidence.
- **Reviews** (`sites/mcd2/reviews.json`): `sample: true`, so the review band does not render on production until real reviews replace the placeholders.
- **Proof points** (`sites/mcd2/proof-points.json`): the canonical benefit wording. The 2×2 grid and the strip on every page render from it; no benefit copy is inline in a component. Short forms never say "eligible"; the eligibility line renders once per page (desktop only). Perry's PDF is the source of truth.
- **The catch** has one wording (`theCatch` in `sites/mcd2/copy.ts`), reused wherever it is stated.
- **Copy rules**: "Start your non-fault claim" on primary buttons, "Or start your no-fault claim online" on the outlined one; insurers are named only on their own landing page (`sites/mcd2/landing/*.json`, validated).
- **Fonts** are self-hosted Archivo Black and Archivo (`src/fonts/`). Never load from Google.
- **The unchanged-output test** (`tests/e2e/unchanged.spec.ts`, `tests/snapshots/mcd2-routes.json`) fails when a build serves anything different from the snapshot. Regenerate it with `pnpm snapshot --write` after a reviewed change, and commit it.

## Content

- Pages are MDX under `sites/mcd2/content/<section>/<slug>.mdx`; the route is the frontmatter `slug`. Templates: pillar, pillar-landing (the third-party page), process, comparison, guide, location, article, utility. `pnpm new-page` scaffolds one.
- Landing pages: one JSON per insurer in `sites/mcd2/landing/`, at `/claim/<slug>/`.
- The legal line renders from `sites/mcd2/site.ts` on every page (`legalLine`, `legal`, `FCA_STATUS_LINE`); the site is not FCA regulated and carries no FCA line.
- Privacy policy and terms carry the text published at goskippy.claims247.co.uk (last updated 7 July 2026), in the house style, with no hero CTAs.

## Open items (do not resolve silently)

1. **Blocking, with the client:** the legal line says Claims247.co.uk provides lead generation only; the body copy says "we manage your claim", "one dedicated claims handler", "we fight your corner", and the terms say "we do not handle claims". `docs/status.md`. The copy stays as designed until the client answers who "we" is.
2. **Lorem ipsum** remains on the Phase 2/3 content pages that launched as stubs (`grep -l Lorem sites/mcd2/content`), and on parts of about, contact, complaints and cookies. Real copy comes from the client (Alex).
3. **Claims evidence**: nothing in `claims.json` is substantiated. Until it is, production shows no wait row, no header chip and no review band, and the six proof-point sentences stay hidden.
4. **Phone numbers**: the site uses 0800 048 0048; the privacy policy and terms carry 0208 988 9508 as published on claims247.co.uk. Confirm both with the client.
5. **Reviews**: replace `sites/mcd2/reviews.json` with the real feed and set `sample: false`.
6. **The 1.0 site** carries the same copy; noindex on this site is the protection. Keep it until the client decides otherwise.
7. An edit table was sent late in the previous session (remove Article schema on all pages, plus link and typo fixes) and was never started; ask the client for it again.

## Also in this repo, not part of this go-live

- `sites/ocr/` is Claims Report Line, built to `design/ocr/`, previewed at `https://mcd-new-2-0-git-ocr-preview-fornya.vercel.app/` from the `ocr/preview` branch (the site id falls back to an `ocr/…` branch name). Branch `feat/28-offset-highlighter` is pushed and unmerged, awaiting the client. It needs its own Vercel project (`NEXT_PUBLIC_SITE=ocr` and its own variables) when it goes anywhere.
- The `mcd-new` repo holds the 1.0/3.0 builds and has open 3.0 PRs the client has not asked to merge.
