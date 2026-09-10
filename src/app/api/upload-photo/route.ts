import { put } from '@vercel/blob';
import { site } from '@/lib/site';

/**
 * The optional vehicle-damage photo from the claim flow's photo step, stored
 * on Vercel Blob; the returned URL is submitted with the contact details.
 * Duplicated from 1.0 (rta_claims app/api/upload-photo/route.js).
 *
 * The client downscales before uploading (prepareVehiclePhoto in
 * src/lib/claim-flow/useClaimFlow.ts), so most uploads arrive well under 1MB;
 * the cap here is a backstop for originals that could not be re-encoded, kept
 * under Vercel's 4.5MB request-body limit.
 *
 * Auth: the SDK authenticates via OIDC when BLOB_STORE_ID is set (paired with
 * VERCEL_OIDC_TOKEN, which Vercel injects and rotates per deployment, nothing
 * to configure), falling back to a static BLOB_READ_WRITE_TOKEN. When neither
 * is present -- no store connected yet -- this answers 503 and the flow treats
 * the step as skippable-only, which is why the photo step ships before the
 * store does.
 */
export const runtime = 'nodejs';

const MAX_BYTES = 4 * 1024 * 1024;

/** Extension for the stored blob name, from the MIME type: cosmetic, but keeps the store browsable. */
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

function jsonError(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return jsonError(503, 'Photo uploads are not configured.');
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return jsonError(400, 'No photo received.');
  if (!file.type.startsWith('image/')) return jsonError(415, 'Only photos can be uploaded.');
  if (file.size === 0) return jsonError(400, 'That file appears to be empty.');
  if (file.size > MAX_BYTES) return jsonError(413, 'That photo is too large — please choose one under 4MB.');

  const ext = EXT[file.type] || 'img';

  try {
    // addRandomSuffix makes the stored URL unguessable, which is the access
    // model: the blob is public but only reachable via the link on the lead.
    const blob = await put(`vehicle-photos/${site.source}/photo.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });
    return Response.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('[upload-photo] blob upload failed', err);
    return jsonError(500, 'Upload failed, please try again.');
  }
}
