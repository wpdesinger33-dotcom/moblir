import { MetadataRoute } from "next";
import { getAllBudgetSlugs } from "@/lib/budget-pages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";
const MAX_URLS = 5000;

export function generateSitemaps() {
  const slugs = getAllBudgetSlugs();
  const count = Math.ceil(slugs.length / MAX_URLS);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default function sitemap({
  id,
}: {
  id: number;
}): MetadataRoute.Sitemap {
  const slugs = getAllBudgetSlugs();
  const start = id * MAX_URLS;
  const page = slugs.slice(start, start + MAX_URLS);

  return page.map((b) => ({
    url: `${BASE}/phones/budget/${b}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
