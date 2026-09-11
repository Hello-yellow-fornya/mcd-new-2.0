/**
 * Shared input validators, duplicated from 1.0 (rta_claims lib/validators.js)
 * so the two sites accept and reject exactly the same things. Used by the
 * claim flow live on blur and again by the submit route, so a tampered client
 * cannot smuggle bad data past the browser.
 */
export function sanitizePhone(s: unknown): string {
  // Strip non-digits and cap at a generous 15 so absurdly long pastes don't
  // grow forever, but validation can still flag 12+ as "too many digits".
  return String(s ?? '')
    .replace(/\D/g, '')
    .slice(0, 15);
}

/** UK mobile rules: 11 digits, starts with 07. */
export function validatePhone(raw: unknown): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return 'Mobile is required.';
  if (digits.length > 11) return 'Too many digits — UK mobiles are 11 digits.';
  if (digits.length < 11) return 'UK mobile must be 11 digits.';
  if (!digits.startsWith('07')) return 'UK mobile must start with 07.';
  return null;
}

export function validateEmail(raw: unknown): string | null {
  const v = String(raw ?? '').trim();
  // 254 is the RFC 5321 ceiling for a full address; anything longer is junk.
  if (!v) return 'Email is required.';
  if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
  return null;
}

export function validateName(raw: unknown): string | null {
  const v = String(raw ?? '').trim();
  if (!v) return 'Name is required.';
  if (v.length > 100) return 'Name must be 100 characters or fewer.';
  return null;
}

export type Contact = { name: string; phone: string; email: string; website?: string };
export type ContactErrors = { name: string | null; phone: string | null; email: string | null };

export function validateContact(c: Partial<Contact>): ContactErrors {
  return { name: validateName(c.name), phone: validatePhone(c.phone), email: validateEmail(c.email) };
}

/**
 * The optional damage-photo URL must be one of ours: https, on this project's
 * Vercel Blob store (src/app/api/upload-photo). Anything else is dropped
 * rather than rejected, since the photo is optional.
 */
export function isVehiclePhotoUrl(raw: unknown): boolean {
  if (typeof raw !== 'string' || !raw || raw.length > 2048) return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}
