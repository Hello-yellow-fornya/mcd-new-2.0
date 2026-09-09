'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/analytics';
import { readCampaign } from '@/lib/campaign';

/**
 * Fires the form conversion once (appendix §8). This route is the conversion
 * trigger for the PPC landing page too, so the event carries the campaign the
 * visitor arrived with: Google Ads needs the gclid to attribute the click.
 */
export function ThankYouEvent() {
  const params = useSearchParams();
  useEffect(() => {
    const c = readCampaign();
    track('claim_submitted', {
      ref: params.get('ref') ?? undefined,
      gclid: c?.gclid,
      utm_source: c?.utm_source,
      utm_medium: c?.utm_medium,
      utm_campaign: c?.utm_campaign,
      landing_page: c?.landing,
    });
  }, [params]);
  return null;
}
