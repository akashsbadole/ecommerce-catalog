"use client";

import { useState, useEffect } from "react";
import type { PageBlock } from "./page-blocks";
import { normalizePageBlocks } from "./page-blocks";

/**
 * Fetches a CMS ContentPage by slug and returns its parsed blocks.
 * Falls back to null if not found (caller should provide defaults).
 */
export function useContentPage(slug: string) {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/content-pages?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (cancelled) return;
        const pages: {
          id: string;
          slug: string;
          title: string;
          blocks: string;
        }[] = data.contentPages ?? [];
        const page = pages[0];
        if (!page) {
          // Not found — attempt to seed the page
          try {
            const seedRes = await fetch("/api/content-pages/seed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug }),
            });
            if (seedRes.ok) {
              const seedData = await seedRes.json();
              const found = seedData.results?.find(
                (r: { slug: string; status: string }) =>
                  r.slug === slug && r.status === "created",
              );
              if (found) {
                // Re-fetch after seeding
                const refetch = await fetch(
                  `/api/content-pages?slug=${encodeURIComponent(slug)}`,
                  { cache: "no-store" },
                );
                if (refetch.ok) {
                  const refetchData = await refetch.json();
                  const refetchedPage = (refetchData.contentPages ?? [])[0];
                  if (refetchedPage) {
                    const parsed = normalizePageBlocks(refetchedPage.blocks);
                    if (!cancelled) {
                      setBlocks(parsed.length > 0 ? parsed : null);
                      setLoading(false);
                      return;
                    }
                  }
                }
              }
            }
          } catch {
            // seeding failed, fall through to null
          }
          if (!cancelled) {
            setBlocks(null);
            setLoading(false);
          }
          return;
        }
        const parsed = normalizePageBlocks(page.blocks);
        if (!cancelled) {
          setBlocks(parsed.length > 0 ? parsed : null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setBlocks(null);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { blocks, loading };
}

/**
 * Extracts the first block of a given type from an array of blocks.
 */
export function getBlockData(
  blocks: PageBlock[] | null,
  type: string,
): Record<string, unknown> | null {
  if (!blocks) return null;
  const block = blocks.find((b) => b.type === type);
  return block?.data ?? null;
}

export function getPageContentData(
  blocks: PageBlock[] | null,
  type: string,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  return getBlockData(blocks, type) ?? fallback;
}
