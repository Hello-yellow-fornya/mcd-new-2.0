/**
 * The solid icon set as one SVG sprite, drawn from the mockups in design/.
 * Rendered once in the root layout; <Icon name="…" /> references a symbol.
 * Two-tone icons (the shield's tick, the document's lines) take the circle's
 * background through --ic-bg so they read on ink, yellow and pale.
 */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-truck" viewBox="0 0 24 24">
          <path d="M23 16V9.5A1.5 1.5 0 0 0 21.5 8h-4.3a1.5 1.5 0 0 0-1.3.8L14 12h-2v4z" />
          <rect x="18" y="9.4" width="3.2" height="2.4" rx=".5" fill="var(--ic-bg, #19180F)" />
          <path d="M12 12L5 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M4.5 5.5v3.3a1.7 1.7 0 0 0 3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="1" y="15.5" width="22" height="2.5" rx="1" />
          <circle cx="6" cy="19" r="2.2" />
          <circle cx="18.5" cy="19" r="2.2" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <circle cx="8" cy="10.5" r="1.3" fill="var(--ic-bg, #F3CD3E)" />
          <circle cx="12" cy="10.5" r="1.3" fill="var(--ic-bg, #F3CD3E)" />
          <circle cx="16" cy="10.5" r="1.3" fill="var(--ic-bg, #F3CD3E)" />
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1.3 1.3 0 0 1 1.3-.3c1.2.4 2.5.6 3.8.6a1.3 1.3 0 0 1 1.3 1.3v3.4a1.3 1.3 0 0 1-1.3 1.3A18.3 18.3 0 0 1 2.2 4.5a1.3 1.3 0 0 1 1.3-1.3h3.4a1.3 1.3 0 0 1 1.3 1.3c0 1.3.2 2.6.6 3.8a1.3 1.3 0 0 1-.3 1.3z" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-cross" viewBox="0 0 24 24">
          <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-pound" viewBox="0 0 24 24">
          <text x="12" y="19.5" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'var(--display)', fontSize: 22 }}>
            £
          </text>
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path d="M12 2l8 3.2v6.4c0 5-3.6 8.6-8 11.2C7.6 20.2 4 16.6 4 11.6V5.2z" />
          <path d="M8.5 12l2.5 2.5 4.8-4.8" fill="none" style={{ stroke: 'var(--ic-bg, var(--ink))' }} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        </symbol>
        <symbol id="i-car" viewBox="0 0 24 24">
          <path d="M4.2 11.5l1.9-5A2.5 2.5 0 0 1 8.4 5h7.2a2.5 2.5 0 0 1 2.3 1.5l1.9 5A2.5 2.5 0 0 1 22 14v4a1.5 1.5 0 0 1-1.5 1.5h-.5a2 2 0 0 1-4 0H8a2 2 0 0 1-4 0h-.5A1.5 1.5 0 0 1 2 18v-4a2.5 2.5 0 0 1 2.2-2.5zM7.1 7.8L6 11h12l-1.1-3.2A.8.8 0 0 0 16.1 7H7.9a.8.8 0 0 0-.8.8zM6 15.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zm12 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z" />
        </symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24">
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </symbol>
        <symbol id="i-doc" viewBox="0 0 24 24">
          <path d="M6 2h8l5 5v15H6z" />
          <path d="M9 11h6M9 14.5h6M9 18h4" fill="none" style={{ stroke: 'var(--ic-bg, var(--yellow))' }} strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-person" viewBox="0 0 24 24">
          <circle cx="12" cy="7.5" r="4.5" />
          <path d="M3.5 21.5c0-4.7 3.8-8 8.5-8s8.5 3.3 8.5 8z" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8z" />
        </symbol>
        <symbol id="i-dot" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="6" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
      </defs>
    </svg>
  );
}
