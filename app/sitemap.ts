import { MetadataRoute } from "next";
// import { getAllMergedSlugsAndBrands } from "@/lib/devices";
// import { getAllPhoneSlugs } from "@/lib/phones";
import { getAllBrands } from "@/lib/phones";
import { getAllBlogSlugs } from "@/lib/blog";
import { getAllBudgetSlugs } from "@/lib/budget-pages";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://gadgetpricebd.vercel.app";

const MAX_URLS = 1000;
const LIMIT = 300;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${BASE}/phones`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${BASE}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE}/tablets`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  },
  {
    url: `${BASE}/watches`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  },
  {
    url: `${BASE}/compare`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

let _cachedEntries: MetadataRoute.Sitemap | null = null;

async function buildAllEntries(): Promise<MetadataRoute.Sitemap> {
  if (_cachedEntries) return _cachedEntries;

  // Phone slugs disabled for now to reduce load
  // let phoneSlugs: string[] = [];
  // try {
  //   const { slugs } = await getAllMergedSlugsAndBrands();
  //   phoneSlugs = slugs;
  // } catch {
  //   phoneSlugs = getAllPhoneSlugs();
  // }

  const brands = getAllBrands();
  const budgetSlugs = getAllBudgetSlugs();

  let blogSlugs: string[] = [];
  try {
    blogSlugs = await getAllBlogSlugs();
  } catch {
    // blog may fail at build, ignore safely
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
  ].slice(0, LIMIT);

  return _cachedEntries;
}

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