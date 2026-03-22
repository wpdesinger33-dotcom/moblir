import { MetadataRoute } from "next";
import { getAllPhoneSlugs } from "@/lib/phones";
import { getAllMergedSlugsAndBrands } from "@/lib/devices";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";
const MAX_URLS = 5000;

async function getPhoneSlugs(): Promise<string[]> {
  try {
    const { slugs } = await getAllMergedSlugsAndBrands();
    return slugs;
  } catch {
    return getAllPhoneSlugs();
  }
}

export async function generateSitemaps() {
  const slugs = await getPhoneSlugs();
  const count = Math.ceil(slugs.length / MAX_URLS);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPhoneSlugs();
  const start = id * MAX_URLS;
  const page = slugs.slice(start, start + MAX_URLS);

  return page.map((s) => ({
    url: `${BASE}/phones/${s}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
