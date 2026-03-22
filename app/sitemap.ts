import { MetadataRoute } from "next";
import { getAllMergedSlugsAndBrands } from "@/lib/devices";
import { getAllPhoneSlugs, getAllBrands } from "@/lib/phones";
import { getAllBlogSlugs } from "@/lib/blog";
import { getAllBudgetSlugs } from "@/lib/budget-pages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadgetpricebd.vercel.app";
const MAX_URLS = 5000;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/phones`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
  { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
  { url: `${BASE}/tablets`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
  { url: `${BASE}/watches`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
  { url: `${BASE}/compare`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
];

let _cachedEntries: MetadataRoute.Sitemap | null = null;

async function buildAllEntries(): Promise<MetadataRoute.Sitemap> {
  if (_cachedEntries) return _cachedEntries;
  // let phoneSlugs: string[] = [];
  // try {
  //   const { slugs } = await getAllMergedSlugsAndBrands();
  //   phoneSlugs = slugs;
  // } catch {
  //   phoneSlugs = getAllPhoneSlugs();
  }

  const brands = getAllBrands();
  const budgetSlugs = getAllBudgetSlugs();

  let blogSlugs: string[] = [];
  try {
    blogSlugs = await getAllBlogSlugs();
  } catch {
    // ignore – blog may be unavailable at build time
  }

  _cachedEntries = [
    ...STATIC_PAGES,
    ...brands.map((b) => ({
      url: `${BASE}/brands/${b}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...budgetSlugs.map((b) => ({
      url: `${BASE}/phones/budget/${b}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogSlugs.map((s) => ({
      url: `${BASE}/blog/${s}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
  return _cachedEntries;
}

/**
 * generateSitemaps turns the root /sitemap.xml into a proper sitemap index,
 * with each chunk containing up to MAX_URLS entries. This lets Google discover
 * every phone, brand, budget page, and blog post from a single entry point.
 */
export async function generateSitemaps() {
  const all = await buildAllEntries();
  const count = Math.max(1, Math.ceil(all.length / MAX_URLS));
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const all = await buildAllEntries();
  return all.slice(id * MAX_URLS, (id + 1) * MAX_URLS);
}
