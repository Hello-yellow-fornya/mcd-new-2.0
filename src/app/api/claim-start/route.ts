import { NextResponse } from 'next/server';
import { site } from '@/lib/site';
import { compactReg, isPlausibleReg } from '@/lib/reg';

/**
 * The site's own intake endpoint for the reg box (appendix §7). There is no
 * claims service in this repo (§0): this handler validates the reg, honours a
 * honeypot, rate-limits per address, and forwards to the shared 1.0 claims
 * API on Railway with the site's source ("mcd2" or "ocr"), using
 * CLAIMS_API_URL and this project's own CLAIMS_API_KEY. Ollie's question flow
 * owns everything after this.
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
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'Too many attempts. Call us instead.' }, { status: 429 });

  const reg = compactReg(String(body.reg ?? ''));
  if (!isPlausibleReg(reg)) return NextResponse.json({ ok: false, error: 'Check the registration and try again.' }, { status: 422 });

  // The source is this site, always; the client only says where on the page the reg came from.
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const mobile = typeof body.mobile === 'string' ? body.mobile.replace(/[^\d+]/g, '').slice(0, 16) : '';
  const payload = {
    reg,
    source: SOURCE,
    placement: String(body.placement ?? 'claim-now'),
    path: String(body.path ?? '').slice(0, 200),
    startedAt: new Date().toISOString(),
    // The report form (Online Claims Report) sends a name and a mobile; the reg box sends neither.
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
  return NextResponse.json({ ok: true, ref: ref(), reg, stub: true }, { status: 202 });
}
