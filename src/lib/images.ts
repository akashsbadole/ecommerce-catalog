const CLOUDINARY_REGEX =
  /https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;
const CLOUDINARY_UPLOAD_REGEX =
  /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)/;

export function isCloudinaryUrl(url: string): boolean {
  return CLOUDINARY_REGEX.test(url);
}

export function getOptimizedUrl(url: string, width: number): string {
  if (!isCloudinaryUrl(url)) return url;
  const match = url.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) return url;
  const [, base, rest] = match;
  const transformation = `w_${width},q_auto,f_auto`;
  return `${base}${transformation}/${rest}`;
}

export function getSrcSet(
  url: string,
  widths: number[] = [400, 800, 1200],
): string {
  if (!isCloudinaryUrl(url)) return "";
  return widths.map((w) => `${getOptimizedUrl(url, w)} ${w}w`).join(", ");
}

export function getResponsiveSizes(defaultSize = "100vw"): string {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${defaultSize}`;
}

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  widths?: number[];
  sizes?: string;
  loading?: "lazy" | "eager";
}

export function responsiveImageProps(
  src: string,
  widths?: number[],
  sizes?: string,
): { src: string; srcSet: string; sizes: string } {
  return {
    src: getOptimizedUrl(src, widths?.[0] ?? 800),
    srcSet: getSrcSet(src, widths),
    sizes: sizes ?? getResponsiveSizes(),
  };
}
