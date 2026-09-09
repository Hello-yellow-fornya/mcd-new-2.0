import type { Metadata } from 'next';
import { ReportPage } from '@site/report';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `Report your accident | ${site.name}` },
  description: 'Report your accident online in two minutes, whoever was at fault, or call 0800 048 0048 and a person in the UK picks up.',
  alternates: { canonical: '/report/' },
};

/** /report/ (Claims Report Line): the report form as a full page. On other sites the route is not found. */
export default function Route() {
  return <ReportPage />;
}
