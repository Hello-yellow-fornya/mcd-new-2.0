'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { readCampaign } from '@/lib/campaign';
import { validateContact, sanitizePhone, type Contact } from '@/lib/validators';
import { ACCIDENT_Q, VEHICLE_Q, answersForDataLayer, type Answers } from './questions';

/**
 * The claim flow's state machine, duplicated from 1.0 (rta_claims
 * components/claim-flow.jsx useClaimFlow) so both sites behave identically:
 * the same steps, the same validation, the same photo handling, the same
 * events. What differs is where a submission goes -- 1.0 runs a server action
 * into its own database, CRM and lead email; this site has no claims service,
 * so it posts to /api/claim-submit/, which forwards to the shared 1.0 claims
 * API with source "mcd2".
 */

/** Longest edge and JPEG quality the photo is re-encoded to before upload. */
const PHOTO_MAX_DIM = 1600;
const PHOTO_JPEG_QUALITY = 0.82;
/** Backstop when re-encoding is not possible; mirrors the server-side cap. */
const PHOTO_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type PhotoState = { status: 'empty' | 'uploading' | 'done' | 'error'; url: string | null; previewUrl: string | null; error: string | null };

/**
 * Downscales and re-encodes the chosen photo on-device. Returns a JPEG blob,
 * or null when the browser cannot decode the file (HEIC outside Safari), in
 * which case the caller uploads the original.
 */
async function prepareVehiclePhoto(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', PHOTO_JPEG_QUALITY));
    // A re-encode that comes out bigger than the original is not worth keeping.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return null;
  }
}

/** `reg` and `ref` come from the reg box that precedes the flow on /claim-now/. */
export function useClaimFlow({ reg, claimRef }: { reg?: string; claimRef?: string } = {}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  // `website` is the honeypot: rendered invisibly, never filled by people.
  const [contact, setContact] = useState<Contact>({ name: '', phone: '', email: '', website: '' });
  const [contactTouched, setContactTouched] = useState<Record<string, boolean>>({});
  const [formStarted, setFormStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoState>({ status: 'empty', url: null, previewUrl: null, error: null });
  // Increments on every pick or removal so a slow upload that finishes after
  // the user replaced or removed the photo cannot clobber the newer state.
  const photoAttempt = useRef(0);

  const totalSteps = 4;

  // form_start fires once, on the first answer to any question.
  const setAns = (id: string, v: string) => {
    if (!formStarted) {
      track('form_start', { form_location: 'claim-now' });
      setFormStarted(true);
    }
    setAnswers((a) => ({ ...a, [id]: v }));
  };
  // Phone is sanitised on every keystroke so non-numeric input never reaches state.
  const setCon = (k: keyof Contact, v: string) => setContact((c) => ({ ...c, [k]: k === 'phone' ? sanitizePhone(v) : v }));
  const touchCon = (k: string) => setContactTouched((t) => ({ ...t, [k]: true }));

  const accDone = ACCIDENT_Q.every((q) => answers[q.id]);
  const vehDone = VEHICLE_Q.every((q) => answers[q.id]);
  const contactErrors = validateContact(contact);
  const conDone = !contactErrors.name && !contactErrors.phone && !contactErrors.email;

  const clearPhoto = () => {
    photoAttempt.current += 1;
    setPhoto((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      return { status: 'empty', url: null, previewUrl: null, error: null };
    });
  };

  const addPhoto = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      clearPhoto();
      setPhoto((p) => ({ ...p, status: 'error', error: 'Please choose a photo (JPG, PNG or HEIC).' }));
      return;
    }
    const attempt = ++photoAttempt.current;
    const previewUrl = URL.createObjectURL(file);
    setPhoto((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      return { status: 'uploading', url: null, previewUrl, error: null };
    });

    // Ignores results from superseded attempts.
    const settle = (state: Partial<PhotoState>) => {
      if (photoAttempt.current !== attempt) return;
      setPhoto((p) => ({ ...p, ...state }));
    };

    try {
      const blob = (await prepareVehiclePhoto(file)) || file;
      if (blob.size > PHOTO_MAX_UPLOAD_BYTES) {
        settle({ status: 'error', error: 'That photo is too large to upload — please choose one under 4MB.' });
        return;
      }
      const body = new FormData();
      body.append('file', blob === file ? file : new File([blob], 'vehicle-photo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/upload-photo/', { method: 'POST', body });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (res.ok && data?.url) settle({ status: 'done', url: data.url, error: null });
      else settle({ status: 'error', error: data?.error || 'Upload failed — you can try again or skip this step.' });
    } catch {
      settle({ status: 'error', error: 'Upload failed — you can try again or skip this step.' });
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    if (submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/claim-submit/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers,
          reg,
          ref: claimRef,
          ...contact,
          vehiclePhotoUrl: photo.status === 'done' ? photo.url : null,
          // The campaign the visitor arrived with, for a paid click (src/lib/campaign.ts).
          campaign: readCampaign() ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; ref?: string; error?: string } | null;
      if (res.ok && data?.ok) {
        track('generate_lead', { form_location: 'claim-now', ref: data.ref, ...answersForDataLayer(answers) });
        // The thank-you route is the conversion trigger, so the flow ends by
        // going there rather than swapping itself for a panel.
        router.push(`/claim-now/thank-you/?ref=${encodeURIComponent(data.ref ?? claimRef ?? '')}`);
        return;
      } else {
        setSubmitError(data?.error || 'Submission failed, please try again.');
      }
    } catch {
      setSubmitError('Could not submit, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    answers,
    contact,
    setAns,
    setCon,
    touchCon,
    contactTouched,
    contactErrors,
    accDone,
    vehDone,
    conDone,
    photo,
    addPhoto,
    clearPhoto,
    next,
    back,
    submit,
    submitting,
    submitError,
    totalSteps,
  };
}

export type ClaimFlow = ReturnType<typeof useClaimFlow>;
