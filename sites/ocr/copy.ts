/**
 * Claims Report Line copy, in one place: the signed-off pages in
 * design/ocr/ with the brief's rules applied. "Report your accident" on
 * primary buttons, "Or report it online" on the outlined one; nothing says or
 * implies that only non-fault drivers are welcome; every benefit is conditioned on the
 * same line it appears, because sites/ocr/content.rules.json fails the build
 * otherwise, so keep each item on one line. The shared components read the
 * same names as Claims 24/7 (cta, nav, faq, footer, theCatch …).
 */
import { site } from '@/lib/site';
import type { IconName } from '@/components/Icon/Icon';

export const cta = {
  /** Primary buttons. */
  start: 'Report your accident',
  startShort: 'Report your accident',
  /** The outlined one. */
  startOnline: 'Or report it online',
  /** The form's submit. */
  reportNow: 'Report it now',
  call: `Call ${site.phone.display}`,
  callNow: 'Call now',
  callNowHero: `Call ${site.phone.display}`,
} as const;

export type NavItem = {
  label: string;
  /** Omitted while the page does not build yet: the item renders as text, so nothing 404s. */
  href?: string;
  children?: NavItem[];
};

/** The header: three section anchors, the call link, the navy pill (ocr-homepage-concept.html .nav). */
export const nav: { claimHref: string; links: NavItem[]; drawerExtra: NavItem[] } = {
  claimHref: '/report/',
  links: [
    { label: 'How it works', href: '/#how' },
    { label: 'What’s the catch?', href: '/#catch' },
    { label: 'Who we help', href: '/#who' },
  ],
  drawerExtra: [
    { label: 'About us', href: '/about-us/' },
    { label: 'Contact', href: '/contact-us/' },
  ],
};

/** The hero, desktop and mobile. The chip is the H1 payoff (one highlight per view). */
export const hero = {
  eyebrow: 'Had a bump? Start here.',
  h1: { before: 'Had an accident?', chip: 'Report it here.' },
  lead: 'Whoever was at fault, report it once. We take the details, work out where you stand and deal with the insurers from there.',
  leadMobile: 'Fault or not, report it once. We take the details, work out where you stand and deal with the insurers.',
  worries: [
    { icon: 'question', title: 'Was it my fault?', text: 'Report it anyway. We work out who is liable and tell you where you stand.' },
    { icon: 'pound', title: 'Will it cost me?', text: 'Nothing to report it. If it was not your fault, nothing at all.' },
    { icon: 'car', title: 'Will I be without a car?', text: 'If it was not your fault, a like-for-like car on your drive.' },
  ] as { icon: IconName; title: string; text: string }[],
} as const;

/** The report form: the hero card, /report/ and the landing pages. */
export const form = {
  title: 'Report your accident',
  sub: 'Two minutes. We ring you back.',
  reg: 'Your registration',
  regPlaceholder: 'AB12 CDE',
  name: 'Your name',
  namePlaceholder: 'Full name',
  mobile: 'Mobile number',
  mobilePlaceholder: '07...',
  fine: 'No obligation. Reporting it to us puts nothing on your policy.',
  errors: {
    reg: 'Check the registration and try again.',
    name: 'Tell us your name so your handler knows who to ask for.',
    mobile: 'Check the mobile number so we can ring you back.',
    server: 'Something went wrong. Call us and we’ll do it together.',
    network: 'We couldn’t reach the server. Call us and we’ll do it together.',
  },
} as const;

export const howItWorks = {
  eyebrow: 'How it works',
  h2: 'One report, then it is handled',
  h2Parts: { before: 'One report, ', highlight: 'then it is handled', after: '' },
  lead: 'Someone hit you. Their insurer has to put it right, not yours.',
  sub: 'Most people don’t know that. We claim from their insurer instead.',
  steps: [
    { title: 'Report what happened', text: 'Online in a few minutes, or one call. That is your bit done.' },
    { title: 'We work out where you stand', text: 'One person, in the UK, looks at what happened and tells you who is liable.' },
    { title: 'We deal with the insurers', text: 'Yours, theirs, or both. You do not sit on hold with anyone.' },
    { title: 'Not your fault? They pay.', text: 'If it was not your fault, there is no excess, nothing on your policy, and a like-for-like car while yours is fixed.' },
  ],
} as const;

export const ways = {
  eyebrow: 'Report it to us first',
  h2: { before: 'Report it here, ', highlight: 'not to a queue', after: '' },
  sub: 'Your insurer’s claims department is paid by your insurer. Ours is paid by the insurer of the driver who hit you, which is why it costs you nothing.',
  newWay: {
    eyebrow: 'The new way',
    h3: 'Report it to Claims Report Line',
    items: [
      'Report it online in minutes, or speak to a UK-based handler',
      'One named person, whether it was your fault or not',
      'If it was not your fault: no excess, nothing on your policy, your no-claims untouched',
      'If it was not your fault, a like-for-like car on your drive while yours is fixed',
    ],
  },
  oldWay: {
    eyebrow: 'The old way',
    h3: 'Call your insurer',
    items: [
      'Wait on hold, then repeat your story to whoever picks up',
      'Pay your excess up front and chase it back later',
      'A claim on your record, and your no-claims takes the hit',
      'A small courtesy car, if your policy includes one at all',
    ],
  },
} as const;

export const who = {
  eyebrow: 'Who we help',
  h2: { before: 'Cars, vans, bikes, ', highlight: 'fleets and passengers', after: '' },
  tags: [
    { label: 'Any accident, fault or not', on: true },
    { label: 'Motorbike claims' },
    { label: 'Taxi & fleet' },
    { label: 'Van drivers' },
    { label: 'Passengers' },
  ],
} as const;

/** The FAQ (the homepage's "What's the catch?" section): "What if it was my fault?" opens first. */
export const faq = {
  eyebrow: 'Straight answers',
  h2: 'What’s the catch?',
  h2Parts: { before: 'What’s ', highlight: 'the catch?', after: '' },
  sub: 'There’s one. Here it is, in the same size as everything else.',
  items: [
    {
      q: 'What if it was my fault?',
      a: 'Report it anyway. We take the details, explain what happens next, and help you tell your insurer properly. The other driver’s claim gets handled by us too, so it is dealt with once and dealt with right.',
    },
    {
      q: 'What’s the catch?',
      a: 'We recover our costs from the at-fault driver’s insurer, which is why it costs you nothing. If they refuse to accept fault, we argue it for you. In the rare case that fault can’t be established, you could be asked to cover the hire charges, which is why we tell you on the first call whether your claim is one we’d take on.',
    },
    {
      q: 'Do I speak to my insurer?',
      a: 'Only to let them know it happened. That’s a notification, not a claim. We handle everything else, including the call you’ll get from the other driver’s insurer.',
    },
    {
      q: 'Will my premium go up?',
      a: 'If it was not your fault, nothing goes through your policy, so there’s no claim on it. You’ll still need to tell your insurer about the incident at renewal, and how they price that is up to them. We won’t pretend otherwise.',
    },
    { q: 'Are you an insurer?', a: 'No. We don’t sell insurance. We just make it pay.' },
  ],
} as const;

/** The navy section before the footer (ocr-homepage-concept.html .final). */
export const finalCta = {
  h2: { before: 'One call ', chip: 'sorts the lot.' },
  text: 'Tell us what happened and we’ll get straight on it. Not your fault? Nothing to pay, nothing on your policy.',
} as const;

/** The one wording for "the catch": the FAQ answer, reused wherever the catch is stated. */
export const theCatch = {
  lead: 'The catch',
  text: faq.items[1].a,
} as const;

export const independence = {
  generic: 'Independent accident management company. Not an insurer. Claims Report Line helps drivers with any insurer claim from the driver who hit them.',
  /** Landing pages name the insurer here and in the H1 only. */
  forInsurer: (insurer: string) =>
    `Independent accident management company. Not ${insurer}, not an insurer. Claims Report Line helps drivers with any insurer claim from the driver who hit them.`,
} as const;

/**
 * The landing pages' navy band. The signed-off landing file carries the other
 * two brands' claims-department band, which the brief bans on this site; this
 * is option A from design/ocr/ocr-band-options.png.
 */
export const band = {
  l0: 'Report it once.',
  l1: 'We take it from here.',
  chip: 'Managed directly with the at-fault insurer.',
} as const;

export const themUs = {
  heads: ['Their claims department', 'Your claims handler'],
  rows: [
    ['Works for your insurer', 'Works for you'],
    ['A queue, then whoever picks up', 'One named person, UK-based, start to finish'],
    ['Your excess, paid by you', 'No excess if it was not your fault. The other driver’s insurer pays'],
    ['A claim on your policy', 'Nothing on your policy if it was not your fault. Your no-claims untouched'],
    ['A courtesy car, if you’re covered', 'A like-for-like car, on your drive, if it was not your fault'],
  ],
} as const;

/** The insurer landing pages (ocr-goskippy-mobile.html); the insurer comes from sites/ocr/landing/<slug>.json. */
export const landing = {
  proof: [
    { icon: 'pound', title: 'No excess\nto pay', sub: 'Our service is free for non-fault drivers' },
    { icon: 'shield', title: 'Protect your\nno claims', sub: 'Nothing goes on your policy if it was not your fault' },
    { icon: 'car', title: 'Like-for-like\nreplacement', sub: 'Car, van or motorbike, if it was not your fault' },
    { icon: 'person', title: 'One named\nhandler', sub: 'UK-based, start to finish' },
  ] as { icon: IconName; title: string; sub: string }[],
  ticker: [
    { icon: 'doc', text: 'Report your accident online in minutes' },
    { icon: 'pound', text: 'Not your fault? No excess to pay' },
    { icon: 'shield', text: 'Not your fault? Keep your no claims bonus' },
    { icon: 'car', text: 'Like-for-like car, van or motorbike if it was not your fault' },
    { icon: 'person', text: 'One named UK handler' },
    { icon: 'truck', text: 'Nationwide recovery and repairs' },
  ] as { icon: IconName; text: string }[],
  faq: {
    h2: 'Straight answers',
    sub: 'The catch, and everything else people ask.',
    items: [
      { q: 'What’s the catch?', a: theCatch.text },
      { q: 'Do I still have to tell my insurer?', a: 'Yes, that it happened. That’s a notification, not a claim. If it was not your fault, nothing goes on your policy.' },
      { q: 'Will my premium go up?', a: faq.items[3].a },
      { q: 'Are you an insurer?', a: 'No. We don’t sell insurance. We make it pay.' },
    ],
  },
} as const;

/** /report/ and its thank-you page. */
export const report = {
  eyebrow: 'Two minutes. We ring you back.',
  h1: 'Report your accident',
  h2: 'Whoever was at fault, tell us once. We take the details, work out where you stand and deal with the insurers.',
  asideAsk: { h2: 'What we ask you', items: ['The other driver’s name, reg and insurer, if you have them', 'Where and when it happened', 'Whether anyone was hurt'] },
  asideNext: { h2: 'What happens next', text: 'Your handler calls you back, works out where you stand and tells you what happens next. If it was not your fault, they arrange your car.' },
  rather: 'Rather talk?',
  picksUp: 'A person in the UK picks up.',
  thanks: {
    h1: 'That’s your bit done.',
    h2: 'Your handler calls you back to work out where you stand and what happens next.',
    text: 'If anything changes before then, ring us.',
  },
} as const;

export const footer = {
  strapline: 'The claims department on your side.',
  columns: [
    {
      h: 'Claims',
      items: [
        { label: 'Report your accident', href: '/report/' },
        { label: 'Non-fault accidents' },
        { label: 'Courtesy car' },
        { label: 'Credit hire' },
      ],
    },
    {
      h: 'Help',
      items: [
        { label: 'How it works', href: '/#how' },
        { label: 'What’s the catch?', href: '/#catch' },
        { label: 'Contact', href: '/contact-us/' },
        { label: 'Complaints', href: '/complaints/' },
      ],
    },
    {
      h: 'Legal',
      items: [
        { label: 'Terms', href: '/terms/' },
        { label: 'Privacy', href: '/privacy-policy/' },
        { label: 'Cookies', href: '/cookies/' },
      ],
    },
  ] as { h: string; items: NavItem[] }[],
  reassurance: 'A person in the UK picks up.',
} as const;

export const reviewsHead = { h2: 'What drivers say' } as const;

/* The rest of the shared contract: read by Claims 24/7 components that this site never renders, kept in the same shape so both sites type-check. */
export type ProofCard = { [key: string]: unknown; icon: 'shield' | 'pound' | 'car' | 'bolt' | 'person' | 'doc'; title: string; sub: string; claim?: string; fallback?: ProofCard };
export const proofGrid: readonly ProofCard[] = landing.proof as ProofCard[];
export const strip = landing.ticker;
export const keeps = [
  { icon: 'pound', label: 'No excess to pay if it was not your fault' },
  { icon: 'shield', label: 'Keep your no claims bonus if it was not your fault' },
  { icon: 'car', label: 'Like-for-like car hire if it was not your fault' },
] as const;
export const benefits = {
  h2: 'Why report it to us',
  sub: 'Whoever was at fault, one report and one person.',
  cards: [
    { icon: 'pound', h3: 'Nothing to report it', p: 'If it was not your fault, no excess and nothing to chase back.' },
    { icon: 'shield', h3: 'Where you stand, in plain words', p: 'One person looks at what happened and tells you who is liable.' },
    { icon: 'car', h3: 'A car while yours is fixed', p: 'If it was not your fault, like-for-like and on your drive.' },
  ],
} as const;
