# Layout rules — MCD family (1.0, 2.0, Claims 24/7)

These apply to every page, every brand, every breakpoint. They are the things Ryham has had to say more than once; if a page breaks one of them it is wrong, whatever the brief said.

## 1. The fold
- Mobile heroes are **fold-locked**: `min-height: calc(100dvh − nav height)`. The last element in the hero (the online-claim pill, or the claims strip where one is used) has its bottom edge exactly on the fold. Assert at 390×844 and 430×932.
- A fold-locked hero has **exactly one flexible gap** — between the headline block and the proof block. Every other gap is a fixed pixel value. The flexible gap is never the largest gap on screen; if it is, the type is too small.
- Nothing above the fold moves with zoom except that one gap.
- Desktop: headline, H2, CTAs and the proof grid are all inside 1280×720.

## 2. The headline pair
- H1 is a short question or situation ("Non-fault accident?", "Insured with GoSkippy?", "Not your fault? It's handled."). H2 is the instruction or promise ("Choose the smarter way to claim.", "Call us before you call your insurer."). Never a third line of copy in the hero.
- Highlight one or two words per line, never more. The bar sits under the word: `text-decoration: underline`, thickness .14em, offset .08em, skip-ink off. Chips (a box behind text) only on dark surfaces or where the guidelines say so.
- **Line spacing is measured from the top of a highlight chip, not the glyphs.** A chipped line gets `margin-top` equal to its top padding so the chip never crowds the line above.
- Sizes go up before gaps go up. If there is space to fill, the H1 grows first, then the lead, then the cards. Padding is the last resort.

## 3. Proof
- The 2×2 proof grid: four cards, equal height, icon circle 34–36px, title 14px bold on two lines, sub 12–13px. Timing claims ("90 mins", "avg wait 1 min") only render when substantiated.
- The wait row sits directly under the call button, never above it. On dark surfaces it is white.
- The three worries (cost, bonus, car) go directly under the headline pair when used, as compact equal-height cards.

## 4. CTAs
- One primary action per view. On mobile the primary is **call**; the online-claim pill is the outlined secondary at the fold.
- Nav on mobile: logo hard left, as large as the bar allows (28–30px), a full "Call now" pill and the burger hard right — never an icon-only circle, never a centred row, never the lines-open proof in the bar. Nav is sticky.
- Nav on desktop: logo hard left and big; sections; the lines-open chip; the phone number as a pill; the start pill hard right. Everything on one line at 1280.
- Every content section ends with the CTA pair. The band uses two small outlined pills instead, so it does not compete with the sections around it.
- Phone number always rendered as text inside a `tel:` link.

## 5. Bands and strips
- The band: three lines — the quiet line is the same weight and colour as the others (bold, white) — "It works for your insurer." on one line, "We work for you." in a chip on its own line with clear space above it. Two small outlined pills. On 1.0 it sits on the ink shards.
- The moving claims strip (1.0 desktop: stone cards on white; 2.0: ink strip with icon circles): equal-height items, duplicated once for a seamless loop, paused on hover and touch, static under reduced-motion. Icons have their knock-out detail in the surface colour so it shows.
- Independence line sits **after** the their/your table, not before it.

## 6. Cards, chips, icons
- Cards in a row are always the same height (`align-items: stretch`), text vertically centred.
- Icon circles are never squashed or clipped: they are `inline-flex`, `flex: none`, fixed size. Don't let a broad `span` rule touch them.
- Every icon's detail (shield tick, document lines) is drawn in the circle colour so it is visible.

## 7. Colour rules that keep getting broken
- 1.0: ink text on coral for buttons and small text (`ink-900` for AA); white text on coral only in the big-print chip (≥28px). Never yellow anywhere.
- 2.0: yellow #F3CD3E; ink on yellow; yellow on ink. Never coral, never marine.
- Claims 24/7: solid blocks are blue-and-white or turquoise-and-white only; never blue with turquoise; never a black background.
- Reversed text on dark surfaces is white at full opacity, not a grey tint.

## 8. Process
- Fix the spacing, don't make it fixed: keep the fold-locked layout and repair the gaps.
- When a section is copied between brands, re-skin every token; a leftover colour from the other brand (a yellow underlay on a coral chip) is a bug.
- When a component is rebuilt at another size, build it from measured geometry of the signed-off version, not from scratch.
- Say what broke and why in one sentence, then fix it.
