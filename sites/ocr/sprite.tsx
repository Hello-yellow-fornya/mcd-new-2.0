/**
 * The line icon set (OCR-brand-guidelines-one-page.html §4): 1.9px stroke,
 * round caps and joins, no solid glyphs. Same symbol ids as the Claims 24/7
 * sprite, so the shared <Icon name="…" /> renders the right face on each
 * site; the star and the dot stay filled (they are marks, not icons).
 */
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <path {...line} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path {...line} strokeWidth={2.4} d="M5 12.5l4.5 4.5L19 7.5" />
        </symbol>
        <symbol id="i-cross" viewBox="0 0 24 24">
          <path {...line} strokeWidth={2} d="M7 7l10 10M17 7L7 17" />
        </symbol>
        <symbol id="i-pound" viewBox="0 0 24 24">
          <path {...line} d="M15 6.5c-1-1-2.5-1.3-3.7-.6C9.7 6.8 10 9 10 11v5c0 2-1 3-2.5 3.5M7 13.5h6M7 19.5h10" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path {...line} d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
          <path {...line} d="M9 12l2 2 4-4" />
        </symbol>
        <symbol id="i-car" viewBox="0 0 24 24">
          <path {...line} d="M5 15l1.5-5A2 2 0 0 1 8.4 8.5h7.2a2 2 0 0 1 1.9 1.5L19 15" />
          <rect {...line} x="3.5" y="15" width="17" height="4.5" rx="1.5" />
          <circle {...line} cx="7.5" cy="19.5" r="1.4" />
          <circle {...line} cx="16.5" cy="19.5" r="1.4" />
        </symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24">
          <path {...line} d="M13 3L5 13h6l-1 8 8-10h-6z" />
        </symbol>
        <symbol id="i-doc" viewBox="0 0 24 24">
          <rect {...line} x="5" y="3" width="14" height="18" rx="2" />
          <path {...line} d="M9 8h6M9 12h6M9 16h3" />
          <path {...line} d="M15 15.5l1.5 1.5 3-3" />
        </symbol>
        <symbol id="i-camera" viewBox="0 0 24 24">
          <path {...line} d="M4 8h3.2L9 5.5h6L16.8 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
          <circle {...line} cx="12" cy="13" r="3.2" />
        </symbol>
        <symbol id="i-image" viewBox="0 0 24 24">
          <rect {...line} x="3" y="5" width="18" height="14" rx="2" />
          <circle {...line} cx="8.6" cy="10.2" r="1.6" />
          <path {...line} d="m5 17.6 4.6-4.6 3 3L15.6 13l4.4 4.6" />
        </symbol>
        <symbol id="i-person" viewBox="0 0 24 24">
          <circle {...line} cx="12" cy="8" r="4" />
          <path {...line} d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </symbol>
        <symbol id="i-question" viewBox="0 0 24 24">
          <path {...line} d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7v.5" />
          <circle {...line} cx="12" cy="17.5" r=".6" />
          <circle {...line} cx="12" cy="12" r="9" />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24">
          <circle {...line} cx="12" cy="12" r="9" />
          <path {...line} d="M12 7v5l3.5 2" />
        </symbol>
        <symbol id="i-truck" viewBox="0 0 24 24">
          <path {...line} d="M3 16V10a1.5 1.5 0 0 1 1.5-1.5h3.6l2.4 3.5H13V16" />
          <path {...line} d="M13 12l6-5.5M19 6.5v3a1.5 1.5 0 0 1-3 0" />
          <path {...line} d="M3 16h18" />
          <circle {...line} cx="7" cy="18.5" r="1.7" />
          <circle {...line} cx="17" cy="18.5" r="1.7" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path {...line} d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path {...line} d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path {...line} d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z" />
          <circle {...line} cx="12" cy="10" r="2.2" />
        </symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path {...line} d="M5 12h14M13 6l6 6-6 6" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8z" />
        </symbol>
        <symbol id="i-dot" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
        </symbol>
      </defs>
    </svg>
  );
}
