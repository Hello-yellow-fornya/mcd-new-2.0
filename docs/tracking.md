# Tracking and consent

CLAUDE.md §0 and appendix §8. 2.0 has its own Google Tag Manager container (`NEXT_PUBLIC_GTM_ID`), carrying GA4 and the Google Ads conversion tags. Nothing loads before consent, and nothing loads at all while the variable is unset.

## How consent works

1. On every page `Analytics` pushes consent-mode defaults to `window.dataLayer`: every storage type `denied`, with `functionality_storage` and `security_storage` `granted`.
2. Events are pushed to `window.dataLayer` from the first paint, so nothing is lost while the visitor decides.
3. The banner (`ConsentBanner`, the 1.0 banner in 2.0 colours) offers two equal choices. The choice is stored in the `mcd2_consent` cookie for a year (`{ v, analytics, ads, at }`), with no other cookie set.
4. "Yes, measure visits" pushes a consent `update` with `analytics_storage` and the three ad signals `granted`, then injects `gtm.js` for `NEXT_PUBLIC_GTM_ID`. "No, just the essentials" pushes the update as `denied` and loads nothing.
5. On a later visit GTM loads immediately only if the stored choice was a grant.
6. "Cookie settings" in the footer reopens the banner.

Inside GTM, GA4 and Google Ads tags must use the built-in consent checks (consent mode v2), not custom triggers. No tag may fire on `consent_update` when the update is `denied`.

## dataLayer events

| Event | When | Parameters |
|---|---|---|
| `page_view` | Every route, including client-side navigation | `page_path`, `page_title`, `legal` (`true` on the legal pages: no other events fire there) |
| `phone_click` | Any `tel:` link | `phone` (digits as in the href), `placement` (`header`, `drawer`, `hero`, `band`, `footer`, the nearest `[data-placement]`, or the section id), `cta` (the link's `data-cta`), `page_path` |
| `reg_submit` | Reg box submitted | `reg_length`, `placement` (`claim-now`) |
| `claim_start` | Reg accepted by `/api/claim-start/` | `ref`, `placement` |
| `claim_submitted` | `/claim-now/thank-you/` viewed after the claim flow completes | `ref` when the flow passes one as `?ref=` |
| `consent_update` | A consent choice made or changed | `analytics`, `ads` |

Conversions to configure in GTM: `claim_submitted` (form), `phone_click` (call), `reg_submit` (reg box). Call tracking via dynamic number insertion works on the rendered `tel:` text; the number is never an image.

## Landing pages

`/claim/*` pages carry the same layer. Their primary conversion is `phone_click` with `placement: hero` and `cta: call`.

## The claims API

`/api/claim-start/` is the site's own endpoint. It validates the reg, honours a honeypot, rate-limits per address, and forwards to the shared 1.0 claims API at `CLAIMS_API_URL` (`POST /v1/claims/start`, bearer `CLAIMS_API_KEY`) with `source: "mcd2"` set server-side, whatever the client sends. Without the variables it acknowledges with a stub reference so the visitor is never stuck.
