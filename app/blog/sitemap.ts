import { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";
const MAX_URLS = 5000;

async function getBlogSlugs(): Promise<string[]> {
  try {
    return await getAllBlogSlugs();
  } catch {
    return [];
  }
}

export async function generateSitemaps() {
  const slugs = await getBlogSlugs();
  if (slugs.length === 0) return [];
  const count = Math.ceil(slugs.length / MAX_URLS);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const slugs = await getBlogSlugs();
  const start = id * MAX_URLS;
  const page = slugs.slice(start, start + MAX_URLS);

  return page.map((s) => ({
    url: `${BASE}/blog/${s}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}
