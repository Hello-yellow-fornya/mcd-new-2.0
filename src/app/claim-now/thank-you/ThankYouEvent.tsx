'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/analytics';

/** Fires the form conversion once (appendix §8). */
export function ThankYouEvent() {
  const params = useSearchParams();
  useEffect(() => {
    track('claim_submitted', { ref: params.get('ref') ?? undefined });
  }, [params]);
  return null;
}
