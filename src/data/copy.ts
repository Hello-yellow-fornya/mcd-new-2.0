/**
 * The approved words, in one place (CLAUDE.md §0 and the mockups in design/).
 * Sentence case, no exclamation marks. Components read from here; pages
 * compose them.
 */
import { site } from '@/lib/site';

export const cta = {
  /** Primary buttons (§0). */
  start: 'Start your non-fault claim',
  /** The short form used in the header and the band. */
  startShort: 'Start your claim',
  /** The outlined one (§0). */
  startOnline: 'Or start your no-fault claim online',
  call: `Call ${site.phone.display}`,
  callNow: 'Call now',
  /** The mobile hero's big pill, lower case as in the mobile mockup (a deliberate exception, CLAUDE.md §0). */
  callNowHero: 'call now',
} as const;

export type NavItem = {
  label: string;
  /** Omitted while the page does not build yet: the item renders as text, so nothing 404s. */
  href?: string;
  children?: NavItem[];
};

/** §0 header sections. Services carries a dropdown to the service children. */
export const nav = {
  claimHref: '/claim-now/',
  links: [
    { label: 'How it works', href: '/how-accident-management-works/' },
    { label: 'Non-fault accident', href: '/non-fault-accident/' },
    {
      label: 'Services',
      children: [
        { label: 'Accident management', href: '/accident-management-company/' },
        { label: 'Accident recovery' },
        { label: 'Vehicle replacement', href: '/non-fault-accident-courtesy-car/' },
        { label: 'Accident repair' },
        { label: 'Credit hire', href: '/credit-hire/' },
      ],
    },
    { label: 'Advice', href: '/what-to-do-after-a-car-accident/' },
    { label: 'About', href: '/about-us/' },
  ] as NavItem[],
  /** The drawer adds Contact (design/mcd-2-0-nav-options.png). */
  drawerExtra: [{ label: 'Contact', href: '/contact-us/' }] as NavItem[],
} as const;

export const hero = {
  h1: { before: '', highlight: 'Non-fault', after: ' accident?' },
  h2: { before: 'Choose the ', highlight: 'smarter way', after: ' to claim.' },
} as const;

export const proofGrid = [
  { icon: 'shield', title: 'Protect your\nno claims', sub: 'Keep your no claims bonus safe.' },
  { icon: 'pound', title: 'No excess\nto pay', sub: 'Our service is free for non-fault drivers.' },
  { icon: 'car', title: 'Like-for-like\nreplacement', sub: 'Car, van or bike, whatever your cover.' },
  { icon: 'bolt', title: 'Back on the road\nwithin 90 mins', sub: 'Nationwide recovery and rapid mobilisation.', claim: 'back-on-road-90-mins' },
] as const;

export const strip = [
  { icon: 'check', text: 'Non-fault claims handled for you' },
  { icon: 'pound', text: 'No excess to pay' },
  { icon: 'shield', text: 'Keep your no claims bonus' },
  { icon: 'car', text: 'Like-for-like car from day one' },
  { icon: 'doc', text: 'Nothing on your policy' },
  { icon: 'person', text: 'A named UK handler' },
] as const;

export const band = {
  l0: 'Your insurer has a claims department.',
  l1: 'It works for your insurer.',
  chip: 'We work for you.',
} as const;

export const themUs = {
  heads: ['Their claims department', 'Your claims handler'],
  rows: [
    ['Works for your insurer', 'Works for you'],
    ['A queue, then whoever picks up', 'One named person, UK-based, from first call to keys back'],
    ['Your excess, paid by you', 'No excess — the other driver’s insurer pays'],
    ['A claim on your policy', 'Nothing on your policy. Your no-claims untouched'],
    ['A courtesy car, if you’re covered', 'A like-for-like car, on your drive'],
  ],
} as const;

export const independence = {
  generic: 'Independent accident management company. Not an insurer — we help drivers with any insurer claim from the driver who hit them.',
  /** Landing pages name the insurer here and in the H1 only (§0). */
  forInsurer: (insurer: string) =>
    `Independent accident management company. Not ${insurer}, not an insurer — we help drivers with any insurer claim from the driver who hit them.`,
} as const;

export const benefits = {
  h2: 'Why make your non-fault claim through us',
  sub: 'Nothing goes through your policy. Here’s what that means for you.',
  cards: [
    { icon: 'pound', h3: 'No excess fees to pay, ever', p: 'Nothing to pay up front. Nothing to chase back.' },
    { icon: 'shield', h3: 'Keep your no claims bonus', p: 'Nothing goes through your policy, so your no-claims is untouched.' },
    { icon: 'car', h3: 'Like-for-like car hire, 100% guaranteed', p: 'Delivered to your drive. If yours is written off, you keep it until the money lands.' },
  ],
} as const;

export const howItWorks = {
  h2: 'How it works',
  lead: 'Someone hit you. Their insurer has to put it right — not yours.',
  sub: 'Most people don’t know that. We claim from their insurer instead.',
  steps: [
    { title: 'Tell us what happened.', text: 'One call, or your reg. That’s your bit done.' },
    { title: 'Your handler takes it on.', text: 'One person, in the UK, deals with the other driver’s insurer. If they ring you, send them to us.' },
    { title: 'We put you back in a car.', text: 'Like-for-like, on your drive, while yours is repaired.' },
    { title: 'They pay. Not you.', text: 'No excess, nothing on your policy, your no-claims untouched.' },
  ],
} as const;

export const faq = {
  h2: 'Frequently asked questions',
  sub: 'The catch, and everything else people ask.',
  items: [
    {
      q: 'What’s the catch?',
      a: 'We recover our costs from the at-fault driver’s insurer, which is why it costs you nothing. If they refuse to accept fault, we argue it for you. In the rare case that fault can’t be established, you could be asked to cover the hire charges — which is why we tell you on the first call whether your claim is one we’d take on.',
    },
    {
      q: 'Do I still have to speak to my insurer?',
      a: 'Only to let them know it happened. That’s a notification, not a claim. We handle everything else, including the call you’ll get from the other driver’s insurer.',
    },
    {
      q: 'Will my premium go up?',
      a: 'Nothing goes through your policy, so there’s no claim on it. You’ll still need to tell your insurer about the incident at renewal, and how they price that is up to them. We won’t pretend otherwise.',
    },
    { q: 'Are you an insurer?', a: 'No. We don’t sell insurance. We just make it pay.' },
  ],
} as const;

export const footer = {
  strapline: 'The claims department on your side.',
  columns: [
    {
      h: 'Claims',
      items: [
        { label: 'Start your claim', href: '/claim-now/' },
        { label: 'Non-fault accident', href: '/non-fault-accident/' },
        { label: 'Courtesy car', href: '/non-fault-accident-courtesy-car/' },
        { label: 'Credit hire', href: '/credit-hire/' },
      ],
    },
    {
      h: 'Services',
      items: [
        { label: 'Accident management', href: '/accident-management-company/' },
        { label: 'Accident recovery' },
        { label: 'Vehicle replacement' },
        { label: 'Accident repair' },
      ],
    },
    {
      h: 'Help',
      items: [
        { label: 'How it works', href: '/how-accident-management-works/' },
        { label: 'vs your insurer', href: '/accident-management-vs-insurance/' },
        { label: 'FAQs', href: '/#faq' },
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
        { label: 'Accessibility' },
      ],
    },
  ] as { h: string; items: NavItem[] }[],
  /** Rendered between the strapline and the legal line. */
  reassurance: 'A person in the UK picks up.',
} as const;

export const reviewsHead = { h2: 'What drivers say' } as const;

/** The one wording for "the catch" (appendix §11, pending MCD's policy): the FAQ answer, reused wherever the catch is stated. */
export const theCatch = {
  lead: 'The catch',
  text: faq.items[0].a,
} as const;
