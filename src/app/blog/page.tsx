import type { Metadata } from "next";
import { BlogClientPage } from "./client";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest articles, news, and updates from Purva Bites.",
  openGraph: {
    title: "Blog",
    description: "Read the latest articles, news, and updates from Purva Bites.",
  },
};

export default function Page() {
  return <BlogClientPage />;
}
