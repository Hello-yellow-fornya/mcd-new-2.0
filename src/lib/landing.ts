import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateLanding, type LandingConfig } from './landing-config.ts';

const dir = join(process.cwd(), 'src', 'data', 'landing');

/** Every insurer landing page: one JSON file each in src/data/landing/. */
export function getLandingConfigs(): LandingConfig[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => validateLanding(JSON.parse(readFileSync(join(dir, f), 'utf8')), f))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getLanding(slug: string): LandingConfig | undefined {
  return getLandingConfigs().find((c) => c.slug === slug);
}
