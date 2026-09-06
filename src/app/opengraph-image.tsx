import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { site } from '@/lib/site';

export const alt = 'Motor Claims Department. Non-fault accident? Choose the smarter way to claim.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const spokes = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * The default Open Graph card for every route (appendix §9): cream card,
 * the lockup, the H1 with the bar under "Non-fault", the H2, the number.
 * Fonts are the self-hosted WOFF files (the image renderer cannot read
 * WOFF2), so nothing loads from Google.
 */
export default async function OpenGraphImage() {
  const fonts = join(process.cwd(), 'src', 'fonts');
  const [display, body] = await Promise.all([readFile(join(fonts, 'archivo-black-latin-400-normal.woff')), readFile(join(fonts, 'archivo-latin-700-normal.woff'))]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#F7F5EF', color: '#19180F', padding: 72, fontFamily: 'Archivo' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Archivo Black', fontSize: 56, letterSpacing: -2, lineHeight: 1 }}>
            MOT
            <svg width="42" height="42" viewBox="0 0 100 100" style={{ margin: '0 1px' }}>
              <circle cx="50" cy="50" r="50" fill="#F3CD3E" />
              {spokes.map((d) => {
                const r = (d * Math.PI) / 180;
                return <line key={d} x1="50" y1="50" x2={50 + 34 * Math.cos(r)} y2={50 + 34 * Math.sin(r)} stroke="#19180F" strokeWidth="9" strokeLinecap="round" />;
              })}
              <circle cx="50" cy="50" r="11" fill="#19180F" />
            </svg>
            R
          </div>
          <div style={{ fontSize: 17, letterSpacing: 2.4, marginTop: 6 }}>CLAIMS DEPARTMENT</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, fontFamily: 'Archivo Black', fontSize: 108, lineHeight: 1, letterSpacing: -3 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Non-fault</span>
              <div style={{ height: 15, background: '#F3CD3E', marginTop: -6, borderRadius: 2 }} />
            </div>
            <span>accident?</span>
          </div>
          <div style={{ display: 'flex', fontFamily: 'Archivo Black', fontSize: 44, lineHeight: 1.2, marginTop: 22, letterSpacing: -1 }}>Choose the smarter way to claim.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', background: '#19180F', color: '#F3CD3E', borderRadius: 999, padding: '18px 34px', fontSize: 30 }}>Call {site.phone.display}</div>
          <div style={{ fontSize: 24, color: '#54524A' }}>Independent accident management. Not an insurer.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Archivo Black', data: display, weight: 400, style: 'normal' },
        { name: 'Archivo', data: body, weight: 700, style: 'normal' },
      ],
    },
  );
}
