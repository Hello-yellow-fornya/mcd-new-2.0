/**
 * The claim flow's questions and branch copy, duplicated from 1.0
 * (rta_claims components/claim-flow.jsx) so both sites ask the same things in
 * the same words and the same order. Only the dead-end phone number differs:
 * 1.0 keys it per brand, and here there is one brand.
 *
 * Step index: 0 landing · 1 accident · 2 vehicle · 3 photo (optional) ·
 * 4 contact · 5 thank-you.
 */
export type Question = { id: string; label: string; help?: string; options: { v: string; l: string }[] };

export const ACCIDENT_Q: Question[] = [
  {
    id: 'had_accident',
    label: 'Have you been involved in a road traffic accident?',
    options: [
      { v: 'yes', l: 'Yes, I’ve had an accident' },
      { v: 'no', l: 'No, I haven’t had an accident' },
    ],
  },
  {
    id: 'fault',
    label: 'Was the accident your fault?',
    options: [
      { v: 'not_fault', l: 'No, it was not my fault' },
      { v: 'my_fault', l: 'Yes, it was my fault' },
      { v: 'unsure', l: 'I’m not sure at this point' },
    ],
  },
];

export const VEHICLE_Q: Question[] = [
  {
    id: 'drivable',
    label: 'Is your vehicle drivable?',
    help: 'If you’re not sure your vehicle is safe to drive, we recommend you avoid driving it.',
    options: [
      { v: 'drivable', l: 'Yes, I can safely drive' },
      { v: 'not_safe', l: 'No, my vehicle is not safe' },
      { v: 'unsure', l: 'I am not sure' },
    ],
  },
  {
    id: 'replacement',
    label: 'Will you require a replacement vehicle while yours is off the road?',
    options: [
      { v: 'yes', l: 'Yes' },
      { v: 'no', l: 'No' },
      { v: 'unsure', l: 'I am not sure' },
    ],
  },
];

export const PHOTO_STEP = {
  title: 'Add a photo of the damage',
  optionalTag: 'Optional',
  help: 'A quick photo of your vehicle helps our team assess your claim faster. If you don’t have one to hand, you can skip this step.',
  skipNote: 'This step is optional — you can skip it and we’ll ask when we call.',
} as const;

export type Answers = Record<string, string | undefined>;

export function isDeadEnd(answers: Answers): boolean {
  return answers.had_accident === 'no' || answers.fault === 'my_fault';
}

/**
 * Two answers end the flow, each with its own copy: no accident to claim for,
 * and an at-fault claim we do not handle. "No accident" takes precedence, as
 * it is the more fundamental disqualifier. Both offer the phone instead.
 *
 * The phone is passed in rather than imported so this module stays free of
 * path aliases and the unit tests can load it without a bundler.
 */
export function deadEndContent(answers: Answers, phone: { display: string; href: string }) {
  const link = { linkLabel: `call us on ${phone.display}`, linkHref: phone.href };
  if (answers.had_accident !== 'no' && answers.fault === 'my_fault') {
    return {
      intro: 'Unfortunately, we are unable to deal with fault claims,',
      outroBefore: ' if you would like to contact us for anything else, you can ',
      ...link,
    };
  }
  return {
    intro: 'Unfortunately, if you have not had a road traffic accident, we cannot start a road traffic accident claim.',
    outroBefore: ' If you would like to contact us for anything else, you can ',
    ...link,
  };
}

/** Question ids mapped to the keys GTM expects on generate_lead, as in 1.0. */
const DATALAYER_KEYS: Record<string, string> = {
  had_accident: 'involved_in_accident',
  fault: 'accident_fault',
  drivable: 'vehicle_drivable',
  replacement: 'needs_replacement_vehicle',
};

function answerLabel(questionId: string, value?: string): string | null {
  if (!value) return null;
  const q = [...ACCIDENT_Q, ...VEHICLE_Q].find((x) => x.id === questionId);
  return q?.options.find((o) => o.v === value)?.l ?? null;
}

export function answersForDataLayer(answers: Answers): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const [qid, key] of Object.entries(DATALAYER_KEYS)) out[key] = answerLabel(qid, answers[qid]);
  return out;
}
