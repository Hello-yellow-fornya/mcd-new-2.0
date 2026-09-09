'use client';

import { useEffect } from 'react';
import { rememberCampaign } from '@/lib/campaign';

/**
 * Records the UTM parameters and click id the visitor arrived with, so the
 * claim they start later carries them (src/lib/campaign.ts). Renders nothing
 * and runs on every page: a paid click can land anywhere, and the landing page
 * is not always where the claim is submitted.
 */
export function CampaignCapture() {
  useEffect(() => {
    rememberCampaign();
  }, []);
  return null;
}
