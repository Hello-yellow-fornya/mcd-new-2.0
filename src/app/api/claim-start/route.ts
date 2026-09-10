import { NextResponse } from 'next/server';
import { site } from '@/lib/site';
import { compactReg, isPlausibleReg } from '@/lib/reg';
import { CLICK_ID_KEYS, UTM_KEYS, type Campaign } from '@/lib/campaign';

/**
 * The site's own intake endpoint for the reg box (appendix §7). There is no
 * claims service in this repo (§0): this handler validates the reg, honours a
 * honeypot, rate-limits per address, and forwards to the shared 1.0 claims
 * API on Railway with the site's source ("mcd2" or "ocr"), using
 * CLAIMS_API_URL and this project's own CLAIMS_API_KEY. Ollie's question flow
 * owns everything after this.
 *
 * A claim that came from a paid click also carries the campaign the visitor
 * arrived with (src/lib/campaign.ts): the UTM set and the click id, forwarded
 * as `campaign` and summarised in `sourceDetail` so a lead can be attributed
 * without parsing the object. `source` stays the site id the API keys on.
 */
const SOURCE = site.source;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** The campaign off the request: only the keys we send, only string values, length-capped. */
function campaignFrom(value: unknown): Campaign | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const input = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS, 'landing', 'at'] as const) {
    const v = input[k];
    if (typeof v === 'string' && v.trim()) out[k] = v.trim().slice(0, 200);
  }
  return Object.keys(out).length ? (out as Campaign) : undefined;
}

function ref(): string {
  return `MCD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Send JSON.' }, { status: 400 });
  }
  // Honeypot: real visitors never fill "website".
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true, ref: ref() }, { status: 202 });
  }
  // The cap exists to slow down the internet, so loopback is exempt: `next
  // start` puts ::1 in x-forwarded-for for local requests, which would cap a
  // test run at ten submissions. On Vercel the platform overwrites the header
  // with the real client address, so this can never exempt a visitor.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
  const loopback = ip === '' || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
  if (!loopback && limited(ip)) return NextResponse.json({ ok: false, error: 'Too many attempts. Call us instead.' }, { status: 429 });

  const reg = compactReg(String(body.reg ?? ''));
  if (!isPlausibleReg(reg)) return NextResponse.json({ ok: false, error: 'Check the registration and try again.' }, { status: 422 });

  // The source is this site, always; the client only says where on the page the reg came from.
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const mobile = typeof body.mobile === 'string' ? body.mobile.replace(/[^\d+]/g, '').slice(0, 16) : '';
  const campaign = campaignFrom(body.campaign);
  // A one-line summary of where the lead came from, for systems that do not read the object.
  const sourceDetail = campaign ? [campaign.utm_source, campaign.utm_medium, campaign.utm_campaign].filter(Boolean).join(' / ') : '';
  const payload = {
    reg,
    source: SOURCE,
    placement: String(body.placement ?? 'claim-now'),
    path: String(body.path ?? '').slice(0, 200),
    startedAt: new Date().toISOString(),
    ...(campaign ? { campaign } : {}),
    ...(sourceDetail ? { sourceDetail } : {}),
    // The report form (Claims Report Line) sends a name and a mobile; the reg box sends neither.
    ...(name ? { name } : {}),
    ...(mobile ? { mobile } : {}),
  };

  const api = process.env.CLAIMS_API_URL;
  if (api) {
    try {
      const res = await fetch(`${api.replace(/\/$/, '')}/v1/claims/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.CLAIMS_API_KEY ?? ''}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as { ref?: string };
        return NextResponse.json({ ok: true, ref: data.ref ?? ref(), reg }, { status: 202 });
      }
      console.error('claims api', res.status);
    } catch (e) {
      console.error('claims api unreachable', e);
    }
  }
  // No API configured (or unreachable): acknowledge so the visitor is never stuck; the phone is the product.
  // The stub echoes the campaign so a test can prove the attribution reached the server.
  return NextResponse.json({ ok: true, ref: ref(), reg, stub: true, ...(campaign ? { campaign } : {}) }, { status: 202 });
}
