/**
 * UK registration formatting for the reg box (appendix §4): accept any case
 * or spacing, show "AB12 CDE" as the user types. Current-style plates (two
 * letters, two digits, three letters) get the space after the fourth
 * character; older formats are only uppercased and stripped of spaces.
 */
export function compactReg(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

export function formatReg(raw: string): string {
  const c = compactReg(raw);
  if (/^[A-Z]{2}\d{2}[A-Z]{0,3}$/.test(c) && c.length > 4) {
    return `${c.slice(0, 4)} ${c.slice(4)}`;
  }
  return c;
}

/** True when the plate looks complete enough to send to the claim form. */
export function isPlausibleReg(raw: string): boolean {
  const c = compactReg(raw);
  return c.length >= 2 && c.length <= 7 && /\d/.test(c) && /[A-Z]/.test(c);
}
