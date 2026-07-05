"use client";

import { useQuery } from "@tanstack/react-query";
import type { PageBlock } from "./page-blocks";
import { normalizePageBlocks } from "./page-blocks";

interface ContentPageMeta {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

interface CmsPageResult {
  blocks: PageBlock[] | null;
  meta: ContentPageMeta | null;
}

export function useCmsPageData(slug: string) {
  return useQuery<CmsPageResult>({
    queryKey: ["cms-page", slug],
    queryFn: async () => {
      const res = await fetch(
        `/api/content-pages?slug=${encodeURIComponent(slug)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return { blocks: null, meta: null };
      const data = await res.json();
      const pages: {
        id: string;
        slug: string;
        title: string;
        blocks: string;
        metaTitle: string | null;
        metaDescription: string | null;
        ogImage: string | null;
      }[] = data.contentPages ?? [];
      const page = pages[0];
      if (!page) return { blocks: null, meta: null };
      return {
        meta: {
          title: page.title || "",
          metaTitle: page.metaTitle || null,
          metaDescription: page.metaDescription || null,
          ogImage: page.ogImage || null,
        },
        blocks: normalizePageBlocks(page.blocks),
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
