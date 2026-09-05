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

The site runs on the Vercel project's own `*.vercel.app` URL. There is no custom domain, and there is no Railway service for 2.0.

| | production (`main`, `.vercel.app`) | preview (every branch and PR) |
|---|---|---|
| Custom domain | none | none |
| Deployment protection | **on** (Vercel project setting) | **on** |
| `X-Robots-Tag: noindex, nofollow`, `<meta name="robots">`, disallow-all `robots.txt` | yes | yes |
| Canonical URLs | `NEXT_PUBLIC_SITE_URL` (the `.vercel.app` URL) | same |

- **Set `NEXT_PUBLIC_SITE_URL` in Vercel** to the project's production URL (for example `https://mcd-new-2-0.vercel.app`). Unset, the site falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then to `http://localhost:3000`.
- The noindex is keyed off the request host against `NEXT_PUBLIC_SITE_URL`, never off `VERCEL_ENV` (`src/lib/host.ts`). While that URL is a `.vercel.app` address, every host is staging: `src/middleware.ts` sets the header, `src/app/robots.ts` serves disallow-all, and the root layout renders the noindex meta. When a real domain is set in that one variable and attached to the project, requests from that host (with or without `www`) become live and everything else stays noindexed. `tests/unit/staging.test.ts` and `tests/e2e/staging.spec.ts` cover both sides.
- `/claim/*` carries `noindex, nofollow` on every host (`next.config.ts`).
- Deployment protection is a Vercel project setting (Settings → Deployment Protection). It sits on top of the noindex, not instead of it.
- Per-environment variables live in Vercel. No secrets in the repo; `.env.example` lists what exists.

## Project layout

```
CLAUDE.md               the build brief
design/                 signed-off HTML mockups, nav and font options, the logo (to be added)
content/                MDX pages with frontmatter (from step 5)
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

`src/styles/tokens.css` holds the §0 values: ink, yellow, cream, pale, ochre, muted, line, green; the contrast pairings (`--on-yellow`, `--on-ink`, `--on-ink-button`, …); Archivo Black and Archivo; the highlight bar; radii, grid, spacing, motion and the focus ring. The type scale is provisional until step 2 reproduces the mockups. Components use tokens, never raw values. Five rules are enforced by `pnpm lint:css` rather than documented:

- sentence case everywhere: no `text-transform: uppercase`
- never italics
- ink text on yellow, pale and green, never white or cream; yellow type only on ink buttons
- no coral, marine, sky or stone: the 1.0 palette does not exist here
- the highlight is a bar under the words (`.hl` in `globals.css`), never a box behind them; the band's chip is the one exception

## Deploy

Push to a branch and open a PR: Vercel builds a preview and comments the URL. Merging to `main` deploys the production build, which stays at the `*.vercel.app` address, protected and noindexed. `pnpm build` runs the content and CSS lints first and stops on a hit.

## Go-live checklist (appendix §2a)

Do none of this until told.

1. Choose the real domain and confirm which Vercel project holds it today; remove it there.
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain and add the root domain and `www` to this project.
3. Switch DNS.
4. Remove deployment protection on production only.
5. The noindex lifts on its own once the host matches `NEXT_PUBLIC_SITE_URL`; confirm there is no `X-Robots-Tag` and no robots meta on the real domain.
6. Confirm `sitemap.xml` and `robots.txt` resolve on the real domain.
7. Submit the sitemap in Search Console.
