import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { site } from '@/lib/site';

export const alt = `${site.name}. Had an accident? Report it here.`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The default Open Graph card: paper, the wordmark as text, the H1 with the green chip, the navy call pill. Inter from the site's own WOFF files. */
export default async function OpenGraphImage() {
  const fonts = join(process.cwd(), 'sites', 'ocr', 'fonts');
  const [black, bold] = await Promise.all([readFile(join(fonts, 'inter-latin-900-normal.woff')), readFile(join(fonts, 'inter-latin-700-normal.woff'))]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#F4F6F5', color: '#0E2A47', padding: 72, fontFamily: 'Inter' }}>
        <div style={{ display: 'flex', fontWeight: 900, fontSize: 44, letterSpacing: -2 }}>
          <span style={{ color: '#18AC7E' }}>Online</span>
          <span style={{ marginLeft: 12 }}>Claims Report</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontWeight: 900, fontSize: 100, lineHeight: 1.02, letterSpacing: -4 }}>Had an accident?</div>
          <div style={{ display: 'flex', marginTop: 12 }}>
            <span style={{ display: 'flex', background: '#DDF5EB', color: '#0E2A47', fontWeight: 900, fontSize: 100, lineHeight: 1.05, letterSpacing: -4, padding: '2px 20px 8px', borderRadius: 14 }}>Report it here.</span>
          </div>
          <div style={{ display: 'flex', fontWeight: 900, fontSize: 38, marginTop: 26, letterSpacing: -1.5 }}>Whoever was at fault, report it once.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', background: '#0E2A47', color: '#FFFFFF', borderRadius: 999, padding: '18px 34px', fontSize: 30, fontWeight: 700 }}>Call {site.phone.display}</div>
          <div style={{ display: 'flex', fontSize: 24, color: '#5B6770', fontWeight: 700 }}>Independent accident management. Not an insurer.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: black, weight: 900, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
