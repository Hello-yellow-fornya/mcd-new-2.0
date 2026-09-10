import { NextResponse } from 'next/server';
import { site } from '@/lib/site';
import { isVehiclePhotoUrl, sanitizePhone, validateContact } from '@/lib/validators';
import { CLICK_ID_KEYS, UTM_KEYS, type Campaign } from '@/lib/campaign';
import { ACCIDENT_Q, VEHICLE_Q } from '@/lib/claim-flow/questions';

/**
 * The completed claim flow (appendix §7). This is what 1.0's submitClaim
 * server action does, minus the parts this repo does not have: there is no
 * database, no CRM client and no mailer here (§0), so instead of writing a
 * submission row and sending a lead email, this forwards the same fields to
 * the shared 1.0 claims API with source "mcd2", exactly as /api/claim-start/
 * does for the reg box. Leads therefore land wherever 1.0's already land.
 *
 * When CLAIMS_API_URL is not set it acknowledges with a stub reference so the
 * visitor is never stuck -- and, on a preview build, says so in the response
 * so a reviewer can tell a stub from a delivered lead.
 *
 * Validation runs here as well as in the browser: a tampered client must not
 * be able to smuggle bad data through.
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

function ref(): string {
  return `MCD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Only the questions the flow asks, only the values it offers. */
function answersFrom(value: unknown): Record<string, string> {
  const input = (value ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const q of [...ACCIDENT_Q, ...VEHICLE_Q]) {
    const v = input[q.id];
    if (typeof v === 'string' && q.options.some((o) => o.v === v)) out[q.id] = v;
  }
  return out;
}

/** The campaign off the request: only the keys we send, string values, length-capped. */
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

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Send JSON.' }, { status: 400 });
  }

  // Honeypot: the contact step renders a hidden "website" field real visitors
  // never see. Pretend success so bots do not learn they were filtered.
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

  // Collapse all whitespace, including newlines, which would otherwise reach a subject line.
  const name = String(body.name ?? '').trim().replace(/\s+/g, ' ');
  const phone = sanitizePhone(body.phone);
  const email = String(body.email ?? '').trim();
  const errors = validateContact({ name, phone, email });
  const firstError = errors.name || errors.phone || errors.email;
  if (firstError) return NextResponse.json({ ok: false, error: firstError }, { status: 422 });

  const answers = answersFrom(body.answers);
  const campaign = campaignFrom(body.campaign);
  const sourceDetail = campaign ? [campaign.utm_source, campaign.utm_medium, campaign.utm_campaign].filter(Boolean).join(' / ') : '';
  const payload = {
    source: SOURCE,
    placement: 'claim-flow',
    name,
    phone,
    email,
    answers,
    startedAt: new Date().toISOString(),
    // A photo URL that is not on our own blob store is dropped, not rejected: the step is optional.
    ...(isVehiclePhotoUrl(body.vehiclePhotoUrl) ? { vehiclePhotoUrl: body.vehiclePhotoUrl as string } : {}),
    ...(campaign ? { campaign } : {}),
    ...(sourceDetail ? { sourceDetail } : {}),
  };

  const api = process.env.CLAIMS_API_URL;
  if (api) {
    try {
      const res = await fetch(`${api.replace(/\/$/, '')}/v1/claims/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.CLAIMS_API_KEY ?? ''}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { ref?: string } | null;
        return NextResponse.json({ ok: true, ref: data?.ref ?? ref() }, { status: 202 });
      }
      console.error('claims api', res.status);
    } catch (e) {
      console.error('claims api unreachable', e);
    }
  }
  // No API configured, or unreachable: acknowledge so the visitor is never
  // stuck. Off production the response says the lead was not delivered, so a
  // reviewer on staging can tell.
  const stub = process.env.VERCEL_ENV !== 'production' ? { stub: true, delivered: false } : {};
  return NextResponse.json({ ok: true, ref: ref(), ...stub }, { status: 202 });
}
