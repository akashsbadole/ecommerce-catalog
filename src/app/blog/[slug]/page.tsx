import type { Metadata } from "next";
import { db } from "@/lib/db";
import { BlogPostClientPage } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findFirst({
    where: { slug },
    select: { title: true, metaTitle: true, metaDescription: true, ogImage: true },
  });

  if (!post) {
    return { title: "Blog Post" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || "",
    ...(post.ogImage
      ? { openGraph: { images: [{ url: post.ogImage }] } }
      : {}),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClientPage slug={slug} />;
}
