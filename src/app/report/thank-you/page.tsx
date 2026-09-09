import type { Metadata } from 'next';
import { ReportThanks } from '@site/report';

export const metadata: Metadata = {
  title: 'Report received',
  robots: { index: false, follow: false },
  alternates: { canonical: '/report/thank-you/' },
};

/** The thank-you route the report form sends the visitor to. Fires the conversion; not indexed. */
export default function Route() {
  return <ReportThanks />;
}
