"use client";

import { getOptimizedUrl, getSrcSet, getResponsiveSizes } from "@/lib/images";

interface StoreImgProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes"
> {
  src: string;
  widths?: number[];
  sizes?: string;
}

export function StoreImg({
  src,
  widths = [400, 800, 1200],
  sizes,
  loading = "lazy",
  ...rest
}: StoreImgProps) {
  return (
    <img
      src={getOptimizedUrl(src, 800)}
      srcSet={getSrcSet(src, widths) || undefined}
      sizes={
        getSrcSet(src, widths) ? (sizes ?? getResponsiveSizes()) : undefined
      }
      loading={loading}
      {...rest}
    />
  );
}
