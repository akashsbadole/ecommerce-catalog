import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductClientPage } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDescription: true, shortDescription: true, ogImage: true },
  });

  if (!product) {
    return { title: "Product" };
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || "",
    ...(product.ogImage
      ? { openGraph: { images: [{ url: product.ogImage }] } }
      : {}),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductClientPage slug={slug} />;
}
