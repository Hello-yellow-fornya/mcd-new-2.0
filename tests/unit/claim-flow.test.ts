import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCIDENT_Q, VEHICLE_Q, answersForDataLayer, deadEndContent, isDeadEnd } from '../../src/lib/claim-flow/questions.ts';
import { isVehiclePhotoUrl, sanitizePhone, validateContact } from '../../src/lib/validators.ts';

const PHONE = { display: '0208 988 9508', href: 'tel:+442089889508' };

// The claim flow's questions and branches, duplicated from 1.0
// (rta_claims components/claim-flow.jsx): these assert the parts that must not
// drift from it, since the two sites ask the same things.

test('the four questions and their options are 1.0’s, in 1.0’s order', () => {
  assert.deepEqual(ACCIDENT_Q.map((q) => q.id), ['had_accident', 'fault']);
  assert.deepEqual(VEHICLE_Q.map((q) => q.id), ['drivable', 'replacement']);
  assert.deepEqual(ACCIDENT_Q[1].options.map((o) => o.v), ['not_fault', 'my_fault', 'unsure']);
  assert.deepEqual(VEHICLE_Q[0].options.map((o) => o.v), ['drivable', 'not_safe', 'unsure']);
  // The drivable question carries its safety note.
  assert.match(VEHICLE_Q[0].help!, /avoid driving it/);
});

test('two answers end the flow, and "no accident" takes precedence over "my fault"', () => {
  assert.equal(isDeadEnd({}), false);
  assert.equal(isDeadEnd({ had_accident: 'yes', fault: 'not_fault' }), false);
  assert.equal(isDeadEnd({ had_accident: 'yes', fault: 'unsure' }), false);
  assert.equal(isDeadEnd({ had_accident: 'no' }), true);
  assert.equal(isDeadEnd({ had_accident: 'yes', fault: 'my_fault' }), true);
  // Both true: the no-accident copy wins, as in 1.0.
  assert.match(deadEndContent({ had_accident: 'no', fault: 'my_fault' }, PHONE).intro, /have not had a road traffic accident/);
  assert.match(deadEndContent({ had_accident: 'yes', fault: 'my_fault' }, PHONE).intro, /unable to deal with fault claims/);
});

test('a dead end offers the phone, never a claim CTA', () => {
  for (const answers of [{ had_accident: 'no' }, { had_accident: 'yes', fault: 'my_fault' }]) {
    const c = deadEndContent(answers, PHONE);
    assert.match(c.linkHref, /^tel:\+44/);
    assert.match(c.linkLabel, /^call us on /);
  }
});

test('answers reach the dataLayer under the keys GTM reads', () => {
  const dl = answersForDataLayer({ had_accident: 'yes', fault: 'not_fault', drivable: 'drivable', replacement: 'yes' });
  assert.deepEqual(dl, {
    involved_in_accident: 'Yes, I’ve had an accident',
    accident_fault: 'No, it was not my fault',
    vehicle_drivable: 'Yes, I can safely drive',
    needs_replacement_vehicle: 'Yes',
  });
  // An unanswered question is null, not missing, so the container reads consistently.
  assert.deepEqual(answersForDataLayer({}), { involved_in_accident: null, accident_fault: null, vehicle_drivable: null, needs_replacement_vehicle: null });
});

test('contact validation is 1.0’s: UK mobile, 11 digits, starting 07', () => {
  assert.equal(sanitizePhone(' 07700 900123 '), '07700900123');
  assert.equal(sanitizePhone('x'.repeat(50)), '');
  const ok = validateContact({ name: 'Test Person', phone: '07700900123', email: 'a@b.co' });
  assert.deepEqual(ok, { name: null, phone: null, email: null });
  assert.match(validateContact({ name: '', phone: '', email: '' }).name!, /required/);
  assert.match(validateContact({ name: 'A', phone: '0170090012', email: 'a@b.co' }).phone!, /11 digits/);
  assert.match(validateContact({ name: 'A', phone: '01700900123', email: 'a@b.co' }).phone!, /start with 07/);
  assert.match(validateContact({ name: 'A', phone: '07700900123', email: 'nope' }).email!, /valid email/);
});

test('only a photo on our own blob store is accepted', () => {
  assert.equal(isVehiclePhotoUrl('https://abc.public.blob.vercel-storage.com/vehicle-photos/mcd2/photo-x.jpg'), true);
  assert.equal(isVehiclePhotoUrl('https://evil.example.com/x.jpg'), false);
  assert.equal(isVehiclePhotoUrl('http://abc.public.blob.vercel-storage.com/x.jpg'), false);
  assert.equal(isVehiclePhotoUrl(null), false);
});
