export const PLATFORM_PAGE_SLUGS = new Set([
  'homepage',
  'about-us',
  'manufacturing',
  'contact',
  'products', // Products/category pages
]);

export function isPlatformPage(slug: string): boolean {
  return PLATFORM_PAGE_SLUGS.has(slug);
}

export function isDefaultBlocks(blocks: string, slug: string): boolean {
  if (!blocks || blocks === '[]') return true;
  if (!isPlatformPage(slug)) return false;
  return false;
}
