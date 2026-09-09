export type RouteSnapshot = { status: number; html: string; css: string };
export type Snapshot = { site: string; routes: Record<string, RouteSnapshot>; assets: Record<string, string> };
export type KnownRoutes = { siteId: string; pages: string[] };
export function siteRoutes(known?: KnownRoutes): Promise<{ siteId: string; html: string[]; other: string[] }>;
export function cssRules(css: string): string;
export function snapshotFile(site: string): string;
export function snapshotRoutes(base: string, opts?: { keepHtml?: boolean; known?: KnownRoutes }): Promise<{ site: string; snapshot: Snapshot; pages: Record<string, string>; css: Map<string, string> }>;
