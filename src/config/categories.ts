/** Article categories. Slugs are derived from names (see lib/content.ts). */
export const CATEGORIES = ['Productivity and Systems', 'Web Development'] as const;
export type Category = (typeof CATEGORIES)[number];
