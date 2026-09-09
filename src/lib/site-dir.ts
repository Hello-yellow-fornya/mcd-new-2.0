import { join } from 'node:path';
import { siteId } from './site-id.ts';

/** The site's folder on disk (server and scripts only): sites/<id>/ with content/, landing/ and the rest. */
export const siteDir = join(process.cwd(), 'sites', siteId);
