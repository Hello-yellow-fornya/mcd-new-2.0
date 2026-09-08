# MCD 2.0 — build brief for Claude Code

The second Motor Claims Department front end: same company, same claims, louder brand. Next.js on Vercel, one Git repo, **shared Railway claims API with the 1.0 site** (see §7). Everything below is decided unless marked **[assumption]**.

## 0. What is different from the 1.0 build

Read this first; the rest of the document is the 1.0 brief with 2.0 values, kept whole so the behaviours (staging, consent, compliance, tests) are identical across both sites.

- **Design files** in `/design/`: `mcd-2-0-homepage-concept.html` (desktop homepage, signed off), `mcd-2-0-homepage-mobile-v2.html` (mobile homepage, signed off — fold-locked hero, the spec for mobile), `mcd-2-0-goskippy-landing.html` and `mcd-2-0-goskippy-landing-mobile.html` (insurer landing page, desktop and mobile), `mcd-2-0-nav-options.png` (option 4 is the header), `mcd-logo-motor-mark.png` and `mcd-logo-mono-and-square.png` (the logo; in 2.0 the disc is yellow #F3CD3E with ink spokes), `mcd-2-0-font-options.png` (C is the pairing).
- **Name (2.0 only):** the site trades as **Claims 24/7**. Every title, meta, Open Graph card, the Organization schema name, UI copy and the wordmark say "Claims 24/7"; the legal line stays "Motor Claims Department Ltd, trading as Claims 24/7" pending the client. Independence line: "Independent accident management company. Not an insurer — Claims 24/7 helps drivers with any insurer claim from the driver who hit them."
- **Footer surface (amends the token note below):** the footer sits on ink and carries the on-ink lockup.
- **Indexing (2.0 only, replaces §2a's host rule):** Claims 24/7 is a PPC-only site. Every page (content, homepage, landing, utility) is `noindex, nofollow`: the meta tag, the `X-Robots-Tag` header and a disallow-all `robots.txt`, on every host, real domain included. No `sitemap.xml`. Canonicals point to self on the 24/7 URL, never to 1.0. A test walks every route for this and for links to the 1.0 domain.
- **Content (2.0 only):** Alex's 22 pages, lifted into MDX through the 24/7 template shells (`scripts/alex-to-mdx.py`). Because nothing is indexed the copy may be rewritten in 24/7's voice, on these rules: the facts don't change (the catch, the substantiation-gated claims, "nothing goes through your policy", the honest "when your insurer is the right call" section); the copy lint still runs; every page keeps its schema (Organization as Claims 24/7, BreadcrumbList, the page entity, FAQPage from the visible questions); the reviewed/author line and the related-pages block are gone, the jump list stays where a page is long; the GoSkippy landing page keeps its sourced-and-dated facts exactly as on 1.0. The review date and named handler are simply dropped; the legal line and the registered address stay as blocking `[TODO]` items.
- **Tokens (replace §3):** `ink #19180F`, `yellow #F3CD3E` (the one bright — buttons, chips, icon circles, underlines), `cream #F7F5EF` (hero, header, cards and footer; the page body is white, as the mockups set it), `pale #FBF0BF` (tints), `ochre #B08900` (eyebrows, stars), `muted #54524A`, `line #E6E2D6`, `green #7DC24A` (functional only). Ink text on yellow; yellow text on ink buttons. No coral, no marine, no shards, no photography in the hero.
- **Type (replace §4):** `display` Archivo Black 400 for headlines, big print, card titles, the band; `body` Archivo 400/700 for everything else. Self-host both as WOFF2. Sentence case, no exclamation marks.
- **Highlight:** a bar under one or two words — `text-decoration: underline` in yellow, thickness .14em, offset .08em, `text-decoration-skip-ink: none` — never a box behind text except the band's chip.
- **Header (replace §4 SiteHeader):** sticky cream bar, 84px desktop: logo hard left at 34px (the Claims 24/7 wordmark, §4a); sections How it works · Non-fault accident · Services ▾ · Advice · About with a yellow underline on the active page; a white "Lines open 24/7 · Avg wait 1 min" chip (substantiation-gated); a yellow phone-number pill and an ink "Start your claim" pill hard right. Mobile 64px: logo left at 30px, ink "Call now" pill and burger hard right, nothing else; the proof line lives in the drawer.
- **Homepage sections (replace §5/§9 order):** hero (two columns on desktop: H1 "Non-fault accident?" with the bar under "Non-fault", H2 "Choose the smarter way to claim." with the bar under "smarter way", ink + yellow CTA pair, wait row; the 2×2 proof grid on the right) → `ClaimsStrip` (ink, yellow icon circles, scrolling) → review band → the band (three white Archivo Black lines, "We work for you." in a yellow chip with ink text, two small outlined yellow pills) → their/your table with its CTA pair → independence line → benefits with icons → How it works (four step cards) → FAQ → footer. Mobile: the hero is fold-locked with one flexible gap so the `ClaimsStrip` ends exactly on the fold on every viewport; assert at 390×844 and 430×932.
- **Copy:** "Start your non-fault claim" on primary buttons; "Or start your no-fault claim online" on the outlined one; the H2 rule on every page.
- **Landing pages:** built from the 2.0 GoSkippy files; same `noindex`, independence-line and substantiation rules as 1.0.
- **Scope [assumption]:** Phase 1 is the homepage, the two landing pages, claim-now (stub + Ollie's slot), about, contact and the legal set. The SEO template set is **not** replicated for 2.0 unless told; stub the sitemap routes as drafts.
- **Backend:** no `api/` in this repo. Post to the 1.0 claims API with `source: "mcd2"`, using `CLAIMS_API_URL` and a 2.0-specific `CLAIMS_API_KEY`. Claim-now mounts Ollie's flow at `#claim-flow` exactly as in 1.0.
- **Tracking:** its own GTM container (`NEXT_PUBLIC_GTM_ID`); same consent banner, restyled in 2.0 colours.
- **No sticky call bar on 2.0.** The header's "Call now" pill is the persistent call action on mobile. The appendix's `StickyCallBar` (§4) and the landing-page call bar (§6) do not apply here.
- **Independence line placement:** on the homepage after the their/your table, as the mockup has it; on landing pages directly under the hero and strip (appendix §6).
- **Case exceptions:** the mobile hero's big call pill is lower-case "call now", as in the mobile mockup, a deliberate exception to sentence case. The header's pill is "Call now". Footer column headings are sentence case, not the mockup's CSS caps.
- **Repo and hosting:** this repo is `mcd-new-2.0`; anything already in it is superseded — overwrite freely. The site runs on the Vercel project's own `*.vercel.app` URL for now: no custom domain, deployment protection on for every deployment, `noindex` and a disallow-all robots on every deployment. Set `NEXT_PUBLIC_SITE_URL` to the `.vercel.app` URL for canonicals until a real domain is chosen; when one is, changing that one variable and attaching the domain is the whole switch.

---

## Appendix — the 1.0 brief, for the shared behaviours


Fresh build. No migration, no redirects. Next.js on Vercel for the site, Railway for backend services, one Git repo. Everything below is decided unless marked **[assumption]** — those are defaults to build to now and swap later if the client says otherwise.

---

## 1. What you are building

A marketing and lead-generation site for Motor Claims Department (MCD), an independent UK accident management company for non-fault drivers. Two jobs: rank for the non-fault claims category (SEO pages), and convert paid traffic into calls and claim forms (landing pages). The phone number is the product — `0800 048 0048` appears in the nav, hero, every section CTA, footer, and a sticky call bar on mobile.

Source material in `/design/` (copy these files into the repo as-is; they are the spec):

- `MCD-brand-guidelines-v2.md` — tokens, type, components, rules. **Section 3 (colour) and 4 (type) are the design tokens. Section 6 is the component list.**
- `mcd-site-fullbleed.html` — homepage v1, signed off
- `tpl-*.html` — twelve SEO page templates (pillar, process, comparison, guide, location, article)
- `mcd-lp-goskippy-mobile-grid.html`, `mcd-lp-no-fault-accident.html` — paid landing pages (mobile-first)
- `mcd-review-carousel.html` — review band component
- `mcd-nav-bar-marine.png` — the header, three states
- `MCD-design-system-brief-claude-design.md` — supersedes the guidelines MD where they differ
- `mcd-shards-*.svg`, `mcd-sweep-*.svg` — background patterns
- `motorclaimsdepartment_sitemap.html` — the approved sitemap and phasing

Treat the HTML templates as the visual and structural truth. Reproduce them as React components; do not redesign.

---

## 2. Stack

- **Next.js 15, App Router, TypeScript.** Static generation for all marketing pages; server functions only where a form posts.
- **Vercel** for the site: the project is **`the 2.0 Vercel project`** (the `mcd-new-2.0` project is retired — do not deploy to it). Preview deployments on every PR; the `.vercel.app` production build from `main` is staging until the real domain is attached.
- **Railway** for backend services: the claims API (form intake, reg lookup proxy, CRM hand-off) and any queue/DB it needs. **[assumption]** Postgres on Railway for submissions; keep it minimal.
- **Git**: single repo, `main` protected, feature branches, conventional commits. `README.md` explains how to add a page.
- **Styling**: CSS Modules or vanilla CSS with the tokens as custom properties. No Tailwind — the templates are hand-written CSS and the guidelines expect exact values. No component library.
- **Fonts**: self-host Libre Franklin 900 and Public Sans 400/600/700 as WOFF2 via `next/font/local`. Never load from Google's CDN in production (GDPR).
- **Images**: `next/image`, WebP/AVIF, width and height always set, hero eager, everything else lazy. Alt text is a scene description, written by content, never generated.
- **Content**: **[assumption]** MDX files in `/content/` with frontmatter (title, description, slug, template, schema fields, lastReviewed, author). Alex Templeman writes copy; adding a page must be "add a file, open a PR". Do not add a CMS unless asked.

---

## 2a. Environments and staging

The site is not to be served from `the 2.0 site's `.vercel.app` URL` until told. Build to Vercel's default URLs and treat them as staging.

- **No custom domain on the Vercel project at launch of staging.** Production deploys to the auto-assigned `*.vercel.app` address; every branch and PR gets its own preview URL. Do not add the root domain or `www`.
- **Optional staging subdomain:** if the client wants a branded link, add only `staging.the 2.0 site's `.vercel.app` URL` as a custom domain (one CNAME to Vercel). The bare domain stays untouched. At go-live, the root domain and `www` are added the same way.
- **Deployment protection on** for every deployment of `the 2.0 Vercel project`, including the `.vercel.app` production build, until the real domain is attached: Vercel authentication or a password, so the client and Alex can view it and search engines, ad platforms and competitors cannot.
- **Site-wide `X-Robots-Tag: noindex, nofollow`** plus `<meta name="robots" content="noindex">` and a disallow-all `robots.txt` on every deployment that is not served from `the 2.0 site's `.vercel.app` URL`. Key this off the request host matching `NEXT_PUBLIC_SITE_URL`, not off `VERCEL_ENV` — the `.vercel.app` production build is staging and must stay noindexed. Covered by a test. This is in addition to the password, not instead of it.
- **Canonical URLs point at the final domain from day one** (`https://the 2.0 site's `.vercel.app` URL/...`), configured from a single `NEXT_PUBLIC_SITE_URL` env var, so nothing is rewritten at go-live.
- **Railway runs a staging environment too** — separate service, separate database, separate email target — so test claim submissions never reach the real claims inbox. Environment variables per environment; no secrets in the repo.
- **Go-live checklist** (do not do any of this until told): confirm which Vercel project currently holds `the 2.0 site's `.vercel.app` URL` (it is serving a holding page today) and remove it there; add root + `www` to `the 2.0 Vercel project`; switch DNS; remove deployment protection on production only; the noindex lifts automatically once the host matches `NEXT_PUBLIC_SITE_URL`; confirm `sitemap.xml` and `robots.txt` resolve on the real domain; submit the sitemap in Search Console.

---

## 3. Design tokens (from guidelines §3–4)

```
--ink:    #16324F   type, primary buttons, dark surfaces
--blue:   #3D6D9C   headline highlight words, links, eyebrows
--sky:    #BFD6E6   highlight underlay, tints
--stone:  #EDE9E1   section surfaces, cards on white
--paper:  #F7F5F0   page background
--white:  #FFFFFF
--coral:  #F2694B   the one bright: phone CTAs, Start your claim, icon circles
--green:  #7DC24A   functional "handled"/tick state only
--muted:  #5B6570   secondary text
--line:   #D9D4C8   hairlines
display: Libre Franklin 900
body:    Public Sans 400 / 600 / 700
radii:   cards 20px · photo frames 24px · reg field 14px · buttons and pills 999px · icon circles 50%
grid:    max-width 1140px, 24px gutters; section padding 72px desktop / 48px mobile
motion:  150–200ms ease-out; nothing moves uninvited
```

Rules that must be enforced in code, not just documented: ink text on coral/sky/green (never white); white text only on ink/blue; sentence case everywhere (no CSS uppercase); coral appears once per view as the bright, except the section CTA pair.

---

## 4. Components (build these, then compose pages from them)

Each maps to markup in the templates. Names are suggestions; keep them consistent.

- `SiteHeader` — **marine bar, decided (see `design/mcd-nav-bar-marine.png`).** Background `ink`, 72px tall desktop, 64px mobile, sticky. The logo replaces the text wordmark: the mono white horizontal lockup from `design/mcd-logo-mono-and-square.png`, 28px tall desktop / 22px mobile, mark inverting to ink. (The PNG shows the wordmark as text; the logo supersedes it.) Links in Public Sans 16px at 88% white, active page white with a 2px `coral` underline; "Services" carries a dropdown to the service children. Right: a `coral` pill with the solid phone icon — desktop shows the number (46px, 16px text), mobile shows "Call now" as a full pill (40px, 14px text) between the wordmark and the burger, never an icon-only circle. Mobile burger opens a full-width drawer on `paper`: links in Public Sans 700 18px with hairline dividers, then a full-width coral "Call 0800 048 0048" button (56px) and the line "A person in the UK picks up." beneath. Homepage only: the same bar rendered transparent over the photo hero, switching to the solid marine bar once it goes sticky. `StickyCallBar` still appears after the hero scrolls away on landing pages.
- `Breadcrumb` — with BreadcrumbList JSON-LD.
- `HeroText` — kicker, H1, lead, CTA pair, meta line (last reviewed, author), photo placeholder slot.
- `HeroPhoto` — full-bleed photo hero from the homepage: marine scrim from the left, bottom tint, copy block at the Cazoo proportions, reg box + coral call, three transparent pills bottom-right. Mobile: tall crop, bottom scrim, stacked.
- `RegBox` — white field, "Enter your reg" label inside, placeholder AB12 CDE in Franklin 900, coral arrow. Formats input to `AB12 CDE` on the fly; accepts any case/spacing. Optional live lookup (see §7).
- `KeepsStrip` — three icon items (no excess, keep no claims, like-for-like car).
- `Toc` — sticky "On this page" from the H2s.
- `Prose` — article body styles; H2s get ids and `scroll-margin-top`.
- `Callout` — stone box with a bold lead line. Variants: default, catch.
- `Steps` — 2×2 step cards.
- `ThemUs` — the two-column table with cross/tick marks (them/us, you/we variants).
- `Faq` — `<details>` accordion, first open, with FAQPage JSON-LD generated from the same data.
- `RelatedPages` — three cards.
- `Band` — ink band: "Your insurer has a claims department. It works for your insurer. **We work for you.**" with the coral underline.
- `ReviewCarousel` — auto-scrolling, pauses on hover/touch, reduced-motion fallback to a scrollable row. Data from a JSON file until the review platform is wired.
- `ProofGrid` — 2×2 proof cards (landing pages).
- `IndependenceLine` — "Independent accident management company. Not an insurer…" strip.
- `SectionCta` — coral Start your claim + coral Call (with icon). Every content section ends with it.
- `SiteFooter` — links, phone in Franklin coral, legal line with the FCA placeholder.
- `Icon` — the solid icon set as an SVG sprite; circle variants: coral/ink, sky/ink, ink/coral.
- `Pattern` — the shard and sweep SVGs as CSS backgrounds, per colourway.

---

## 4a. Logo (Claims 24/7 suite v2, a wordmark)

Sources in `design/logo/`, the v2 suite as delivered: "Claims" in Archivo Black with "247" set small and high beside it in the accent colour. No mark, no lines. The words are `<text>` in those files on purpose so they stay editable; `scripts/logo-build.mjs` (prebuild, `pnpm logo`) converts every word to outlines with the self-hosted Archivo Black, writing the build output to `public/logo/` and `public/favicons/`, so the type never falls back to another face.

- **Lockups:** `claims247-logo-on-light`, `-on-light-yellow`, `-on-cream`, `-on-yellow`, `-on-ink`, `-mono-ink`, `-mono-white` (640×200 frame). **Rule: "Claims" takes the wordmark colour; "247" takes the accent**: the brand yellow on light, cream and ink, ink on yellow, the wordmark colour in the monos. The suite's ochre "247" (`-on-light`, `-on-cream`) is not used on the site; the component sets the accent yellow everywhere it can.
- **Squares** in `design/logo/square/`: `claims247-square-247-on-*` ("247" alone), `-c247-on-*` (a large "C" with "247" high), `-stacked-on-*` ("Claims" over "247"), each on yellow, ink and white. The stacked square on yellow is the social avatar (`pnpm logo:png` cuts the PNG).
- **Favicons** in `design/logo/favicons/`, as delivered: `favicon-source.svg` (the stacked square on ink), `favicon-16-source.svg` ("247" alone on ink, for tab size), PNGs at 16, 32, 48, 180, 192, 512 and 1024, and "247"-only PNGs at 16 and 32. `pnpm logo` copies them to `public/favicons/`, writes `src/app/icon.svg` and `src/app/apple-icon.png`, and packs `src/app/favicon.ico` from the two "247" tiles; the manifest points at the 192, 512 and 1024 PNGs.
- **Component:** `<Logo surface="light | light-yellow | cream | yellow | ink | mono-ink | mono-white" />` renders the wordmark inline from `lockup.generated.tsx`, its viewBox the content box of the drawn letters. **Header:** on-cream at 34px tall desktop, 30px mobile. **Footer:** on-ink.
- **Clear space:** the height of "247" on all sides. **Minimum size:** 100px wide; squares 24px.

---

## 5. Page templates and routing

Routes come from the sitemap. Phase 1 live at launch, Phase 2/3 stubbed as MDX with `draft: true` so they don't build.

| Template | Component | Schema | Launch pages |
|---|---|---|---|
| Home | `HomePage` | Organization, WebSite | `/` |
| Pillar | `PillarPage` | Organization, Breadcrumb, Service or Article, FAQPage | `/accident-management-company/`, `/non-fault-accident/`, `/third-party-insurance-claim/`, `/non-fault-accident-courtesy-car/`, `/credit-hire/` |
| Process | `ProcessPage` | + HowTo with step anchors | `/how-accident-management-works/` |
| Comparison | `ComparisonPage` | + Article | `/accident-management-vs-insurance/` |
| Guide | `GuidePage` | + HowTo, no keeps strip | `/what-to-do-after-a-car-accident/` |
| Location | `LocationPage` | + Service with `areaServed` (LocalBusiness only with a real address) | `/our-service-areas/` |
| Article | `ArticlePage` | + Article, no keeps strip | `/how-to-prove-fault/rear-end-collision/`, `/side-impact-collision/`, `/car-park-accidents/` |
| Landing (paid) | `LandingPage` | none; `noindex, nofollow` | `/claim/goskippy/`, `/claim/no-fault-accident/` (+ one per insurer, from the same template with a config file) |
| Utility | `UtilityPage` | Organization | `/claim-now/`, `/about-us/`, `/contact-us/`, `/privacy-policy/`, `/terms/`, `/complaints/`, `/cookies/` |

Slug rules: trailing slashes on, lowercase, `non-fault` on the site, `no-fault` only inside `/claim/`. `/how-it-works/` does not exist — it is `/how-accident-management-works/`.

Generate `sitemap.xml` (excluding `/claim/*` and drafts), `robots.txt` (disallow `/claim/`), a branded 404, and `manifest` / favicons once the logo exists.

Schema is generated from frontmatter + page data, never hand-typed, so FAQ schema always matches the visible FAQ.

---

## 6. Landing pages (`/claim/*`)

Mobile-first pages from `mcd-lp-goskippy-mobile-grid.html` and `mcd-lp-no-fault-accident.html`. Insurer pages are one template plus a config: insurer name, H1, any sourced facts with `source`, `sourceUrl`, `checkedOn` fields rendered verbatim with the date. Rules that must hold in code:

- `noindex, nofollow`; excluded from sitemap; canonical to self.
- Insurer name appears only where the config puts it (H1 and the independence line). Never in ad copy — that's the ads account's job, but the page must not depend on it.
- The independence line renders on every landing page, directly under the hero.
- "Call now" pill is the primary CTA; online CTA sits at the fold; sticky call bar appears after the hero.
- Proof-row claims (avg wait, timings) come from a single `claims.json` with a `substantiated: true|false` flag; unsubstantiated ones do not render. This is how compliance is enforced.

---

## 7. Claim-now and the reg box

**[assumption]** Until the client specs it: a three-step form — reg + contact details → what happened (date, where, other driver's details, whose fault, photos optional) → confirm. Posts to the Railway API, which stores the submission, emails the claims team, and later hands off to the CRM/Proclaim integration. Server-side validation, honeypot + rate limiting, no third-party form SaaS.

Reg lookup: **[assumption]** off at launch. If enabled, proxy the DVLA Vehicle Enquiry API through Railway (never expose the key), show make/model/colour back to the user as confirmation only, and add it to the privacy policy.

The phone number on every page is a `tel:` link. Call tracking (dynamic number insertion) is added via the tag manager, so the number must render as text inside a stable element, not an image.

---

## 8. Tracking and consent

- Google Tag Manager, with GA4 and Google Ads conversion tags loaded only after consent.
- A consent banner in the brand style (not a stock CMP look), two choices, no dark patterns, revisitable from the footer. **[assumption]** Cookiebot or an open-source CMP wired to GTM consent mode v2.
- Conversions: form submit (thank-you route), `tel:` click, reg-box submit. Fire as GTM events with a documented `dataLayer` spec.
- No tracking on the legal pages beyond page views.

---

## 9. Performance, accessibility, SEO baseline

- Lighthouse mobile: Performance ≥ 90, Accessibility 100, SEO 100 on every template. Budget: LCP < 2.0s on 4G, CLS < 0.05, total JS < 100KB on marketing pages (the carousel is CSS; keep it that way).
- Semantic landmarks, skip link, visible focus rings (2px ink, 2px offset; white on dark), touch targets ≥ 44px, every icon labelled or hidden, every image with alt. Reg field has a real `<label>`.
- One H1 per page, H2s with ids matching the TOC, canonical on every page, OG/Twitter tags from frontmatter, `max-image-preview:large`.
- Test the fold: on a 390×844 viewport the landing-page hero must show headline, instruction, sub, proof grid, call pill, wait row, with the online CTA touching the bottom edge. Add a Playwright test that measures it.

---

## 10. Content workflow

- `/content/<section>/<slug>.mdx` with frontmatter: `title`, `description`, `template`, `kicker`, `h1`, `lastReviewed`, `author`, `faq[]`, `related[]`, `schemaType`, `draft`.
- Alex adds pages by PR. Vercel preview link on every PR. A `pnpm new-page --template pillar --slug ...` script scaffolds the file from the template's lorem-ipsum version.
- Lint: no exclamation marks, no all-caps headings, no "week(s)" phrasing, no "premium won't go up", banned-word list in `content.rules.json`. Fail the build on a hit.

---

## 11. Placeholders to wire when the client supplies them

- FCA status line and firm reference number in the footer — render a visible `[TODO]` in preview, block production build if unset
- The catch wording (pending MCD's policy on failed claims)
- The logo SVG set cut from §4a (favicons and app icons generated from the square)
- Real reviews feed; real handler names/photos; London local content
- `claims.json` substantiation flags flipped to true only with evidence

---

## 12. Definition of done for launch

- All Phase 1 routes build and pass Lighthouse targets
- Landing pages `noindex`, excluded from sitemap, independence line present, fold test passing
- Form posts to Railway, stores, emails, returns a thank-you route that fires the conversion
- Consent gating verified; no tags before consent
- Legal pages present; FCA placeholder resolved or build blocked
- README covers: run locally, add a page, add an insurer landing page, deploy, and the go-live checklist from §2a
- Staging verified: no custom domain, deployment protection on, noindex header present, canonicals pointing at the final domain, Railway staging isolated
