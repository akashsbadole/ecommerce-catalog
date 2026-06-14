import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getStoreId, scopedWhere } from "@/lib/store-db";

const insensitive = { mode: "insensitive" as const };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const storeId = searchParams.get("storeId") || getStoreId(request);

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], categories: [], blogPosts: [] });
    }

    const limit = 5;
    const ilike = `%${q}%`;

    const [products, categories, blogPosts] = await Promise.all([
      db.product.findMany({
        where: scopedWhere(
          {
            isActive: true,
            deletedAt: null,
            OR: [
              { name: { contains: q, ...insensitive } },
              { sku: { contains: q, ...insensitive } },
            ],
          },
          storeId,
        ),
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          Category: { select: { id: true, name: true, slug: true } },
        },
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      }),

      db.category.findMany({
        where: scopedWhere(
          {
            isActive: true,
            deletedAt: null,
            name: { contains: q, ...insensitive },
          },
          storeId,
        ),
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { Product: { where: { isActive: true, deletedAt: null } } } },
        },
        take: limit,
        orderBy: { name: "asc" },
      }),

      db.blogPost.findMany({
        where: scopedWhere(
          {
            deletedAt: null,
            isPublished: true,
            OR: [
              { title: { contains: q, ...insensitive } },
              { tags: { contains: q, ...insensitive } },
            ],
          },
          storeId,
        ),
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
        },
        take: limit,
        orderBy: { publishedAt: "desc" },
      }),
    ]);

    return NextResponse.json({ products, categories, blogPosts });
  } catch (error) {
    console.error("Autocomplete search error:", error);
    return NextResponse.json(
      { products: [], categories: [], blogPosts: [] },
      { status: 500 },
    );
  }
}
